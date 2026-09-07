# Backend Follow-ups Design (geocode, search, payment, favorites)

**Goal:** Close the four parked backend follow-ups so schedule search, ride creation, payment, cancel, and favorites work end-to-end against real endpoints: one new geocode endpoint, mobile wiring for search/create/pay/cancel, and a small favorites feature on both sides.

**Decisions (user-approved):** single server-side geocode endpoint serving both flows (no on-device geocoding, no search-endpoint address params); payment confirms via poll-until-PAID with Paystack test keys; favorites = list + heart toggle; backend contracts are read-only inputs, mobile adapts to them.

## Architecture

Backend work is additive only: one new controller (`GeolocationController`) on the existing exported `GeolocationService`, plus one new `FavoriteDriver` collection with CRUD endpoints. No changes to rides, booking, payment, or webhook logic. Mobile work is wiring only: new store functions calling those endpoints, screens passing real values instead of hardcoded ones. The Google Maps server key never leaves the backend; the mobile Embed key stays in `.env.local`.

## Components

### 1. Geocode endpoint (backend, new)

`GET /geolocation/geocode?address=<string>`, behind the existing `AuthGuard`, in a new `GeolocationController` inside `src/modules/geolocation/` (service is already provided and exported by `GeolocationModule`; register the controller there). Returns `{ lat: number, lng: number }` from `GeolocationService.geocode()` (already country-biased to NG). Unresolvable address → 400 echoing the address (mobile toasts it verbatim). No service, schema, or DTO changes. Verify with a backend jest/supertest hit: "Ikeja, Lagos" → numeric coords; gibberish → 400.

### 2. Schedule search + ride creation (mobile)

New `geocodeAddress(address: string): Promise<{lat,lng} | null>` in `store/driverStore.tsx` (auth header like other calls; toast + null on failure). Schedule screen (`app/(schedule)/index.tsx`): on Check Availability with non-empty origin, destination, and date, geocode both inputs, then call `getRideBySearch({ origin, destination, departureDate, seatsNeeded })` (seats default 1) and render the returned rides in `scheduleResult` instead of the mock list; empty inputs or geocode failure → toast, no call. `getRideBySearch` is extended to take that params object and send it as query params (`origin[lat]`, `origin[lon]`, `destination[lat]`, `destination[lon]`, `departureDate`, `seatsNeeded`) with the auth header it currently omits. Create screen (`app/(driver)/create.tsx`): at submit, geocode both typed addresses and send the real coords alongside the addresses; the hardcoded Lagos pair is deleted. Geocode failure blocks submit with a toast (backend requires coords — never send fake ones).

### 3. Payment completion + passenger cancel (mobile)

payRide screen finds the passenger's booking for the displayed ride via `getMyBookings()` (silent) matched on ride id, then calls `payBookings(booking._id)` — never the ride id. `payBookings` returns the init payload (`authorization_url`, `reference`) without any success toast; the screen opens `authorization_url` in `expo-web-browser` (already installed), and on return polls `getMyBookings({ silent: true })` roughly every 5s up to ~60s until that booking's `paymentStatus === 'PAID'` → success UI; timeout or FAILED → error toast + retry button. The backend webhook flips the status; mobile never marks payment itself. New `passengerStore.cancelBooking(bookingId)` → `PATCH /passenger/bookings/:bookingId/cancel`, wired to confirmRide's Cancel button with loading state and toasts (replaces bare `route.back()`).

### 4. Favorites (backend + mobile)

Backend `FavoriteDriver` schema: `passenger` (User ref), `driver` (User ref), timestamps, unique compound index on `(passenger, driver)`. Endpoints (passenger-guarded, user owns the record): `GET /passenger/favorite-drivers` (each entry populated with the driver's name, avatar, and vehicle), `POST /passenger/favorite-drivers { driverId }` (idempotent — existing pair returns the record), `DELETE /passenger/favorite-drivers/:driverId`. Mobile: store functions + favorites screen renders the real list (empty state stays for zero favorites) + heart toggle on driver rows in the rides list and on the favorites list itself, with toast feedback and no double-tap (disable while pending).

## Data flow

Typed address → backend geocode → coords → existing search/create endpoints (unchanged). Booking id → pay init → Paystack browser → webhook → poll confirms PAID. Favorite toggles → CRUD endpoints → list screens. No new real-time, queue, or storage systems.

## Error handling

Every failure surfaces as a toast plus inline state where a screen is blocked (search results, submit, pay, cancel, toggle). Silent fallbacks are kept only where they already exist (booking-list polls). No raw backend objects in toasts (message extraction only). No secrets in logs; secret values stay in backend `.env`, which is never committed or printed.

## Testing

Backend `jest` for the geocode endpoint (200 + coords, 400 on gibberish, 401 without token) and favorites CRUD (auth ownership, idempotent add, unique constraint). Mobile `tsc`, `expo-doctor`, web export. Human device checklist on Paystack test keys: address search returns real rides; created ride carries non-Lagos coords; test-card payment flips to PAID in-app; cancel works; favorite toggles persist across reloads. Prerequisite the human confirms before the run: backend `.env` Paystack keys are TEST keys.

## Explicit non-goals

On-device geocoding, search-endpoint address params, driver-side booking cancel (no UI, no endpoint), rating tie-in for favorites, messaging/tracking, any change to booking payloads or the `pickupAddress`/`dropoffAddress` assignment, any backend change beyond the geocode controller and favorites feature.
