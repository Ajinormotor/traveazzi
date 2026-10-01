// A booking references its ride either as a populated object or a bare id
// depending on the endpoint, so normalise before comparing.
export function getBookingRideId(booking: any): string | undefined {
  const ride = booking?.rideId ?? booking?.ride;
  if (typeof ride === 'string') return ride;
  return ride?._id ?? undefined;
}

// Only a live booking means the passenger is already on this ride. REJECTED /
// CANCELLED_* / NO_SHOW must not count, or a passenger who cancelled would still
// be shown "Continue Ride" with no way to request again.
const ACTIVE_BOOKING_STATUSES = ['PENDING', 'CONFIRMED', 'COMPLETED'];

export function findActiveBookingForRide(
  bookings: any,
  rideId: string | undefined,
): any | null {
  if (!Array.isArray(bookings) || !rideId) return null;
  return (
    bookings.find(
      (b: any) =>
        getBookingRideId(b) === rideId && ACTIVE_BOOKING_STATUSES.includes(b?.status),
    ) ?? null
  );
}

// A live booking on a *different* ride. Used to stop a passenger who is already
// travelling from being dropped straight into another ride's Journey Underway.
export function findActiveBookingOnOtherRide(
  bookings: any,
  rideId: string | undefined,
): any | null {
  if (!Array.isArray(bookings)) return null;
  return (
    bookings.find(
      (b: any) =>
        getBookingRideId(b) &&
        getBookingRideId(b) !== rideId &&
        ACTIVE_BOOKING_STATUSES.includes(b?.status),
    ) ?? null
  );
}
