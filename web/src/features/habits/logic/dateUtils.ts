import { toLocalDateString } from '@core/clock';

/**
 * Parse a 'YYYY-MM-DD' calendar date string into numeric year, month, and day.
 */
export function parseDateParts(dateStr: string): {
  year: number;
  month: number;
  day: number;
} {
  const [yearStr, monthStr, dayStr] = dateStr.split('-');
  return {
    year: Number.parseInt(yearStr, 10),
    month: Number.parseInt(monthStr, 10),
    day: Number.parseInt(dayStr, 10),
  };
}

/**
 * Create a Date object set to local noon (12:00:00) to ensure immunity against DST shifts.
 */
export function createLocalDate(dateStr: string): Date {
  const { year, month, day } = parseDateParts(dateStr);
  return new Date(year, month - 1, day, 12, 0, 0);
}

/**
 * Returns the day of the week: 0 for Sunday, 1 for Monday, ..., 6 for Saturday.
 */
export function getDayOfWeek(date: string | Date): number {
  if (typeof date === 'string') {
    return createLocalDate(date).getDay();
  }
  return date.getDay();
}

/**
 * Add or subtract days from a 'YYYY-MM-DD' calendar date string deterministically.
 */
export function addDays(dateStr: string, days: number): string {
  const date = createLocalDate(dateStr);
  date.setDate(date.getDate() + days);
  return toLocalDateString(date);
}

/**
 * Calculate the difference in calendar days between two dates (dateStrB - dateStrA).
 */
export function daysBetween(dateStrA: string, dateStrB: string): number {
  const a = createLocalDate(dateStrA);
  const b = createLocalDate(dateStrB);
  const diffMs = b.getTime() - a.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}
