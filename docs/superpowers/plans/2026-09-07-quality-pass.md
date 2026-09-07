# P0+P1 App Quality Pass Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix all broken navigation and dead flows, delete legacy duplicate screens, add signup role picker with route guards, and sweep P1 quality (validation, loading/error/empty states, toasts, logs) — mobile only, no backend changes.

**Architecture:** Sequential tasks on one branch. Task 1 repairs every dead route push and registers real routes. Task 2 resurrects dead flows using store functions that already exist. Task 3 deletes legacy files and rewires their last references. Task 4 adds role selection at signup plus group-layout guards. Task 5 sweeps validation, async feedback, toasts, and debug logs. Task 6 verifies everything statically and hands device testing to the human.

**Tech Stack:** Expo SDK 57, expo-router, zustand stores, twrnc, TypeScript strict.

## Global Constraints

- Mobile repo only (`traveazi-mobile/`): read the backend to match contracts, never modify it.
- No test suite exists (`npx jest --passWithNoTests` exits 0) — verification per task is `npx tsc --noEmit`, `npx expo-doctor@latest`, `npx expo export -p web`.
- Stay on Expo Go: no native modules, no config plugins, no `ios/`/`android/` dirs.
- Do not touch booking payload shapes and do not "fix" the `pickupAddress`/`dropoffAddress` assignment in `(passenger)/confirmRide` — out of scope.
- Where no backend endpoint exists, build UI against the existing store data and mark gaps; do not invent API contracts.
- Every task ends with its own commit; stage only that task's files.

---

### Task 1: Fix broken navigation and register routes

**Files:**
- Modify: `app/(auth)/index.tsx:126`, `app/signin/login.tsx:64`, `app/(passenger)/confirmRide/[id].tsx:73-76`, `app/(driver)/index.tsx:115,163,252`, `app/(driver)/[id]/startRide.tsx:51,186,193,400`, `app/(driver)/manageRide/[id].tsx:32`, `app/(driver)/vehicle.tsx:117`, `app/(schedule)/index.tsx:52,113`, `app/(schedule)/_layout.tsx:7`, `app/_layout.tsx:80-86`, `components/Search.tsx:100`
- Explicitly NOT touched: `app/authIndex.tsx` (deleted in Task 3)

**Interfaces:**
- Consumes: nothing (first task)
- Produces: every push/Link target resolves to a real route file

- [ ] **Step 1: Apply these exact retargets (read each file first)**

```tsx
// app/(auth)/index.tsx:126
router.push('/signup') → router.push('/(auth)/signup')
// app/signin/login.tsx:64 ("Create one" self-loop → signup entry)
<Link href="/signin/login"> → <Link href="/">
// app/(passenger)/confirmRide/[id].tsx:73-76
pathname: '/payRide/[id]' → pathname: '/(passenger)/payRide/[id]'
// app/(driver)/index.tsx:163
router.push(`/${rider._id}/startRide`) → router.push(`/(driver)/${rider._id}/startRide`)
// app/(driver)/index.tsx:115
<Link href="/vehicle"> → <Link href="/(driver)/vehicle">
// app/(driver)/index.tsx:252
route.push("/create") → route.push("/(driver)/create")
// app/(driver)/[id]/startRide.tsx:51,400
router.push(`/manageRide/${id}`) → router.push(`/(driver)/manageRide/${id}`)
// app/(driver)/[id]/startRide.tsx:186,193
<Link href="/vehicle"> → <Link href="/(driver)/vehicle">  (both occurrences)
// app/(driver)/manageRide/[id].tsx:32
router.push('/destination') → router.push('/(driver)/destination')
// app/(driver)/vehicle.tsx:117
route.push('/addVehicle') → route.push('/(driver)/addVehicle')
// app/(schedule)/index.tsx:52,113
route.push(`/scheduleResult`) → route.push(`/(schedule)/scheduleResult`)
// components/Search.tsx:100
<Link href="/(passenger)"> → <Link href="/(passenger)/home">
```

- [ ] **Step 2: Fix layouts**

In `app/(schedule)/_layout.tsx:7`, delete the `<Stack.Screen name="[id]"/>` line (no such file exists).
In `app/_layout.tsx:80-86`, add `<Stack.Screen>` entries for `signin`, `register`, and `transitRide/[id]`. Do NOT add `confirmRide/[id]`, `rideDetails/[id]`, or `tripHistory/*` (deleted in Task 3) and do NOT add `authIndex` (deleted in Task 3).

- [ ] **Step 3: Verify**

