/**
 * Shared driver-id resolution for the favorites feature.
 *
 * Accepts a ride row, a favorite entry, or a raw id and returns the
 * driver id, or `undefined` when none can be derived. Never returns a
 * bare input `_id` (ride id or favorite-entry id) as a driver id —
 * fail-closed to `undefined` so hearts hide rather than call the API
 * with a wrong id. Flat driver objects without a driver/driverId
 * field resolve to `undefined` by design.
 */
export function resolveDriverId(input: any): string | undefined {
  if (!input) return undefined;
  if (typeof input === 'string') return input;
  const d = input.driver;
  if (typeof d === 'string') return d;
  if (d && typeof d === 'object') return d._id ?? undefined;
  return input.driverId ?? input.driver_id ?? undefined;
}
