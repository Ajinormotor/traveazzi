# Expo SDK 54 → 57 Upgrade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade traveazi-mobile from Expo SDK 54 to SDK 57 so it runs in current Expo Go (SDK 57).

**Architecture:** Incremental SDK upgrade 54→55→56→57 with `npx expo install --fix` at each step, removing the deleted `newArchEnabled` flag, then verifying with `expo-doctor`, TypeScript, and a cleared Metro start. No native `ios/`/`android/` dirs in repo (managed workflow), so no prebuild clean needed.

**Tech Stack:** Expo SDK 57, React Native 0.86, React 19.2.3, expo-router, pnpm/npm, Node 24.18.1

## Global Constraints

- Expo requires incremental upgrades one SDK at a time (54→55→56→57).
- SDK 55+ only supports New Architecture — `newArchEnabled` was removed from app.json schema.
- Minimum Node for SDK 57 is 22.13.x — current is v24.18.1 (OK).
- Expo Go only supports latest SDK — must end on 57.
- Do not use `--legacy-peer-deps` to hide mismatches; resolve via `npx expo install --fix`.

---

### Task 1: Pre-upgrade baseline and backup branch

**Files:**
- Modify: none (verification only)
- Test: `package.json:27` reads `expo: ~54.0.0`, `package.json:45` reads `react-native: 0.79.5`

**Interfaces:**
- Consumes: git status, `node --version`, `npx expo --version`
- Produces: clean working tree signal (or list of dirty files) for Task 2

- [ ] **Step 1: Record baseline versions**

```bash
node --version && npx expo --version
node -p "require('./package.json').dependencies.expo + ' / ' + require('./package.json').dependencies['react-native']"
```

- [ ] **Step 2: Ensure working tree is committable**

Run: `git status --short`
Expected: empty output, or a short list you commit/stash before upgrading so `git diff -- package.json` in Task 5 shows only upgrade changes.

- [ ] **Step 3: Create upgrade checkpoint branch**

```bash
git checkout -b chore/expo-sdk57-upgrade
git status --short
```
Expected: on new branch, ready for Task 2.

---

### Task 2: Upgrade 54 → 55 (New Architecture mandatory)

**Files:**
- Modify: `package.json:27-46` (expo, react-native, react, expo-* bumped by installer)
- Modify: `app.json:10` (remove `"newArchEnabled": true,`)
- Modify: `pnpm-lock.yaml` (regenerated)

**Interfaces:**
- Consumes: clean tree from Task 1
- Produces: app bootable on SDK 55, `expo@^55.0.0` installed

- [ ] **Step 1: Install SDK 55 and align deps**

Run:
```bash
npx expo install expo@^55.0.0 --fix
```
Expected: exits 0, `package.json` now shows `expo@^55`.

- [ ] **Step 2: Remove deleted `newArchEnabled` flag**

In `app.json`, change:
```json
    "userInterfaceStyle": "automatic",
    "newArchEnabled": true,
    "ios": {
```
to:
```json
    "userInterfaceStyle": "automatic",
    "ios": {
```
Reason: SDK 55 removed this key; leaving it breaks prebuild/config validation.

- [ ] **Step 3: Verify SDK 55 doctor passes**

Run:
```bash
npx expo-doctor@latest
```
Expected: no dependency-mismatch errors (warnings about Hermes v1 memory on SDK 55 are known, fixed in SDK 57 — do not chase).

- [ ] **Step 4: Commit SDK 55 checkpoint**

```bash
git add package.json pnpm-lock.yaml app.json
git commit -m "chore: upgrade expo SDK 54 to 55"
```

---

### Task 3: Upgrade 55 → 56 (React Native 0.85, Hermes v1 default)

**Files:**
- Modify: `package.json` (expo@^56, react-native 0.85, react 19.2, reanimated/worklets bumps)
- Modify: `package.json:62-69` devDeps if installer updates `jest-expo`

**Interfaces:**
- Consumes: SDK 55 checkpoint from Task 2
- Produces: SDK 56 install with `expo/fetch` as default fetch and async `expo-file-system` copy/move

- [ ] **Step 1: Install SDK 56**

Run:
```bash
npx expo install expo@^56.0.0 --fix
```
Expected: exits 0.

- [ ] **Step 2: Check breaking changes affecting this repo**

Search:
```bash
rg -n "expo-av|allowsFullscreen|experimentalBlurMethod|resetOnFocus|copy\(|move\(|ExpoRequest|notification" app components store hooks lib --glob '*.{ts,tsx,js,json}' || true
```
Expected: no hits (repo uses `expo-blur ~14.1.5`, `expo-router ~5.1.3`, `expo-video` not present — if a hit appears, apply the SDK 55/56 rename from the changelog before continuing).

- [ ] **Step 3: Run doctor**

Run:
```bash
npx expo-doctor@latest
```
Expected: clean (known Hermes v1 + reanimated memory regression on SDK 56 is expected; it is resolved by Task 4 — do not apply worklets bundle-mode workaround for production).

- [ ] **Step 4: Commit SDK 56 checkpoint**

```bash
git add package.json pnpm-lock.yaml
git commit -m "chore: upgrade expo SDK 55 to 56"
```

---

### Task 4: Upgrade 56 → 57 (React Native 0.86, target SDK)

**Files:**
- Modify: `package.json` (expo@^57, react-native 0.86, react 19.2.3, reanimated 4.5, worklets 0.10, gesture-handler 2.32)
- Test: `npx expo install --check`

**Interfaces:**
- Consumes: SDK 56 checkpoint from Task 3
- Produces: final SDK 57 dependency set matching Expo Go SDK 57 on phone

- [ ] **Step 1: Install SDK 57**

Run:
```bash
npx expo install expo@^57.0.0 --fix
```
Expected: exits 0, `package.json` expo is `^57.0.0`.

- [ ] **Step 2: Confirm aligned versions**

Run:
```bash
npx expo install --check
npx expo-doctor@latest
```
Expected: both report no mismatches.

- [ ] **Step 3: Commit SDK 57**

```bash
git add package.json pnpm-lock.yaml
git commit -m "chore: upgrade expo SDK 56 to 57"
```

---

### Task 5: Verify boot, types, lint

**Files:**
- Modify: none (fix only if errors point at a file, e.g. `app/_layout.tsx`, `store/*.tsx`)
- Test: Metro bundler + `tsc --noEmit` + `expo lint`

**Interfaces:**
- Consumes: SDK 57 install from Task 4
- Produces: app opens in Expo Go SDK 57, types and lint clean

- [ ] **Step 1: Typecheck**

Run:
```bash
npx tsc --noEmit
```
Expected: exit 0. Fix any `expo-router` typedRoutes or `react-native` type errors before continuing.

- [ ] **Step 2: Lint**

Run:
```bash
npm run lint
```
Expected: exit 0 or only pre-existing warnings.

- [ ] **Step 3: Clear-start Metro and scan with Expo Go SDK 57**

Run:
```bash
npx expo start -c
```
Expected: QR loads in Expo Go (SDK 57) with no "incompatible project" error; login → role routing in `app/_layout.tsx:30-57` sends DRIVER to `/(driver)`, PASSENGER to `/(passenger)`.

- [ ] **Step 4: Record final diff**

Run:
```bash
git diff main...HEAD --stat
git diff main...HEAD -- package.json app.json
```
Expected: diff shows only expo/RN/router version bumps + `newArchEnabled` removal.