Run: `npx tsc --noEmit` — Expected: exit 0.
Run: `npx expo export -p web --output-dir /tmp/quality-t1` — Expected: export succeeds listing all routes.

- [ ] **Step 4: Commit**

```bash
git add app/\(auth\)/index.tsx app/signin/login.tsx "app/(passenger)/confirmRide/[id].tsx" "app/(driver)/index.tsx" "app/(driver)/[id]/startRide.tsx" "app/(driver)/manageRide/[id].tsx" "app/(driver)/vehicle.tsx" "app/(schedule)/index.tsx" "app/(schedule)/_layout.tsx" app/_layout.tsx components/Search.tsx
git commit -m "fix: retarget dead navigation pushes to real routes"
```

---

### Task 2: Resurrect dead flows

**Files:**
- Modify: `app/(passenger)/payRide/[id].tsx` (COOMPLETED typo ~line 387; wire `handlePay`), `app/(driver)/[id]/startRide.tsx` (accept/reject `showRej` gate ~lines 313-372), `app/(passenger)/history.tsx` (fetch on mount), `app/(schedule)/index.tsx` + `app/(schedule)/scheduleResult.tsx` (real search), `app/(driver)/create.tsx` (coords + vehicleId + price), `app/(passenger)/confirmRide/[id].tsx` (cancel path)
- Read-only: `store/driverStore.tsx` (`createRide`, `getRideBySearch`, `getAllRides`), `store/passengerStore.tsx` (`payBookings`, `getMyBookings`, cancel fn if any), backend ride routes (contract check only)

**Interfaces:**
- Consumes: working routes from Task 1
- Produces: payment, accept/reject, history, schedule search, and ride creation actually execute against the backend

- [ ] **Step 1: Payment (`app/(passenger)/payRide/[id].tsx`)**

Fix the `status === 'COOMPLETED'` typo to `'COMPLETED'` so the Pay block renders. Read the Pay Now button and `handlePay` (which calls `payBookings`), and wire the button's `onPress` to `handlePay` with loading/disabled state while paying; keep the report/rating panel flow intact.

- [ ] **Step 2: Accept/reject (`app/(driver)/[id]/startRide.tsx`)**

Read lines ~313-372 plus the `showRej` state. Restructure the gate so Accept/Reject buttons render for PENDING passengers on first paint (the toggle-after-action pattern leaves them unreachable). Add loading/disabled during the async call and refetch the passenger list after accept/reject.

- [ ] **Step 3: History (`app/(passenger)/history.tsx`)**

Add a mount `useEffect` calling `getMyBookings()` from the passenger store, with three distinct UI states: loading spinner while pending, error message with retry on failure, empty text when the list is empty. Do not render driver-store cache here.

- [ ] **Step 4: Schedule search (`app/(schedule)/index.tsx`, `app/(schedule)/scheduleResult.tsx`)**

Read `getRideBySearch` in `store/driverStore.tsx` for its argument shape. Make Check Availability call it with the typed addresses/date/seats (validate non-empty first with a toast otherwise), navigate to `scheduleResult` with the results, and render those results there — replacing the fake 1s timer and `riderListData` mock. If `getRideBySearch`'s contract cannot be satisfied from these inputs, report NEEDS_CONTEXT instead of guessing.

- [ ] **Step 5: Create ride (`app/(driver)/create.tsx`)**

Read `createRide` in `store/driverStore.tsx` plus the backend ride-creation route (read-only) for the expected payload. Remove the hardcoded `lat: 6.5244 lon: 3.3792` for both origin and destination: if the backend geocodes addresses itself, omit coords; if it requires them, report NEEDS_CONTEXT (no new geocoding service in this task). Require `vehicleId` non-empty before submit (toast otherwise). Set `keyboardType="numeric"` on the price input and reject NaN/negative with a toast.

- [ ] **Step 6: Cancel ride (`app/(passenger)/confirmRide/[id].tsx:166`)**

Search the stores for an existing booking-cancel function. If one exists, wire Cancel Ride to it with loading state and toast feedback. If none exists, keep `route.back()` unchanged and note it in the report.

- [ ] **Step 7: Verify**

Run: `npx tsc --noEmit` — Expected: exit 0.
Run: `npx expo export -p web --output-dir /tmp/quality-t2` — Expected: export succeeds.

- [ ] **Step 8: Commit**

```bash
git add "app/(passenger)/payRide/[id].tsx" "app/(driver)/[id]/startRide.tsx" "app/(passenger)/history.tsx" "app/(schedule)/index.tsx" "app/(schedule)/scheduleResult.tsx" "app/(driver)/create.tsx" "app/(passenger)/confirmRide/[id].tsx"
git commit -m "fix: resurrect payment, accept/reject, history, search, and ride creation flows"
```

