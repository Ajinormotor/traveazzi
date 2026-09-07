# Address Autocomplete Design (Places API via backend)

**Goal:** Typing in the schedule and ride-creation address fields shows Google Places suggestions in a dropdown; selecting one fills the field and flows into the existing geocode→submit path.

**Decisions (user-approved):** backend proxy (not mobile-direct, not WebView widget); scope is schedule origin/destination + create origin/destination only; dropdown fails silent to free text.

## Architecture

Backend extends `GeolocationService` with an `autocomplete()` method hitting Places API (New), exposed as `GET /geolocation/autocomplete?input=` on the existing `GeolocationController`. Mobile adds one reusable `components/AddressAutocomplete.tsx` plus a `driverStore.autocompleteAddress()` fetcher, then swaps the four plain `TextInput`s for it. The server Google key never leaves the backend; Expo Go compatibility is preserved (plain fetch, no native modules).

## Components

### Backend: `GeolocationService.autocomplete` + endpoint

New service method POSTs `{ input, includedRegionCodes: ['NG'] }` to `https://places.googleapis.com/v1/places:autocomplete` with headers `X-Goog-Api-Key: <server key>` and `X-Goog-FieldMask: suggestions.text.text,suggestions.placePrediction.placeId` (key read from the existing `SecretsService.googleMaps` shape). Maps the response to `[{ description, placeId }]`; unresolvable/empty predictions → `[]`, never throws for no-results (transport/auth errors propagate as 500s via the existing filter). New controller route `GET /geolocation/autocomplete?input=` behind `AuthGuard`: empty/blank input → 400; otherwise returns the array (possibly empty). No schema, DTO (inline query param), or module changes beyond the two additions.

### Mobile: `AddressAutocomplete` + store fetcher

`store/driverStore.tsx` gains `autocompleteAddress: (input: string) => Promise<Array<{ description: string; placeId: string }>>` — auth header like the other calls, `params: { input }`, failures resolve to `[]` with NO toast (per-keystroke toasts would spam). `components/AddressAutocomplete.tsx` is a controlled input with props `value: string`, `onChange: (text: string) => void`, `placeholder?: string`, `inputStyle?: any`: ~400ms debounce after 2+ characters, `ActivityIndicator` while loading, absolute-positioned dropdown list of descriptions, tap selects (calls `onChange` with the description, clears list, dismisses keyboard), tapping outside or clearing to under 2 chars hides the list. Unselected typed text submits exactly as today, so the geocode fallback path is unchanged.

### Wiring (4 inputs, behavior-preserving)

`app/(schedule)/index.tsx` origin + destination and `app/(driver)/create.tsx` origin + destination: replace each `TextInput` with `AddressAutocomplete`, passing the existing state value/setter and placeholder through; keep all surrounding layout, styles, and submit logic byte-identical.

## Error handling

Empty input → 400 before any Google call. Google errors → backend 500 via existing filter; mobile shows no dropdown (silent) and free text still submits into the geocode path, which toasts if unresolvable. No raw backend objects in toasts; no secrets in logs.

## Key and billing prerequisites (human actions)

Server Google key needs **Places API (New)** enabled (Geocoding/Embed alone is insufficient). Unlike map loads, autocomplete requests are **billed per request** — debounce plus the 2-character minimum keep volume minimal.

## Testing

Backend jest spec for the endpoint (predictions mapped to description/placeId; empty input 400; service throw → 500 path) following the geocode-controller spec pattern (mocked service, guard overridden). Mobile `tsc`, `expo-doctor`, web export. Human device check in Expo Go: type "ikeja" in schedule origin → suggestions appear → select → Check Availability returns real rides; airplane-mode typing shows no dropdown and no crash.

## Explicit non-goals

Mobile-direct Google calls, WebView widgets, sessionToken-based session billing, place-details fetching (suggestion text goes through the existing geocode path instead), Search-box autocomplete, device-location biasing, any change to booking payloads.
