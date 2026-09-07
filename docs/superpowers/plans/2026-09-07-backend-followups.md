# Backend Follow-ups Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close the four parked backend follow-ups — real address search, real ride-creation coords, completed Paystack payments, passenger cancel, and favorites — across the NestJS backend and the Expo app.

**Architecture:** Backend work is additive only (one new controller, one new favorites feature; no changes to rides/booking/payment/webhook logic). Mobile work is wiring only (new store functions, screens pass real values). The two repos move in lockstep on same-named branches. The server Google key never leaves the backend; the mobile Embed key stays in `.env.local`.

**Tech Stack:** NestJS 11, Mongoose 8, class-validator, Jest 29 + ts-jest, Supertest (backend); Expo SDK 57, axios, zustand, expo-web-browser ~57.0.2, TypeScript strict (mobile).

## Global Constraints

- Work spans TWO git repos: `traveazi-backend/` and `traveazi-mobile/`. Create the same branch name in both repos; commit backend changes in the backend repo and mobile changes in the mobile repo — never mix.
- Backend `.env` (keys, secrets) is never printed, committed, or logged. Match its key NAMES only (GOOGLE_MAPS_API_KEY, PAYSTACK_* already present).
- Mobile stays on Expo Go: no native modules, no config plugins, no `ios/`/`android/` dirs.
- Coordinate field mapping is fixed: Google/geocode shape is `{ lat, lng }`; backend `CoordinatesDto` and ride payloads use `{ lat, lon }`. Mobile MUST map `lng → lon` at every boundary. Never send `lng` to the backend.
- Do not touch booking payload shapes and do not "fix" the `pickupAddress`/`dropoffAddress` assignment in `(passenger)/confirmRide` — out of scope.
- No test suite exists on mobile (`npx jest --passWithNoTests` exits 0); backend has jest configured with zero spec files. New backend code ships with its spec file (mocked service, guard overridden — no Mongo/Redis needed).
- Every task ends with its own commit(s); stage only that task's files.

---

### Task 1: Geocode endpoint (backend)

**Files (backend repo):**
- Create: `src/modules/geolocation/geolocation.controller.ts`
- Create: `src/modules/geolocation/geolocation.controller.spec.ts`
- Modify: `src/modules/geolocation/geolocation.module.ts` (register controller)

**Interfaces:**
- Consumes: `GeolocationService.geocode(address): Promise<{lat,lng} | null>` (exists, NG-biased); `AuthGuard` from `../../core/guards/authenticate.guard` (same import as `rides.controller.ts:14`)
- Produces: `GET /geolocation/geocode?address=` → `{ lat, lng }` — consumed by Task 2

- [ ] **Step 1: Write the failing spec**

`src/modules/geolocation/geolocation.controller.spec.ts`:

