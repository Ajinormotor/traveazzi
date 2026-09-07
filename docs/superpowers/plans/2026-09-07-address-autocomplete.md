# Address Autocomplete Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Typing in the schedule and ride-creation address fields shows Google Places suggestions; selecting one fills the field into the existing geocode→submit path.

**Architecture:** Backend adds an `autocomplete()` method on the existing `GeolocationService` (Node `fetch`, no new dependencies) plus a `GET /geolocation/autocomplete` route. Mobile adds one `AddressAutocomplete` component plus a `driverStore.autocompleteAddress()` fetcher, then swaps the four plain address `TextInput`s for it. Same-branch work in both repos.

**Tech Stack:** NestJS 11, Jest 29 + ts-jest (backend); Expo SDK 57, axios, zustand, twrnc, TypeScript strict (mobile).

## Global Constraints

- Work spans TWO git repos: `traveazi-backend/` and `traveazi-mobile/`. Create the same branch name in both repos; commit backend changes in the backend repo and mobile changes in the mobile repo — never mix.
- Backend `.env` (keys, secrets) is never printed, committed, or logged. Reuse the existing `SecretsService.googleMaps.apiKey` shape.
- Mobile stays on Expo Go: no native modules, no config plugins, no `ios/`/`android/` dirs.
- Places request billing: debounce (~400ms) + 2-character minimum stay exactly as specified — do not lower them.
- Unselected typed text must keep submitting exactly as today (geocode fallback path unchanged).
- Every task ends with its own commit(s); stage only that task's files.

---

### Task 1: Autocomplete endpoint (backend)

**Files (backend repo):**
- Modify: `src/modules/geolocation/geolocation.service.ts` (add `PlaceSuggestion` interface + `autocomplete()` method)
- Modify: `src/modules/geolocation/geolocation.controller.ts` (add `GET autocomplete` route)
- Create: `src/modules/geolocation/geolocation.service.spec.ts`
- Create: `src/modules/geolocation/geolocation.controller.spec.ts`

**Interfaces:**
- Consumes: `SecretsService.googleMaps.apiKey` (exists); `AuthGuard`, `ErrorHelper` (existing patterns)
- Produces: `GET /geolocation/autocomplete?input=` → `[{ description, placeId }]` — consumed by Task 2

- [ ] **Step 1: Write the failing specs**

`src/modules/geolocation/geolocation.service.spec.ts` (direct instantiation, stubbed `fetch` — no Mongo/Redis needed):

```ts
import { GeolocationService } from './geolocation.service';

describe('GeolocationService.autocomplete', () => {
  const makeService = () =>
    new GeolocationService({ googleMaps: { apiKey: 'test-key' } } as any);

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('maps predictions to description/placeId', async () => {
    jest.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        suggestions: [
          { placePrediction: { placeId: 'ChIJ1', text: { text: 'Ikeja, Lagos, Nigeria' } } },
          { placePrediction: { placeId: 'ChIJ2', text: { text: 'Ikeja GRA, Lagos' } } },
        ],
      }),
    } as any);
    await expect(makeService().autocomplete('Ikeja')).resolves.toEqual([
      { description: 'Ikeja, Lagos, Nigeria', placeId: 'ChIJ1' },
      { description: 'Ikeja GRA, Lagos', placeId: 'ChIJ2' },
    ]);
  });

  it('returns [] when there are no suggestions', async () => {
    jest.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({}),
    } as any);
    await expect(makeService().autocomplete('xqzqzq')).resolves.toEqual([]);
  });

  it('throws when the key is missing', async () => {
    const service = new GeolocationService({ googleMaps: {} } as any);
    await expect(service.autocomplete('Ikeja')).rejects.toThrow();
  });
});
```

`src/modules/geolocation/geolocation.controller.spec.ts` (mocked service, guard overridden — same pattern as the geocode spec):