---

### Task 3: Delete legacy dupes, redirect, stub empty-states

**Files:**
- Delete: `app/confirmRide/[id].tsx`, `app/rideDetails/[id].tsx`, `app/tripHistory/tripHistory.tsx`, `app/authIndex.tsx`, `app/register/register.tsx`, `components/HomeScreen.tsx`, `components/WelcomeScreen.tsx`, `components/DropDown.tsx`, `store/vehicleStore.tsx`
- Modify: `app/(passenger)/index.tsx` (redirect), `app/(schedule)/scheduleResult.tsx` (push target from Task 2), `app/_layout.tsx` (drop `authIndex` from PUBLIC_SEGMENTS if referenced), `app/(passenger)/profile.tsx`, `app/(driver)/profile.tsx`, `app/(passenger)/favoritesDriver.tsx` (empty-state UI)
- Also remove now-dead imports in: `app/(passenger)/rides.tsx:13` (`riderListData`), `app/(driver)/vehicle.tsx:12` (`vehicelData`), `app/(passenger)/confirmRide/[id].tsx:10` (`riderListData`), `app/(passenger)/payRide/[id].tsx:5` (`riderListData`), `app/(driver)/manageRide/[id].tsx:5` (`riderListData`) — only if unused after Task 2

**Interfaces:**
- Consumes: Task 1 routes, Task 2's scheduleResult shape
- Produces: one screen per job, no dangling references

- [ ] **Step 1: Delete the 9 files**

```bash
git rm app/confirmRide/\[id\].tsx app/rideDetails/\[id\].tsx app/tripHistory/tripHistory.tsx app/authIndex.tsx app/register/register.tsx components/HomeScreen.tsx components/WelcomeScreen.tsx components/DropDown.tsx store/vehicleStore.tsx
```