```ts
import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { GeolocationController } from './geolocation.controller';
import { GeolocationService } from './geolocation.service';
import { AuthGuard } from '../../core/guards/authenticate.guard';

describe('GeolocationController', () => {
  let controller: GeolocationController;
  const mockService = { geocode: jest.fn() };

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

  it('returns coords for a known address', async () => {
    mockService.geocode.mockResolvedValue({ lat: 6.5244, lng: 3.3792 });
    await expect(controller.geocode('Ikeja, Lagos')).resolves.toEqual({
      lat: 6.5244,
      lng: 3.3792,
    });
    expect(mockService.geocode).toHaveBeenCalledWith('Ikeja, Lagos');
  });

  it('throws 400 when address is missing', async () => {
    await expect(controller.geocode('')).rejects.toBeInstanceOf(BadRequestException);
    await expect(controller.geocode(undefined)).rejects.toBeInstanceOf(BadRequestException);
  });

  it('throws 400 when the service resolves null', async () => {
    mockService.geocode.mockResolvedValue(null);
    await expect(controller.geocode('Nowhere XX')).rejects.toBeInstanceOf(BadRequestException);
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run (backend repo): `npx jest src/modules/geolocation`
Expected: FAIL with "GeolocationController › encountered a declaration exception" / Cannot find module './geolocation.controller' (controller does not exist yet).

- [ ] **Step 3: Write the controller**

`src/modules/geolocation/geolocation.controller.ts`:

```ts
import {
  Controller,
  Get,
  Query,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { GeolocationService } from './geolocation.service';
import { AuthGuard } from '../../core/guards/authenticate.guard';

@ApiTags('Geolocation')
@Controller('geolocation')
export class GeolocationController {
  constructor(private readonly geolocationService: GeolocationService) {}

  @Get('geocode')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Geocode an address to coordinates (Nigeria-biased)' })
  @ApiQuery({ name: 'address', type: String, required: true, example: 'Ikeja, Lagos' })
  @ApiResponse({ status: 200, description: 'Coordinates resolved.' })
  @ApiResponse({ status: 400, description: 'Address missing or not found.' })
  async geocode(
    @Query('address') address?: string,
  ): Promise<{ lat: number; lng: number }> {
    if (!address?.trim()) {
      throw new BadRequestException('Query parameter "address" is required.');
    }
    const coords = await this.geolocationService.geocode(address.trim());
    if (!coords) {
      throw new BadRequestException(
        `Could not find coordinates for the address: ${address.trim()}`,
      );
    }
    return coords;
  }
}
```

In `src/modules/geolocation/geolocation.module.ts`, add the controller (keep everything else identical):

```ts
import { GeolocationController } from './geolocation.controller';

@Module({
  imports: [SecretsModule],
  controllers: [GeolocationController],
  providers: [GeolocationService],
  exports: [GeolocationService],
})
export class GeolocationModule {}
```

- [ ] **Step 4: Run spec + build**

Run (backend repo): `npx jest src/modules/geolocation`
Expected: 3/3 PASS.
Run (backend repo): `npm run build`
Expected: exit 0.

- [ ] **Step 5: Commit (backend repo)**

```bash
git add src/modules/geolocation/geolocation.controller.ts src/modules/geolocation/geolocation.controller.spec.ts src/modules/geolocation/geolocation.module.ts
git commit -m "feat: add authenticated GET /geolocation/geocode endpoint"
```

---

### Task 2: Search + create wiring (mobile)

**Files (mobile repo):**
- Modify: `store/driverStore.tsx` (add `geocodeAddress`; extend `getRideBySearch` signature + query params + auth header)
- Modify: `app/(schedule)/index.tsx` (origin state; geocode + search on Check Availability)
- Modify: `app/(schedule)/scheduleResult.tsx` (render store `rides`; loading/empty states; drop mock list + fake timer)
- Modify: `app/(driver)/create.tsx` (geocode at submit; real coords; delete hardcoded Lagos pair)

**Interfaces:**
- Consumes: Task 1 `GET /geolocation/geocode?address=`; existing `GET /rides/search` with query params `origin[lat]`, `origin[lon]`, `destination[lat]`, `destination[lon]`, `departureDate`, `seatsNeeded` (per `rides.controller.ts:83-135`); `POST /rides` with `origin`/`destination` as `{ lat, lon }` plus address strings
- Produces: schedule results and created rides carry real coords

- [ ] **Step 1: Add `geocodeAddress` + extend `getRideBySearch` in `store/driverStore.tsx`**

Add to the `RideState` interface:

```ts
geocodeAddress: (address: string) => Promise<{ lat: number; lng: number } | null>;
getRideBySearch: (params: {
  origin: { lat: number; lon: number };
  destination: { lat: number; lon: number };
  departureDate: string;
  seatsNeeded: number;
}) => Promise<any>;
```

Add the implementations (same file, following the existing token-header + Toast pattern):

```ts
geocodeAddress: async (address) => {
  try {
    const token = useAuthStore.getState().token;
    const response = await axios.get(`${Base_Url}/geolocation/geocode`, {
      params: { address },
      headers: { Authorization: `Bearer ${token}` },
    });
    const payload = response.data?.data ?? response.data;
    if (typeof payload?.lat === 'number' && typeof payload?.lng === 'number') {
      return { lat: payload.lat, lng: payload.lng };
    }
    return null;
  } catch (error: any) {
    Toast.show({
      type: 'error',
      text1: error?.response?.data?.message ?? 'Could not locate that address',
    });
    return null;
  }
},
```

Rewrite `getRideBySearch` (replacing the zero-arg version) to send the coords as query params WITH the auth header it currently omits, and keep setting `rides` from the response:

```ts
getRideBySearch: async (params) => {
  set({ loading: true });
  try {
    const token = useAuthStore.getState().token;
    const response = await axios.get(`${Base_Url}/rides/search`, {
      params: {
        'origin[lat]': params.origin.lat,
        'origin[lon]': params.origin.lon,
        'destination[lat]': params.destination.lat,
        'destination[lon]': params.destination.lon,
        departureDate: params.departureDate,
        seatsNeeded: params.seatsNeeded,
      },
      headers: { Authorization: `Bearer ${token}` },
    });
    set({ rides: response.data?.data ?? [] });
  } catch (error: any) {
    Toast.show({
      type: 'error',
      text1: error?.response?.data?.message ?? 'Failed to search rides',
    });
  } finally {
    set({ loading: false });
  }
},
```

- [ ] **Step 2: Wire schedule screen (`app/(schedule)/index.tsx`)**

Read the file first (required). Add an `origin` state (`useState('')`) and bind it to the first address `TextInput` (currently stateless). Read the existing `destination`, date, and seats states. Rewrite `handleAvailability` to: toast + return on empty origin/destination/date; geocode both addresses via `geocodeAddress` (toast + return if either resolves null); call `getRideBySearch` with `{ origin: { lat, lon: lng }, destination: { lat, lon: lng }, departureDate, seatsNeeded }` (note the `lng → lon` mapping); then push `/(schedule)/scheduleResult` only on success.

- [ ] **Step 3: Render real results (`app/(schedule)/scheduleResult.tsx`)**

Read the file first (required). Delete the fake 1s timer and the `riderListData` mock list; render the `rides` array from `useDriverRideStore` with the store's `loading` spinner while pending and an empty-state text when the array is empty. Keep the existing push to `/(passenger)/confirmRide/[id]` with the result id.

- [ ] **Step 4: Real coords on create (`app/(driver)/create.tsx`)**

Read the submit block first (required). Geocode `originAddress` and `destinationAddress` states at submit (toast + abort if either resolves null); build the payload coords as `{ lat, lon: lng }` from the geocode results; delete the hardcoded `lat: 6.5244 lon: 3.3792` pair. Keep addresses, `vehicleId`, `departureTime`, `pricePerSeat`, and `preferences` exactly as they are.

- [ ] **Step 5: Verify**

Run (mobile repo): `npx tsc --noEmit` — Expected: exit 0.
Run (mobile repo): `npx expo export -p web --output-dir /tmp/follow-t2` — Expected: export succeeds.

- [ ] **Step 6: Commit (mobile repo)**

```bash
git add store/driverStore.tsx "app/(schedule)/index.tsx" "app/(schedule)/scheduleResult.tsx" "app/(driver)/create.tsx"
git commit -m "feat: wire schedule search and ride creation to real geocoded coords"
```

---

### Task 3: Payment completion + passenger cancel (mobile)

**Files (mobile repo):**
- Modify: `store/passengerStore.tsx` (`payBookings` returns init payload without success toast; add `cancelBooking`)
- Modify: `app/(passenger)/payRide/[id].tsx` (booking lookup, browser checkout, poll-until-PAID, retry)
- Modify: `app/(passenger)/confirmRide/[id].tsx` (cancel wiring)

**Interfaces:**
- Consumes: existing `POST /passenger/bookings/:bookingId/pay` → `{ authorization_url, reference, access_code }`; existing `PATCH /passenger/bookings/:bookingId/cancel`; `getMyBookings({ silent: true })` (exists); `expo-web-browser` ~57.0.2 (installed + config plugin present)
- Produces: in-app Paystack checkout ending in confirmed PAID; working passenger cancel

- [ ] **Step 1: Rewrite `payBookings`, add `cancelBooking` in `store/passengerStore.tsx`**

Add to the store interface:

```ts
cancelBooking: (bookingId: string) => Promise<boolean>;
```

Replace `payBookings` so it returns the init payload and never toasts success (success is only known after confirmation):

```ts
payBookings: async (bookingId: string) => {
  set({ loading: true });
  try {
    const token = useAuthStore.getState().token;
    const response = await axios.post(`${Base_Url}/passenger/bookings/${bookingId}/pay`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
    set({ loading: false });
    return (response.data?.data ?? {}) as {
      authorization_url?: string;
      reference?: string;
      access_code?: string;
    };
  } catch (error: any) {
    Toast.show({
      type: 'error',
      text1: error?.response?.data?.message ?? 'Payment initialization failed',
    });
    set({ loading: false });
    return null;
  }
},

cancelBooking: async (bookingId: string) => {
  try {
    const token = useAuthStore.getState().token;
    const response = await axios.patch(
      `${Base_Url}/passenger/bookings/${bookingId}/cancel`,
      {},
      { headers: { Authorization: `Bearer ${token}` } },
    );
    Toast.show({
      type: 'success',
      text1: response.data?.message ?? 'Booking cancelled',
    });
    return true;
  } catch (error: any) {
    Toast.show({
      type: 'error',
      text1: error?.response?.data?.message ?? 'Failed to cancel booking',
    });
    return false;
  }
},
```

- [ ] **Step 2: Rewrite `handlePay` in `app/(passenger)/payRide/[id].tsx`**

Read the file first (required). Add `import * as WebBrowser from 'expo-web-browser';` and pull `getMyBookings` from `usePassengerStore`. Look up the booking id right before paying (do not trust a stored one — the booking may have been created after the screen mounted):

```ts
const findBookingId = async (): Promise<string | null> => {
  const list = (await getMyBookings({ silent: true })) ?? [];
  const match = list.find((b: any) => {
    const rid = b?.ride?._id ?? (typeof b?.rideId === 'object' ? b?.rideId?._id : b?.rideId);
    return rid === rideDetails?._id;
  });
  return match?._id ?? null;
};
```

Replace `handlePay` with:

```ts
const handlePay = async () => {
  if (isPaying) return;
  setIsPaying(true);
  try {
    const bookingId = await findBookingId();
    if (!bookingId) {
      Toast.show({ type: 'error', text1: 'No booking found for this ride yet' });
      return;
    }
    const init = await payBookings(bookingId);
    if (!init?.authorization_url) {
      throw new Error('No payment page returned. Please try again.');
    }
    await WebBrowser.openBrowserAsync(init.authorization_url);
    const deadline = Date.now() + 60000;
    let paid = false;
    while (Date.now() < deadline) {
      await new Promise((res) => setTimeout(res, 5000));
      const list = (await getMyBookings({ silent: true })) ?? [];
      const current = list.find((b: any) => b?._id === bookingId);
      if (current?.paymentStatus === 'PAID') { paid = true; break; }
      if (current?.paymentStatus === 'FAILED') break;
    }
    if (paid) {
      Toast.show({ type: 'success', text1: 'Payment successful' });
      route.push('/(passenger)/home');
    } else {
      Toast.show({ type: 'error', text1: 'Payment not confirmed yet. Please try again.' });
    }
  } catch (error: any) {
    Toast.show({ type: 'error', text1: error?.message ?? 'Payment failed. Please try again.' });
  } finally {
    setIsPaying(false);
  }
};
```

Keep the existing `disabled={isPaying}` + spinner on the Pay Now button. Do not mark payment anywhere else — only the backend webhook flips the status.

- [ ] **Step 3: Wire Cancel in `app/(passenger)/confirmRide/[id].tsx`**

Read the Cancel button (~line 166) first (required). Replace the bare `route.back()` with: look up the passenger's booking for this ride the same way as Step 2 (`getMyBookings({ silent: true })`, match ride id); if a booking exists, call `cancelBooking(booking._id)` with loading/disabled state and go back only on `true`; if none exists, keep `route.back()` (nothing to cancel server-side). Add the error toast path via the store's toast.

- [ ] **Step 4: Verify**

Run (mobile repo): `npx tsc --noEmit` — Expected: exit 0.
Run (mobile repo): `npx expo export -p web --output-dir /tmp/follow-t3` — Expected: export succeeds.

- [ ] **Step 5: Commit (mobile repo)**

```bash
git add store/passengerStore.tsx "app/(passenger)/payRide/[id].tsx" "app/(passenger)/confirmRide/[id].tsx"
git commit -m "feat: complete Paystack checkout in-app and wire passenger cancel"
```

---

### Task 4: Favorites backend

**Files (backend repo):**
- Create: `src/modules/favorites/schemas/favorite-driver.schema.ts`
- Create: `src/modules/favorites/favorites.service.ts`
- Create: `src/modules/favorites/favorites.controller.ts`
- Create: `src/modules/favorites/favorites.module.ts`
- Create: `src/modules/favorites/dto/add-favorite-driver.dto.ts`
- Create: `src/modules/favorites/favorites.controller.spec.ts`
- Modify: `src/modules/main.module.ts` (register module)

**Interfaces:**
- Consumes: `User` schema at `../user/schemas/user.schema`; `AuthGuard`, `@User() passenger: IUser`, `ErrorHelper` (same patterns as `booking.controller.ts`/`booking.service.ts`)
- Produces: `GET|POST|DELETE /passenger/favorite-drivers` — consumed by Task 5

- [ ] **Step 1: Write the failing spec**

`src/modules/favorites/favorites.controller.spec.ts` (mocked service, guard overridden — same pattern as Task 1):

```ts
import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { FavoritesController } from './favorites.controller';
import { FavoritesService } from './favorites.service';
import { AuthGuard } from '../../core/guards/authenticate.guard';

describe('FavoritesController', () => {
  let controller: FavoritesController;
  const mockService = { listMine: jest.fn(), add: jest.fn(), remove: jest.fn() };
  const passenger = { _id: 'p1' } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FavoritesController],
      providers: [{ provide: FavoritesService, useValue: mockService }],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .compile();
    controller = module.get<FavoritesController>(FavoritesController);
    jest.clearAllMocks();
  });

  it('lists my favorites', async () => {
    mockService.listMine.mockResolvedValue([{ _id: 'f1' }]);
    await expect(controller.listMine(passenger)).resolves.toEqual([{ _id: 'f1' }]);
    expect(mockService.listMine).toHaveBeenCalledWith('p1');
  });

  it('adds a favorite', async () => {
    mockService.add.mockResolvedValue({ _id: 'f2' });
    await expect(controller.add(passenger, { driverId: 'd9' })).resolves.toEqual({ _id: 'f2' });
    expect(mockService.add).toHaveBeenCalledWith('p1', 'd9');
  });

  it('rejects an invalid driver id', async () => {
    await expect(controller.add(passenger, { driverId: 'nope' })).rejects.toBeInstanceOf(BadRequestException);
  });

  it('removes a favorite', async () => {
    mockService.remove.mockResolvedValue({ deleted: true });
    await expect(controller.remove(passenger, 'd9')).resolves.toEqual({ deleted: true });
    expect(mockService.remove).toHaveBeenCalledWith('p1', 'd9');
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run (backend repo): `npx jest src/modules/favorites`
Expected: FAIL — Cannot find module './favorites.controller' (nothing exists yet).

- [ ] **Step 3: Write the schema, DTO, service, controller, module**

`src/modules/favorites/schemas/favorite-driver.schema.ts`:

```ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { User } from '../../user/schemas/user.schema';

export type FavoriteDriverDocument = FavoriteDriver & Document;

@Schema({ timestamps: true, collection: 'favorite_drivers' })
export class FavoriteDriver {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true })
  passenger: User;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true })
  driver: User;
}

export const FavoriteDriverSchema = SchemaFactory.createForClass(FavoriteDriver);
FavoriteDriverSchema.index({ passenger: 1, driver: 1 }, { unique: true });
```

`src/modules/favorites/dto/add-favorite-driver.dto.ts`:

```ts
import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty } from 'class-validator';

export class AddFavoriteDriverDto {
  @ApiProperty({ description: 'Driver user id to favorite', example: '605c72ef4e79a3a3e8f2d3b4' })
  @IsMongoId()
  @IsNotEmpty()
  driverId: string;
}
```

`src/modules/favorites/favorites.service.ts`:

```ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FavoriteDriver, FavoriteDriverDocument } from './schemas/favorite-driver.schema';
import { User, UserDocument } from '../user/schemas/user.schema';

@Injectable()
export class FavoritesService {
  constructor(
    @InjectModel(FavoriteDriver.name) private readonly favModel: Model<FavoriteDriverDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async listMine(passengerId: string) {
    return this.favModel
      .find({ passenger: passengerId })
      .populate('driver', 'firstName lastName avatar')
      .sort({ createdAt: -1 })
      .lean();
  }

  async add(passengerId: string, driverId: string) {
    if (passengerId === driverId) {
      throw new BadRequestException('You cannot favorite yourself.');
    }
    const driver = await this.userModel.findById(driverId).select('_id').lean();
    if (!driver) {
      throw new NotFoundException('Driver not found.');
    }
    const existing = await this.favModel.findOne({ passenger: passengerId, driver: driverId }).lean();
    if (existing) return existing;
    return this.favModel.create({ passenger: passengerId, driver: driverId });
  }

  async remove(passengerId: string, driverId: string) {
    const res = await this.favModel.deleteOne({ passenger: passengerId, driver: driverId });
    if (res.deletedCount === 0) {
      throw new NotFoundException('Favorite not found.');
    }
    return { deleted: true };
  }
}
```

`src/modules/favorites/favorites.controller.ts`:

```ts
import { Controller, Get, Post, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import mongoose from 'mongoose';
import { FavoritesService } from './favorites.service';
import { AddFavoriteDriverDto } from './dto/add-favorite-driver.dto';
import { AuthGuard } from '../../core/guards/authenticate.guard';
import { User } from '../../core/decorators/user.decorator';
import { IUser } from '../../core/interfaces/user/user.interface';
import { ErrorHelper } from 'src/core/helpers';

@ApiTags('FavoriteDrivers')
@Controller()
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Get('/passenger/favorite-drivers')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List my favorite drivers' })
  async listMine(@User() passenger: IUser) {
    const data = await this.favoritesService.listMine(passenger._id);
    return { message: 'Favorite drivers fetched successfully.', data };
  }

  @Post('/passenger/favorite-drivers')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Favorite a driver (idempotent)' })
  async add(@User() passenger: IUser, @Body() dto: AddFavoriteDriverDto) {
    if (!mongoose.Types.ObjectId.isValid(dto.driverId)) {
      ErrorHelper.BadRequestException('Invalid driver ID format.');
    }
    const data = await this.favoritesService.add(passenger._id, dto.driverId);
    return { message: 'Driver favorited successfully.', data };
  }

  @Delete('/passenger/favorite-drivers/:driverId')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Unfavorite a driver' })
  async remove(@User() passenger: IUser, @Param('driverId') driverId: string) {
    if (!mongoose.Types.ObjectId.isValid(driverId)) {
      ErrorHelper.BadRequestException('Invalid driver ID format.');
    }
    const data = await this.favoritesService.remove(passenger._id, driverId);
    return { message: 'Driver unfavorited successfully.', data };
  }
}
```

`src/modules/favorites/favorites.module.ts` (same shape as `booking.module.ts`):

```ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FavoritesService } from './favorites.service';
import { FavoritesController } from './favorites.controller';
import { FavoriteDriver, FavoriteDriverSchema } from './schemas/favorite-driver.schema';
import { User, UserSchema } from '../user/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: FavoriteDriver.name, schema: FavoriteDriverSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  providers: [FavoritesService],
  controllers: [FavoritesController],
})
export class FavoritesModule {}
```

In `src/modules/main.module.ts`, add `FavoritesModule` to the import statement block and the `imports` array (same position style as the other feature modules).

- [ ] **Step 4: Run spec + build**

Run (backend repo): `npx jest src/modules/favorites`
Expected: 4/4 PASS.
Run (backend repo): `npm run build`
Expected: exit 0.

- [ ] **Step 5: Commit (backend repo)**

```bash
git add src/modules/favorites src/modules/main.module.ts
git commit -m "feat: add favorite drivers CRUD endpoints"
```

---

### Task 5: Favorites mobile

**Files (mobile repo):**
- Modify: `store/passengerStore.tsx` (favorites state + 3 functions)
- Modify: `app/(passenger)/favoritesDriver.tsx` (real list)
- Modify: `app/(passenger)/rides.tsx` (heart toggle on driver rows)

**Interfaces:**
- Consumes: Task 4 `GET|POST|DELETE /passenger/favorite-drivers`
- Produces: working favorites list + toggles

- [ ] **Step 1: Store functions in `store/passengerStore.tsx`**

Read the file top (interface + imports) first (required). Add to the store interface:

```ts
favorites: any[];
getFavoriteDrivers: () => Promise<any>;
addFavoriteDriver: (driverId: string) => Promise<boolean>;
removeFavoriteDriver: (driverId: string) => Promise<boolean>;
```

Add `favorites: []` to the initial state, plus the implementations following the file's token-header + Toast pattern:

```ts
getFavoriteDrivers: async () => {
  try {
    const token = useAuthStore.getState().token;
    const response = await axios.get(`${Base_Url}/passenger/favorite-drivers`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const list = response.data?.data ?? [];
    set({ favorites: list });
    return list;
  } catch (error: any) {
    Toast.show({
      type: 'error',
      text1: error?.response?.data?.message ?? 'Failed to load favorites',
    });
    return [];
  }
},

addFavoriteDriver: async (driverId: string) => {
  try {
    const token = useAuthStore.getState().token;
    await axios.post(
      `${Base_Url}/passenger/favorite-drivers`,
      { driverId },
      { headers: { Authorization: `Bearer ${token}` } },
    );
    Toast.show({ type: 'success', text1: 'Driver added to favorites' });
    return true;
  } catch (error: any) {
    Toast.show({
      type: 'error',
      text1: error?.response?.data?.message ?? 'Failed to add favorite',
    });
    return false;
  }
},

removeFavoriteDriver: async (driverId: string) => {
  try {
    const token = useAuthStore.getState().token;
    await axios.delete(`${Base_Url}/passenger/favorite-drivers/${driverId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    Toast.show({ type: 'success', text1: 'Driver removed from favorites' });
    return true;
  } catch (error: any) {
    Toast.show({
      type: 'error',
      text1: error?.response?.data?.message ?? 'Failed to remove favorite',
    });
    return false;
  }
},
```

After a successful add/remove, refresh with `getFavoriteDrivers()` so both screens stay in sync (call it inside the component after `true`, not in the store — keeps the store functions single-purpose).

- [ ] **Step 2: Real favorites list (`app/(passenger)/favoritesDriver.tsx`)**

Replace the stub with a screen that on mount calls `getFavoriteDrivers()` and renders three states: spinner while loading, error + Retry on failure, the driver rows (avatar, name, vehicle if present) when non-empty, and keeps the existing "No favorite drivers yet" empty text when empty. Each row gets a heart/options toggle calling `removeFavoriteDriver(driver._id)` (derive the id the same way as Step 3), disabled while its own request is pending, then refreshes the list. Follow the row styling of `rides.tsx` driver rows.

- [ ] **Step 3: Heart toggle on rides rows (`app/(passenger)/rides.tsx`)**

Read the driver row block first (required; rows render `r.rider_name`, avatar, plate around lines 186-211). Derive the driver id per row as `typeof r.driver === 'object' ? r.driver?._id : r.driver` — if neither `r.driver` nor a driver id field exists on the row object, stop and report NEEDS_CONTEXT instead of guessing. Add a heart `TouchableOpacity` beside the existing options button: filled when the id is in `favorites` (from `usePassengerStore`), outline otherwise; on press, call add/remove accordingly, disable while pending, refresh favorites after `true`, toast on failure (store toasts cover it).

- [ ] **Step 4: Verify**

Run (mobile repo): `npx tsc --noEmit` — Expected: exit 0.
Run (mobile repo): `npx expo export -p web --output-dir /tmp/follow-t5` — Expected: export succeeds.

- [ ] **Step 5: Commit (mobile repo)**

```bash
git add store/passengerStore.tsx "app/(passenger)/favoritesDriver.tsx" "app/(passenger)/rides.tsx"
git commit -m "feat: wire favorites list and heart toggles to backend"
```

---

### Task 6: Full verification and device handoff

**Files:**
- Modify: none (both repos)
- Test backend: `npm run build`, `npx jest src/modules/geolocation src/modules/favorites`
- Test mobile: `npx tsc --noEmit`, `npx expo-doctor@latest`, `npx expo export -p web --output-dir /tmp/follow-final`, `npx jest --passWithNoTests`

**Interfaces:**
- Consumes: all files from Tasks 1-5
- Produces: green gates on both repos plus a human device-test checklist (no commit — trees must already be clean)

- [ ] **Step 1: Confirm clean trees**

Run in EACH repo: `git status --short` — Expected: empty output in both. If not empty, stop and report NEEDS_CONTEXT (do not commit other work).

- [ ] **Step 2: Backend gates**

Run (backend repo): `npm run build` — Expected: exit 0.
Run (backend repo): `npx jest src/modules/geolocation src/modules/favorites` — Expected: all PASS.

- [ ] **Step 3: Mobile gates**

Run (mobile repo): `npx tsc --noEmit` — Expected: exit 0.
Run (mobile repo): `npx expo-doctor@latest` — Expected: `21/21 checks passed. No issues detected!`
Run (mobile repo): `npx expo export -p web --output-dir /tmp/follow-final` — Expected: export succeeds.
Run (mobile repo): `npx jest --passWithNoTests` — Expected: exit 0.

- [ ] **Step 4: Report the device-test checklist (do not run — human does this in Expo Go, backend running with TEST Paystack keys)**

1. Schedule tab: type two real addresses + date → results list shows real rides (not mocks); nonsense address → "Could not locate…" toast, no call.
2. Driver creates a ride with typed addresses → no hardcoded coords sent (verify in backend logs: geocoded Lagos-or-better values, not 6.5244/3.3792 for every ride).
3. Passenger books, opens payRide, taps Pay Now → Paystack test checkout opens → test card → app shows success and booking flips to PAID (check transitRide status).
4. ConfirmRide Cancel with an existing booking → cancelled + toast; without a booking → goes back silently.
5. Favorites: heart a driver on the rides list → appears in favorites tab; unheart → disappears; persists across app reload.
6. Prerequisite the human must confirm first: backend `.env` Paystack keys are TEST keys (`PAYSTACK_SECRET_KEY` starts with `sk_test_`).
