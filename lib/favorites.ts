/**
 * Shared driver-id resolution for the favorites feature.
 *
 * Accepts a ride row, a favorite entry, or a raw id and returns the
 * driver id, or `undefined` when none can be derived. Never returns a
 * favorite-entry `_id` as a driver id — fail-closed to `undefined` so
 * hearts hide rather than call the API with a wrong id.
 */
export function resolveDriverId(input: any): string | undefined {
  if (!input) return undefined;
  if (typeof input === 'string') return input;
  const d = input.driver ?? input;
  if (typeof d === 'string') return d;
  return d?._id ?? input.driverId ?? input.driver_id ?? undefined;
}
