import { toLocalDateString } from '@core/clock';
import type { DateRange, PeriodType } from '../models/stats';

const MONTH_NAMES_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const;

const MONTH_NAMES_FULL = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;

/**
 * Parse YYYY-MM-DD into numeric year, month (1-12), and day (1-31).
 */
export function parseDate(dateStr: string): {
  year: number;
  month: number;
  day: number;
} {
  const [y, m, d] = dateStr.split('-').map(Number);
  return { year: y, month: m, day: d };
}

/**
 * Create a local date set at noon (12:00:00) to prevent DST shifts.
 */
export function createLocalDate(dateStr: string): Date {
  const { year, month, day } = parseDate(dateStr);
  return new Date(year, month - 1, day, 12, 0, 0);
}

/**
 * Add or subtract days to a date string.
 */
export function addDays(dateStr: string, days: number): string {
  const d = createLocalDate(dateStr);
  d.setDate(d.getDate() + days);
  return toLocalDateString(d);
}

/**
 * Get day of the week (0 = Sunday, 1 = Monday, ..., 6 = Saturday).
 */
export function getDayOfWeek(dateStr: string): number {
  return createLocalDate(dateStr).getDay();
}

/**
 * Get the number of days in a specific calendar month.
 * Automatically handles leap years (e.g. Feb in 2024 = 29, Feb in 2026 = 28).
 */
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

/**
 * Calculate weekly DateRange for the week containing referenceDate.
 * Respects weekStartsOn (0 = Sunday, 1 = Monday).
 */
export function getWeekDateRange(
  referenceDate: string | Date,
  weekStartsOn: 0 | 1 = 1
): DateRange {
  const refStr =
    typeof referenceDate === 'string'
      ? referenceDate
      : toLocalDateString(referenceDate);

  const dayOfWeek = getDayOfWeek(refStr);
  const offset = (dayOfWeek - weekStartsOn + 7) % 7;
  const startStr = addDays(refStr, -offset);
  const endStr = addDays(startStr, 6);

  const days: string[] = [];
  for (let i = 0; i < 7; i++) {
    days.push(addDays(startStr, i));
  }

  const startDateObj = createLocalDate(startStr);
  const endDateObj = createLocalDate(endStr);

  const startMonth = MONTH_NAMES_SHORT[startDateObj.getMonth()];
  const endMonth = MONTH_NAMES_SHORT[endDateObj.getMonth()];
  const startYear = startDateObj.getFullYear();
  const endYear = endDateObj.getFullYear();

  let label: string;
  if (startYear !== endYear) {
    label = `${startMonth} ${startDateObj.getDate()}, ${startYear} – ${endMonth} ${endDateObj.getDate()}, ${endYear}`;
  } else {
    label = `${startMonth} ${startDateObj.getDate()} – ${endMonth} ${endDateObj.getDate()}, ${startYear}`;
  }

  return {
    startDate: startStr,
    endDate: endStr,
    label,
    days,
  };
}

/**
 * Calculate monthly DateRange for the calendar month containing referenceDate.
 */
export function getMonthDateRange(referenceDate: string | Date): DateRange {
  const refStr =
    typeof referenceDate === 'string'
      ? referenceDate
      : toLocalDateString(referenceDate);

  const { year, month } = parseDate(refStr);
  const totalDays = getDaysInMonth(year, month);

  const startMonthPadded = String(month).padStart(2, '0');
  const startStr = `${year}-${startMonthPadded}-01`;
  const endStr = `${year}-${startMonthPadded}-${String(totalDays).padStart(2, '0')}`;

  const days: string[] = [];
  for (let d = 1; d <= totalDays; d++) {
    days.push(`${year}-${startMonthPadded}-${String(d).padStart(2, '0')}`);
  }

  const label = `${MONTH_NAMES_FULL[month - 1]} ${year}`;

  return {
    startDate: startStr,
    endDate: endStr,
    label,
    days,
  };
}

/**
 * Shift the reference date backward or forward based on the period type.
 */
export function navigatePeriod(
  currentDateStr: string,
  periodType: PeriodType,
  direction: 'prev' | 'next'
): string {
  if (periodType === 'week') {
    return addDays(currentDateStr, direction === 'next' ? 7 : -7);
  }

  // Month navigation: move to the 1st day of previous or next month
  const { year, month } = parseDate(currentDateStr);
  const targetMonthIndex = direction === 'next' ? month : month - 2;
  const target = new Date(year, targetMonthIndex, 1, 12, 0, 0);
  return toLocalDateString(target);
}