First grep for imports of each deleted module (`vehicleStore`, `DropDown`, `HomeScreen`, `WelcomeScreen`, `riderList` usages in deleted files don't matter). `store/vehicleStore.tsx` has zero importers (verified); if any other deleted-file import exists elsewhere, stop and report NEEDS_CONTEXT.

- [ ] **Step 2: Redirect passenger index to home**

Replace the full contents of `app/(passenger)/index.tsx` with:

```tsx
import { Redirect } from 'expo-router';

export default function PassengerIndex() {
  return <Redirect href="/(passenger)/home" />;
}
```

(`components/Search.tsx` links to the group root, and `transitRide` returns to `/home` — both keep working.)

- [ ] **Step 3: Rewire scheduleResult push**

The Task 2 rewrite pushes results to the deleted `/rideDetails/[id]`. Change that push to the live screen `/(passenger)/confirmRide/[id]` with `params: { id }`, using the real result id field from the Task 2 search results.

- [ ] **Step 4: Layout cleanup**

In `app/_layout.tsx`, remove `authIndex` from `PUBLIC_SEGMENTS` if present. Remove any `Stack.Screen` entries pointing at deleted routes.

- [ ] **Step 5: Stub screens get real empty-states (no backend needed)**

`app/(passenger)/profile.tsx` and `app/(driver)/profile.tsx`: render the signed-in user's data from `useAuthStore` (name, email, phone, role) in a simple labeled list — replace the raw `rofile`/`DriverP` text. `app/(passenger)/favoritesDriver.tsx`: render a proper empty state ("No favorite drivers yet") instead of raw text (no favorites endpoint exists — mobile only, so no fetch).

- [ ] **Step 6: Verify**

Run: `npx tsc --noEmit` — Expected: exit 0.
Run: `grep -rn "from '@/store/vehicleStore'\|from \"@/store/vehicleStore\"\|authIndex\|rideDetails/\|tripHistory/\|confirmRide/\[id\]" app components store --include='*.tsx' --include='*.ts'` — Expected: no output except the new `confirmRide/[id]` push target from step 3.
Run: `npx expo export -p web --output-dir /tmp/quality-t3` — Expected: export succeeds (proves no dangling route references).

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "chore: delete legacy duplicate screens and dead store, redirect passenger index"
```

---

### Task 4: Role picker at signup plus group guards

**Files:**
- Modify: `app/(auth)/signup.tsx` (role selector UI), `store/authStore.tsx` (`createProfile` portalType), `app/(passenger)/_layout.tsx` + `app/(driver)/_layout.tsx` (guards)
- Read-only: `app/_layout.tsx:30-57` (existing role routing: `user?.roles?.[0]?.name` DRIVER/PASSENGER)

**Interfaces:**
- Consumes: Task 3's layout state
- Produces: users choose a role at signup; group layouts enforce it

- [ ] **Step 1: Read `createProfile` in `store/authStore.tsx`**

Note its exact argument shape (currently hardcodes `portalType: "DRIVER"` ~line 131). The role field name and the `user.roles[0].name` values (`DRIVER`/`PASSENGER`) are the contract — reuse them verbatim.

- [ ] **Step 2: Role selector in `app/(auth)/signup.tsx`**

Add two selectable role buttons (Driver / Passenger, `useState<'DRIVER' | 'PASSENGER'>`, default `'PASSENGER'`) above the Create button, styled like the existing form (twrnc). Pass the selected value as `portalType` to `createProfile`. Block submit until a role is selected only if no default is set — with the default, no extra validation is needed.

- [ ] **Step 3: Group guards**

In `app/(passenger)/_layout.tsx`: read the user from `useAuthStore`; if signed in and `roles[0].name !== 'PASSENGER'`, `router.replace('/(driver)')`. Mirror in `app/(driver)/_layout.tsx` (non-DRIVER → `router.replace('/(passenger)/home')`). Unauthenticated users keep falling through to the root guard's `/(auth)` redirect — do not duplicate that logic.

- [ ] **Step 4: Verify**

Run: `npx tsc --noEmit` — Expected: exit 0.
Run: `npx expo export -p web --output-dir /tmp/quality-t4` — Expected: export succeeds.

- [ ] **Step 5: Commit**

```bash
git add "app/(auth)/signup.tsx" store/authStore.tsx "app/(passenger)/_layout.tsx" "app/(driver)/_layout.tsx"
git commit -m "feat: role picker at signup with group route guards"
```

---

### Task 5: P1 quality sweep (validation, states, toasts, logs)

**Files:**
- Modify: `app/index.tsx`, `app/(auth)/signup.tsx`, `app/(auth)/index.tsx`, `app/signin/loginOtp.tsx`, `app/register/registerOtp.tsx`, `app/(auth)/forgotpassword.tsx`, `app/(driver)/addVehicle.tsx`, `app/(passenger)/confirmRide/[id].tsx`, `app/(passenger)/payRide/[id].tsx`, `app/transitRide/[id].tsx`, `app/(driver)/index.tsx`, `app/(driver)/vehicle.tsx`, `store/driverStore.tsx`, `store/passengerStore.tsx`, `store/authStore.tsx`
- Do NOT touch: booking payloads, the `pickupAddress`/`dropoffAddress` assignment, any file outside this list (except deleting dead imports inside these files)

**Interfaces:**
- Consumes: Tasks 1-4
- Produces: validated forms, honest loading/error/empty states, readable toasts, no PII/debug logs

- [ ] **Step 1: Form validation**

`app/index.tsx:23-24`: replace silent `if (!email) return` with an email-format check + `Toast.show` error.
`app/(auth)/signup.tsx`: require password length ≥ 6 (toast otherwise); disable the Create button while `loading` (prevent double-submit; keep the spinner).
`app/(auth)/index.tsx:28-29`: toast on empty email/password instead of silent return.
`app/signin/loginOtp.tsx:140-145`: disable Continue + show spinner while verifying (prevent double-tap); restore the countdown timer (uncomment/fix the effect at lines 27-35 so `timer` ticks from 60 and Resend re-enables at 0).
`app/register/registerOtp.tsx:27-33`: change interval effect deps `[timer]` to `[]` (stop recreating the timer every second); `:85`: do not push to `/(auth)/signup` when `success === false` — surface the error instead.
`app/(driver)/addVehicle.tsx:76-84`: validate `carYear` numeric (toast otherwise, never send NaN); drop the mandatory-`selectedFeatures` requirement to match the backend-optional field; set `keyboardType="numeric"` + `maxLength={4}` on the year input at lines 227-232.

- [ ] **Step 2: Loading/error/empty states**

`app/(passenger)/confirmRide/[id].tsx:53`, `app/(passenger)/payRide/[id].tsx:77`, `app/transitRide/[id].tsx:94-100`: on fetch failure show an error message with a Retry button instead of an infinite spinner (add an `error` state set in the catch path; retry re-runs the fetch).
`app/(driver)/index.tsx:233-244`: show the spinner only while loading; on failure show error + retry; on empty show "No rides yet".
`store/driverStore.tsx` `getAllRides` catch: add an error Toast (remove the comment) so the screen's error state has a trigger; same for `allVehicle` catch (currently `console.error` only).
`app/(driver)/vehicle.tsx:186-192`: add a spinner while `allVehicle()` is pending (track with the existing `isLoading`-style state or add one).
`app/(passenger)/confirmRide/[id].tsx:352-359`: disable the booking button + show inline spinner while `isLoading` (prevent double-booking).
`app/(driver)/addVehicle.tsx:99-112`: make `driverStore.addVehicle` return `boolean` success; navigate/clear/show-success only when true, show the error toast when false (remove the duplicate success toast — keep exactly one).

- [ ] **Step 3: Toast fixes**

`store/driverStore.tsx` `addVehicle` catch: extract a readable message (`error?.response?.data?.message ?? error?.message ?? 'Something went wrong'`) instead of toasting the raw object.
`store/authStore.tsx:241-242`: remove the "Logged in" success toast from background `userProfile` refresh.
`store/passengerStore.tsx` `getMyBookings` catch and `store/driverStore.tsx` `getRideBySearch` catch: add error toasts (keep returning the safe fallbacks `[]`/stale list).

- [ ] **Step 4: Log cleanup**

Delete these debug/PII logs (keep `console.error` in catch paths): `app/register/registerOtp.tsx:62` (OTP code), `app/(driver)/create.tsx:115,180` ("Hello one/two"), `app/(driver)/manageRide/[id].tsx:22,94` (id + user dump), `app/(driver)/[id]/startRide.tsx:32` (details dump), `app/confirmRide/[id].tsx` analog if surviving Task 3 (it won't — file deleted), `app/(driver)/addVehicle.tsx:86` (year). Leave the `__DEV__`-guarded `MapEmbed` warns and all `console.error` calls alone.

- [ ] **Step 5: Verify**

Run: `npx tsc --noEmit` — Expected: exit 0.
Run: `npx expo lint 2>&1 | grep -E "^(app|store|components)/.*error" | head -20` — Expected: no new errors in touched files (pre-existing warnings acceptable).
Run: `npx expo export -p web --output-dir /tmp/quality-t5` — Expected: export succeeds.

- [ ] **Step 6: Commit**

```bash
git add app/index.tsx "app/(auth)/signup.tsx" "app/(auth)/index.tsx" app/signin/loginOtp.tsx app/register/registerOtp.tsx "app/(auth)/forgotpassword.tsx" "app/(driver)/addVehicle.tsx" "app/(passenger)/confirmRide/[id].tsx" "app/(passenger)/payRide/[id].tsx" app/transitRide/\[id\].tsx "app/(driver)/index.tsx" "app/(driver)/vehicle.tsx" store/driverStore.tsx store/passengerStore.tsx store/authStore.tsx
git commit -m "fix: form validation, honest async states, readable toasts, drop debug logs"
```

---

### Task 6: Full verification and device handoff

**Files:**
- Modify: none
- Test: `npx tsc --noEmit`, `npx expo-doctor@latest`, `npx expo export -p web --output-dir /tmp/quality-final`, `npx jest --passWithNoTests`

**Interfaces:**
- Consumes: all files from Tasks 1-5
- Produces: green static gates plus a human device-test checklist (no commit — tree must already be clean)

- [ ] **Step 1: Confirm clean tree**

Run: `git status --short` — Expected: empty output. If not empty, stop and report NEEDS_CONTEXT (do not commit other work).

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit` — Expected: exit 0.

- [ ] **Step 3: Doctor**

Run: `npx expo-doctor@latest` — Expected: `21/21 checks passed. No issues detected!`

- [ ] **Step 4: Bundle smoke test**

Run: `npx expo export -p web --output-dir /tmp/quality-final` — Expected: export succeeds listing all routes.

- [ ] **Step 5: Tests**

Run: `npx jest --passWithNoTests` — Expected: exit 0 (no suite exists).

- [ ] **Step 6: Report the device-test checklist (do not run — human does this in Expo Go)**

1. Sign up as Passenger → lands in passenger home; sign up as Driver → lands in driver home; deep-link a driver screen as passenger (and vice versa) → bounced to own home.
2. Driver creates a ride (with vehicle selected, numeric price) → appears in driver list; passenger searches, books (single tap debounced), pays (Pay Now fires, no typo block).
3. Driver accepts a passenger → passenger appears in Start Ride; start → manage → complete chain works; history shows the trip.
4. Kill backend/fail a fetch (airplane mode on one screen): error + retry UI appears instead of infinite spinner; restore → retry succeeds.
