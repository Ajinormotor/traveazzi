// The API populates `driver` with: firstName, lastName, avatar,
// averageRatingAsDriver, totalRatingsAsDriver.
// There is no `rider_name` field on a ride — reading it renders blank.
export function getDriverName(driver: any, fallback = 'Driver'): string {
  const name = [driver?.firstName, driver?.lastName]
    .filter((part) => typeof part === 'string' && part.trim())
    .join(' ')
    .trim();

  return name || fallback;
}