```ts
import { Test, TestingModule } from '@nestjs/testing';
import { HttpException } from '@nestjs/common';
import { GeolocationController } from './geolocation.controller';
import { GeolocationService } from './geolocation.service';
import { AuthGuard } from '../../core/guards/authenticate.guard';

describe('GeolocationController.autocomplete', () => {
  let controller: GeolocationController;
  const mockService = { autocomplete: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GeolocationController],
      providers: [{ provide: GeolocationService, useValue: mockService }],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .compile();
    controller = module.get<GeolocationController>(GeolocationController);
    jest.clearAllMocks();
  });

  it('returns the service suggestions verbatim', async () => {
    mockService.autocomplete.mockResolvedValue([{ description: 'Ikeja, Lagos', placeId: 'ChIJ1' }]);
    await expect(controller.autocomplete('Ike')).resolves.toEqual([
      { description: 'Ikeja, Lagos', placeId: 'ChIJ1' },
    ]);
    expect(mockService.autocomplete).toHaveBeenCalledWith('Ike');
  });

  it('throws 400 when input is missing', async () => {
    const err = await controller.autocomplete('').catch((e) => e);
    expect(err).toBeInstanceOf(HttpException);
    expect((err as HttpException).getStatus()).toBe(400);
  });
});
```

- [ ] **Step 2: Run them to verify they fail**

Run (backend repo): `npx jest src/modules/geolocation`
Expected: FAIL — `geolocation.service.spec.ts` fails on `service.autocomplete is not a function`; controller spec fails on `controller.autocomplete is not a function`.

- [ ] **Step 3: Implement the service method + route**

Append to `src/modules/geolocation/geolocation.service.ts` (after `reverseGeocode`, before `calculateRoute` — placement does not matter as long as it is a class method):

```ts
export interface PlaceSuggestion {
  description: string;
  placeId: string;
}

// inside class GeolocationService:
async autocomplete(input: string): Promise<PlaceSuggestion[]> {
  const { apiKey } = this.secretsService.googleMaps;
  if (!apiKey) {
    this.logger.error('Google Maps API Key not found. Autocomplete will not function.');
    throw new InternalServerErrorException('Geolocation service is not configured properly.');
  }
  try {
    const response = await fetch('https://places.googleapis.com/v1/places:autocomplete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'suggestions.placePrediction.text,suggestions.placePrediction.placeId',
      },
      body: JSON.stringify({ input, includedRegionCodes: ['NG'], languageCode: 'en' }),
    });
    if (!response.ok) {
      this.logger.warn(`Places autocomplete failed for "${input}". HTTP ${response.status}.`);
      ErrorHelper.InternalServerErrorException('Places autocomplete request failed.');
    }
    const data = (await response.json()) as {
      suggestions?: Array<{ placePrediction?: { placeId?: string; text?: { text?: string } } }>;
    };
    return (data.suggestions ?? []).flatMap((s) => {
      const text = s.placePrediction?.text?.text;
      const placeId = s.placePrediction?.placeId;
      return text && placeId ? [{ description: text, placeId }] : [];
    });
  } catch (error) {
    if (error instanceof InternalServerErrorException) throw error;
    this.logger.error(`Error calling Places Autocomplete API for "${input}": ${(error as Error).message}`);
    ErrorHelper.InternalServerErrorException('Failed to fetch place suggestions.');
  }
  return [];
}
```

Verify `InternalServerErrorException` is already imported in that file (it is — used by `checkClient`). `ErrorHelper` is already imported (line 17).

Add to `src/modules/geolocation/geolocation.controller.ts` (new method; keep the existing `geocode` method untouched):

```ts
@Get('autocomplete')
@UseGuards(AuthGuard)
@ApiBearerAuth()
@ApiOperation({ summary: 'Place autocomplete suggestions (Nigeria-biased)' })
@ApiQuery({ name: 'input', type: String, required: true, example: 'Ikeja' })
@ApiResponse({ status: 200, description: 'Suggestions returned (possibly empty).' })
@ApiResponse({ status: 400, description: 'Input missing.' })
async autocomplete(
  @Query('input') input?: string,
): Promise<PlaceSuggestion[]> {
  if (!input?.trim()) {
    throw new BadRequestException('Query parameter "input" is required.');
  }
  return this.geolocationService.autocomplete(input.trim());
}
```

Import `PlaceSuggestion` alongside `GeolocationService` in the controller import line, and `BadRequestException` from `@nestjs/common` if not already imported (the geocode method throws it, so it is).

- [ ] **Step 4: Run specs + build**

Run (backend repo): `npx jest src/modules/geolocation`
Expected: all PASS (3 geocode + 3 service + 2 controller).
Run (backend repo): `npm run build`
Expected: exit 0.

