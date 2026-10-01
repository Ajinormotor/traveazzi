/**
 * Thousands separators for the prices shown across the app.
 *
 * Amounts arrive from the API as raw numbers or numeric strings ("8000",
 * "200000.5"), so they render as "₦8000" without this. Grouping is applied
 * only when the value actually parses as a number — a placeholder like "—"
 * or an empty string is passed through untouched rather than becoming "NaN".
 */
export function formatPrice(value: unknown): string {
  if (value === null || value === undefined || value === '') return '';

  const numeric = typeof value === 'number' ? value : Number(String(value).replace(/[,\s]/g, ''));

  if (!Number.isFinite(numeric)) return String(value);

  // Keep any decimals the API sent, but drop a pointless trailing ".00".
  const hasFraction = !Number.isInteger(numeric);
  return numeric.toLocaleString('en-US', {
    minimumFractionDigits: hasFraction ? 2 : 0,
    maximumFractionDigits: hasFraction ? 2 : 0,
  });
}
