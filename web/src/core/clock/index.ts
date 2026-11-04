/**
 * Injectable clock provider for deterministic time manipulation and testing.
 */
export type Clock = () => Date;

/**
 * Default system clock returning the current real-world timestamp.
 */
export const systemClock: Clock = () => new Date();

/**
 * Format a Date to local calendar date string 'YYYY-MM-DD'.
 */
export function toLocalDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Format a Date to ISO 8601 UTC string with trailing 'Z'.
 */
export function toISOStringUTC(date: Date): string {
  return date.toISOString();
}

/**
 * Get the current local date formatted as 'YYYY-MM-DD' using the provided or default clock.
 */
export function getTodayDateString(clock: Clock = systemClock): string {
  return toLocalDateString(clock());
}

/**
 * Get the current ISO 8601 UTC timestamp string using the provided or default clock.
 */
export function getNowISOString(clock: Clock = systemClock): string {
  return toISOStringUTC(clock());
}
