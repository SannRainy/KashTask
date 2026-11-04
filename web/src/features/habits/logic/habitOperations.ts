import type { Clock } from '@core/clock';
import {
  systemClock,
  toLocalDateString,
  getTodayDateString,
} from '@core/clock';
import type { Habit, HabitLog } from '../models/habit';
import { addDays, createLocalDate, getDayOfWeek } from './dateUtils';

const SHORT_DAY_NAMES = [
  'Sun',
  'Mon',
  'Tue',
  'Wed',
  'Thu',
  'Fri',
  'Sat',
] as const;

const MONTH_NAMES = [
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

export interface WeekStripDay {
  date: string; // YYYY-MM-DD
  dayOfWeek: number; // 0..6 (0=Sun, 1=Mon, ..., 6=Sat)
  dayNumber: number; // 1..31
  monthName: string; // Jan..Dec
  shortDayName: string; // Sun..Sat
  isToday: boolean;
  isReference: boolean;
}

export interface StreakResult {
  current: number;
  longest: number;
}

/**
 * Pure function determining whether a habit is scheduled to be performed on a specific date.
 * Respects frequency ('daily' or 'weekdays') and prevents scheduling after habit archival.
 */
export function isScheduled(habit: Habit, date: string | Date): boolean {
  const dateStr = typeof date === 'string' ? date : toLocalDateString(date);

  // If habit is archived, it is not scheduled for dates strictly after archival
  if (habit.archivedAt) {
    const archiveDateStr = toLocalDateString(new Date(habit.archivedAt));
    if (dateStr > archiveDateStr) {
      return false;
    }
  }

  if (habit.frequency.type === 'daily') {
    return true;
  }

  if (habit.frequency.type === 'weekdays') {
    const dayOfWeek = getDayOfWeek(dateStr);
    return habit.frequency.days.includes(dayOfWeek);
  }

  return false;
}

/**
 * Pure function calculating the current and longest streaks for a habit.
 *
 * Rules:
 * - Unscheduled days do NOT break the streak.
 * - Today in progress (not completed yet) does NOT break the streak accumulated so far.
 * - Retroactive/out-of-order logs are properly handled chronologically.
 * - Archived habits preserve their streaks up to archival date and are not penalized thereafter.
 */
export function computeStreak(
  logs: (HabitLog | string)[],
  habit: Habit,
  todayDate?: string | Date,
  clock: Clock = systemClock
): StreakResult {
  const todayStr = todayDate
    ? typeof todayDate === 'string'
      ? todayDate
      : toLocalDateString(todayDate)
    : getTodayDateString(clock);

  // Collect logged calendar dates for this specific habit
  const logDates = new Set<string>();
  for (const item of logs) {
    if (typeof item === 'string') {
      logDates.add(item);
    } else if (item.habitId === habit.id) {
      logDates.add(item.date);
    }
  }

  if (logDates.size === 0) {
    return { current: 0, longest: 0 };
  }

  // If habit is archived, evaluate up to archival date (if before today)
  let archiveDate: string | null = null;
  if (habit.archivedAt) {
    archiveDate = toLocalDateString(new Date(habit.archivedAt));
  }

  const evalDate =
    archiveDate && archiveDate < todayStr ? archiveDate : todayStr;

  // Earliest boundary: minimum of habit creation date and earliest log
  const createdDateStr = toLocalDateString(new Date(habit.createdAt));
  let minDate = createdDateStr;
  for (const date of logDates) {
    if (date < minDate) {
      minDate = date;
    }
  }

  if (minDate > evalDate) {
    return { current: 0, longest: 0 };
  }

  let longest = 0;
  let tempStreak = 0;
  let curr = minDate;

  while (curr <= evalDate) {
    const scheduled = isScheduled(habit, curr);
    const logged = logDates.has(curr);

    if (logged) {
      tempStreak += 1;
      if (tempStreak > longest) {
        longest = tempStreak;
      }
    } else if (scheduled) {
      // Scheduled day missed.
      // If curr is today (ongoing day) or archiveDate when archived without logging,
      // it is exempt from breaking previous streak.
      const isExemptFromReset =
        curr === todayStr || (archiveDate !== null && curr === archiveDate);

      if (!isExemptFromReset) {
        tempStreak = 0;
      }
    }
    // If not logged and not scheduled: skip, unscheduled day does not break streak

    curr = addDays(curr, 1);
  }

  return {
    current: tempStreak,
    longest,
  };
}

/**
 * Generate a 7-day strip representing the calendar week containing referenceDate.
 * Respects weekStartsOn configuration (0 = Sunday, 1 = Monday).
 */
export function getWeekStrip(
  referenceDate: string | Date,
  weekStartsOn: 0 | 1 = 1,
  clock: Clock = systemClock
): WeekStripDay[] {
  const refDateStr =
    typeof referenceDate === 'string'
      ? referenceDate
      : toLocalDateString(referenceDate);
  const todayStr = getTodayDateString(clock);

  const refDayOfWeek = getDayOfWeek(refDateStr);
  const offset = (refDayOfWeek - weekStartsOn + 7) % 7;
  const startOfWeekDateStr = addDays(refDateStr, -offset);

  const days: WeekStripDay[] = [];
  for (let i = 0; i < 7; i++) {
    const dateStr = addDays(startOfWeekDateStr, i);
    const dateObj = createLocalDate(dateStr);
    const dayOfWeek = getDayOfWeek(dateStr);

    days.push({
      date: dateStr,
      dayOfWeek,
      dayNumber: dateObj.getDate(),
      monthName: MONTH_NAMES[dateObj.getMonth()],
      shortDayName: SHORT_DAY_NAMES[dayOfWeek],
      isToday: dateStr === todayStr,
      isReference: dateStr === refDateStr,
    });
  }

  return days;
}
