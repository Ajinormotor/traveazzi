# Google Maps Embed Design (Expo Go)

**Goal:** Replace the static map PNG backgrounds on all 19 app screens with live Google Maps embeds that stay compatible with Expo Go.

**Decisions (user-approved):** Embed API v1 with a user-created key; all 19 screens in one rollout; directions on ride screens and area view elsewhere; default center Port Harcourt; the `pickupAddress`/`dropoffAddress` swap in `(passenger)/confirmRide` is left untouched.

## Architecture

One new component, `components/MapEmbed.tsx`, wraps `react-native-webview` (13.16.1, already installed and bundled in Expo Go SDK 57 — no native changes, no config plugin). Each of the 19 screens keeps its layout and only swaps its `ImageBackground source={bg|transit_bg}` background for the map rendered behind the same content. The API key is read from `process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY`, matching the existing `EXPO_PUBLIC_API_URL` pattern in `store/authStore.tsx` and `store/passengerStore.tsx`.

## Components

### `MapEmbed` (new file: `components/MapEmbed.tsx`)

Single-purpose unit: given a mode and location inputs, render the embed, or the static fallback image.

- Props: `mode: 'view' | 'directions'` (required); `center: { lat: number; lng: number }` (default Port Harcourt `{ lat: 4.8156, lng: 7.0498 }`); `zoom: number` (default 13, view mode only); `origin: string`, `destination: string` (required for directions mode); `fallback: ImageSourcePropType` (required — the screen's current static image).
- Builds the URL with `encodeURIComponent` on every user-supplied value: view → `https://www.google.com/maps/embed/v1/view?key=KEY&center=LAT,LNG&zoom=Z`; directions → `https://www.google.com/maps/embed/v1/directions?key=KEY&origin=O&destination=D`.
- Renders `<WebView source={{ uri }} javaScriptEnabled domStorageEnabled />` filling its parent bounds. The embed iframe stays interactive (pan/zoom); existing overlaid buttons (e.g. the marker/directions buttons on `(passenger)/home.tsx`) render above it unchanged.
- Fallback rule (no placeholders, no crash states): if the key is missing/empty, or the WebView fires `onError`/`onHttpError`, render `<Image source={fallback} />` covering the same bounds. The app therefore works exactly as today until a key is configured.

### Screen wiring (19 edits, one pattern each)

Replace the `ImageBackground` background with a plain `View style={flex-1}` containing `<MapEmbed … />` positioned behind the screen's existing children (absolute fill). No layout, style, or logic changes per screen.

- Directions mode (7 screens, `origin={*.originAddress}` → `destination={*.destinationAddress}`): `app/confirmRide/[id].tsx`, `app/(passenger)/confirmRide/[id].tsx`, `app/(passenger)/payRide/[id].tsx`, `app/transitRide/[id].tsx`, `app/rideDetails/[id].tsx`, `app/(driver)/[id]/startRide.tsx`, `app/(driver)/manageRide/[id].tsx`. Guard: when either address is missing/empty, fall back to area view (never build a directions URL with an empty leg).
- Area view mode (12 screens, default center/zoom): `app/(passenger)/home.tsx`, `app/(passenger)/index.tsx`, `app/(passenger)/rides.tsx` (a list — per-ride routes do not fit), `app/(passenger)/history.tsx`, `app/(driver)/index.tsx`, `app/(driver)/vehicle.tsx`, `app/(driver)/addVehicle.tsx`, `app/(driver)/create.tsx`, `app/(driver)/destination.tsx`, `app/(schedule)/index.tsx`, `app/(schedule)/scheduleResult.tsx`, `app/tripHistory/tripHistory.tsx`.

## Data flow

Ride screens read `originAddress`/`destinationAddress` from the ride object already in scope on that screen (same fields the screens render today). No new store fields, no new API calls, no location permissions (`expo-location` is explicitly out of scope). The key flows from the Expo Go environment (`EXPO_PUBLIC_GOOGLE_MAPS_KEY`) into `MapEmbed` at render time.

## Key setup (user action, outside the codebase)

Google Cloud project → enable **Maps Embed API** → create key restricted to the iOS/Android apps → set `EXPO_PUBLIC_GOOGLE_MAPS_KEY` when starting Expo Go. Embed usage is unlimited-free; no other Google API is called.

## Error handling

Missing key, WebView load failure, offline device, or missing address leg → static image fallback in the same bounds. No error modals, no blank screens. The `pickupAddress`/`dropoffAddress` swap observed in `(passenger)/confirmRide/[id].tsx:82-83` is out of scope and unchanged.

## Testing

Agent-side: `npx tsc --noEmit` clean, `npx expo-doctor@latest` 21/21, `npx expo export -p web` bundles. Human-side (Expo Go on device): one representative screen per group — `(passenger)/home` (area view), `(passenger)/confirmRide/[id]` (directions), one screen with no key set (fallback) — plus spot-checks of the rest. Lint `react/no-unescaped-entities` findings on touched lines are fixed if introduced; pre-existing ones stay.

## Explicit non-goals

Native maps (`react-native-maps`, MapLibre, `expo-maps`), custom markers/polylines, tap-to-select, `place`/`search` embed modes, device-location centering, and any change to booking payloads or the `pickupAddress` swap.