- [ ] **Step 5: Commit (backend repo)**

```bash
git add src/modules/geolocation/geolocation.service.ts src/modules/geolocation/geolocation.service.spec.ts src/modules/geolocation/geolocation.controller.ts src/modules/geolocation/geolocation.controller.spec.ts
git commit -m "feat: add Places autocomplete method and GET /geolocation/autocomplete endpoint"
```

---

### Task 2: Autocomplete component + store fetcher (mobile)

**Files (mobile repo):**
- Create: `components/AddressAutocomplete.tsx`
- Modify: `store/driverStore.tsx` (add `autocompleteAddress`)

**Interfaces:**
- Consumes: Task 1 `GET /geolocation/autocomplete?input=`; existing token-header + `Base_Url` patterns
- Produces: default export `AddressAutocomplete({ value, onChange, placeholder?, inputStyle? })` + `autocompleteAddress(input): Promise<Array<{ description; placeId }>>` — consumed by Task 3

- [ ] **Step 1: Add `autocompleteAddress` to `store/driverStore.tsx`**

Add to the `RideState` interface:

```ts
autocompleteAddress: (input: string) => Promise<Array<{ description: string; placeId: string }>>;
```

Add the implementation (token header like the other calls; silent failure — NO toast, per-keystroke toasts would spam):

```ts
autocompleteAddress: async (input) => {
  try {
    const token = useAuthStore.getState().token;
    const response = await axios.get(`${Base_Url}/geolocation/autocomplete`, {
      params: { input },
      headers: { Authorization: `Bearer ${token}` },
    });
    const list = response.data?.data ?? [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
},
```

- [ ] **Step 2: Create `components/AddressAutocomplete.tsx` with this exact content**

```tsx
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import className from 'twrnc';
import { useDriverRideStore } from '@/store/driverStore';

type Suggestion = { description: string; placeId: string };

type Props = {
  value: string;
  onChange: (text: string) => void;
  placeholder?: string;
  inputStyle?: any;
};

export default function AddressAutocomplete({ value, onChange, placeholder, inputStyle }: Props) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reqId = useRef(0);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    if (value.trim().length < 2) {
      reqId.current += 1;
      setSuggestions([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const my = ++reqId.current;
    timer.current = setTimeout(async () => {
      try {
        const list = await useDriverRideStore.getState().autocompleteAddress(value.trim());
        if (reqId.current === my) setSuggestions(Array.isArray(list) ? list : []);
      } catch {
        if (reqId.current === my) setSuggestions([]);
      } finally {
        if (reqId.current === my) setLoading(false);
      }
    }, 400);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [value]);

  const select = (s: Suggestion) => {
    reqId.current += 1;
    if (timer.current) clearTimeout(timer.current);
    setSuggestions([]);
    setLoading(false);
    onChange(s.description);
    Keyboard.dismiss();
  };

  return (
    <View style={className`relative w-full`}>
      <TextInput
        value={value}
        onChangeText={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        style={[className`max-w-[85%] w-full bg-transparent text-[16px]`, inputStyle]}
      />
      {loading && <ActivityIndicator size="small" color="#245AB0" />}
      {focused && suggestions.length > 0 && (
        <FlatList
          data={suggestions}
          keyExtractor={(item) => item.placeId}
          keyboardShouldPersistTaps="handled"
          style={className`absolute top-full left-0 right-0 bg-white rounded-[8px] z-50 max-h-[180px]`}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => select(item)}
              style={className`px-3 py-3 border-b border-[#F0F0F0]`}
            >
              <Text style={className`text-[14px] text-black`}>{item.description}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}
```

Design notes locked in (do not redesign): store accessed via `getState()` inside the timeout so typing never subscribes the component to store updates; `reqId` invalidates stale/select-superseded responses so a late fetch can never repopulate after select; unselected text submits exactly as today.

- [ ] **Step 3: Verify**

Run (mobile repo): `npx tsc --noEmit` — Expected: exit 0.

- [ ] **Step 4: Commit (mobile repo)**

```bash
git add components/AddressAutocomplete.tsx store/driverStore.tsx
git commit -m "feat: add AddressAutocomplete input with debounced suggestions"
```

---

### Task 3: Wire the four inputs (mobile)

**Files (mobile repo):**
- Modify: `app/(schedule)/index.tsx` (origin + destination inputs)
- Modify: `app/(driver)/create.tsx` (origin + destination inputs)

**Interfaces:**
- Consumes: Task 2 `AddressAutocomplete` + `autocompleteAddress`
- Produces: all four address fields suggest-as-you-type; submit paths unchanged

- [ ] **Step 1: Schedule inputs (`app/(schedule)/index.tsx`)**

Read the file first (required). Replace ONLY the two address `TextInput` elements (origin ~line 148 with `value={origin} onChangeText={setOrigin}`; destination ~line 156 with `value={destination} onChangeText={setDestination}`) with:

```tsx
<AddressAutocomplete
  value={origin}
  onChange={setOrigin}
  placeholder='Legend Hotel Lagos Airport, Curio collection'
/>
```

and the destination equivalent with its own value/setter/placeholder. Preserve each input's exact current `style` by passing it as `inputStyle` (read the current style props and copy them verbatim into `inputStyle={...}`). Keep all siblings (gps icons, wrapping `TouchableOpacity`s) and every other line byte-identical, with one granted exception: the destination field's `onSubmitEditing={handleSearch}` is dropped because `handleSearch` (`app/(schedule)/index.tsx:52-54`) is an empty no-op — dropping it changes no behavior, and extending the shared component is out of scope. Add `import AddressAutocomplete from '@/components/AddressAutocomplete';` with the other imports.

- [ ] **Step 2: Create inputs (`app/(driver)/create.tsx`)**

Read the file first (required). Same swap for the origin + destination address `TextInput`s (~lines 314/329 — verify by reading; the date/price inputs elsewhere in the file are NOT address fields and stay untouched). Pass current value/setter/placeholder/style through exactly as in Step 1. Add the same import.

- [ ] **Step 3: Verify**

Run (mobile repo): `npx tsc --noEmit` — Expected: exit 0.
Run (mobile repo): `npx expo export -p web --output-dir /tmp/auto-t3` — Expected: export succeeds.

- [ ] **Step 4: Commit (mobile repo)**

```bash
git add "app/(schedule)/index.tsx" "app/(driver)/create.tsx"
git commit -m "feat: use AddressAutocomplete on schedule and create address fields"
```

---

### Task 4: Full verification and device handoff

**Files:**
- Modify: none (both repos)
- Test backend: `npm run build`, `npx jest src/modules/geolocation`
- Test mobile: `npx tsc --noEmit`, `npx expo-doctor@latest`, `npx expo export -p web --output-dir /tmp/auto-final`, `npx jest --passWithNoTests`

**Interfaces:**
- Consumes: all files from Tasks 1-3
- Produces: green gates on both repos plus a human device-test checklist (no commit — trees must already be clean)

- [ ] **Step 1: Confirm clean trees**

Run in EACH repo: `git status --short` — Expected: empty output in both. If not empty, stop and report NEEDS_CONTEXT (do not commit other work).

- [ ] **Step 2: Backend gates**

Run (backend repo): `npm run build` — Expected: exit 0.
Run (backend repo): `npx jest src/modules/geolocation` — Expected: all PASS (geocode 3 + service 3 + controller 2).

- [ ] **Step 3: Mobile gates**

Run (mobile repo): `npx tsc --noEmit` — Expected: exit 0.
Run (mobile repo): `npx expo-doctor@latest` — Expected: `21/21 checks passed. No issues detected!`
Run (mobile repo): `npx expo export -p web --output-dir /tmp/auto-final` — Expected: export succeeds.
Run (mobile repo): `npx jest --passWithNoTests` — Expected: exit 0.

- [ ] **Step 4: Report the device-test checklist (do not run — human does this in Expo Go, backend running)**

Prerequisite the human must confirm first: server Google key has **Places API (New)** enabled (Geocoding/Embed alone is insufficient).
1. Schedule origin: type "ike" (under 2 chars → no dropdown, no crash) then "ikeja" → suggestions appear with spinner first → tap one → field fills → Check Availability returns real rides.
2. Airplane-mode typing: no dropdown, no crash, no toast spam; typed text still submits into the geocode path.
3. Create-ride origin + destination: suggestions work on both; submit sends real coords.
4. Long-list check: 5+ suggestions scroll inside the dropdown without moving the underlying screen.
