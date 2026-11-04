import { describe, it, expect } from 'vitest';
import type { Habit } from '../models/habit';
import { isScheduled, computeStreak, getWeekStrip } from './habitOperations';
import { addDays, daysBetween, getDayOfWeek } from './dateUtils';

describe('Habit pure logic operations', () => {
  const baseHabit: Habit = {
    id: '01HARC5B0Q8A4T5V9B11C2D3E4',
    name: 'Morning Meditation',
    frequency: { type: 'daily' },
    colorKey: 'indigo',
    createdAt: '2026-11-01T00:00:00.000Z',
  };

  describe('dateUtils: day boundary and leap year tests', () => {
    it('handles leap year transition in February correctly', () => {
      // 2024 is a leap year (Feb 29 exists)
      expect(addDays('2024-02-28', 1)).toBe('2024-02-29');
      expect(addDays('2024-02-29', 1)).toBe('2024-03-01');
      expect(daysBetween('2024-02-28', '2024-03-01')).toBe(2);

      // 2026 is non-leap
      expect(addDays('2026-02-28', 1)).toBe('2026-03-01');
      expect(daysBetween('2026-02-28', '2026-03-01')).toBe(1);
    });

    it('handles year-end boundaries correctly', () => {
      expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
      expect(addDays('2027-01-01', -1)).toBe('2026-12-31');
    });

    it('resolves day of week accurately', () => {
      // 2026-11-01 was Sunday (0)
      expect(getDayOfWeek('2026-11-01')).toBe(0);
      // 2026-11-02 was Monday (1)
      expect(getDayOfWeek('2026-11-02')).toBe(1);
      // 2026-11-07 was Saturday (6)
      expect(getDayOfWeek('2026-11-07')).toBe(6);
    });
  });

  describe('isScheduled', () => {
    it('returns true for daily habit on any calendar date', () => {
      expect(isScheduled(baseHabit, '2026-11-04')).toBe(true);
      expect(isScheduled(baseHabit, '2026-11-05')).toBe(true);
    });

    it('returns true only on scheduled weekdays', () => {
      const weekdayHabit: Habit = {
        ...baseHabit,
        frequency: { type: 'weekdays', days: [1, 3, 5] }, // Mon, Wed, Fri
      };

      // 2026-11-02 is Monday (1)
      expect(isScheduled(weekdayHabit, '2026-11-02')).toBe(true);
      // 2026-11-03 is Tuesday (2)
      expect(isScheduled(weekdayHabit, '2026-11-03')).toBe(false);
      // 2026-11-04 is Wednesday (3)
      expect(isScheduled(weekdayHabit, '2026-11-04')).toBe(true);
      // 2026-11-05 is Thursday (4)
      expect(isScheduled(weekdayHabit, '2026-11-05')).toBe(false);
      // 2026-11-06 is Friday (5)
      expect(isScheduled(weekdayHabit, '2026-11-06')).toBe(true);
      // 2026-11-07 is Saturday (6)
      expect(isScheduled(weekdayHabit, '2026-11-07')).toBe(false);
      // 2026-11-08 is Sunday (0)
      expect(isScheduled(weekdayHabit, '2026-11-08')).toBe(false);
    });

    it('returns false for dates after habit was archived', () => {
      const archivedHabit: Habit = {
        ...baseHabit,
        archivedAt: '2026-11-04T12:00:00.000Z',
      };

      // On or before archival date, schedule logic still holds
      expect(isScheduled(archivedHabit, '2026-11-04')).toBe(true);
      // After archival date, it is no longer scheduled
      expect(isScheduled(archivedHabit, '2026-11-05')).toBe(false);
      expect(isScheduled(archivedHabit, '2026-11-10')).toBe(false);
    });
  });

  describe('computeStreak', () => {
    it('returns 0 for habits with no logs', () => {
      const result = computeStreak([], baseHabit, '2026-11-04');
      expect(result).toEqual({ current: 0, longest: 0 });
    });

    it('computes current and longest streak for consecutive daily logs', () => {
      const logs = [
        { habitId: baseHabit.id, date: '2026-11-01' },
        { habitId: baseHabit.id, date: '2026-11-02' },
        { habitId: baseHabit.id, date: '2026-11-03' },
        { habitId: baseHabit.id, date: '2026-11-04' },
      ];

      // If today is 2026-11-04 and logged, streak is 4
      const result = computeStreak(logs, baseHabit, '2026-11-04');
      expect(result).toEqual({ current: 4, longest: 4 });
    });

    it('does NOT break streak when today is in progress and not yet completed', () => {
      const logs = [
        { habitId: baseHabit.id, date: '2026-11-01' },
        { habitId: baseHabit.id, date: '2026-11-02' },
        { habitId: baseHabit.id, date: '2026-11-03' },
      ];

      // Today is 2026-11-04, not logged yet. Streak from yesterday still holds!
      const result = computeStreak(logs, baseHabit, '2026-11-04');
      expect(result).toEqual({ current: 3, longest: 3 });
    });

    it('resets current streak when a past scheduled day was missed', () => {
      const logs = [
        { habitId: baseHabit.id, date: '2026-11-01' },
        { habitId: baseHabit.id, date: '2026-11-02' },
        // 2026-11-03 missed!
      ];

      // Today is 2026-11-04. Yesterday (Nov 3) was missed. Current streak is 0, longest is 2.
      const result = computeStreak(logs, baseHabit, '2026-11-04');
      expect(result).toEqual({ current: 0, longest: 2 });
    });

    it('starts a new streak of 1 when today is completed after previous missed day', () => {
      const logs = [
        { habitId: baseHabit.id, date: '2026-11-01' },
        { habitId: baseHabit.id, date: '2026-11-02' },
        // Nov 3 missed
        { habitId: baseHabit.id, date: '2026-11-04' },
      ];

      const result = computeStreak(logs, baseHabit, '2026-11-04');
      expect(result).toEqual({ current: 1, longest: 2 });
    });

    it('unscheduled days do NOT break streak (weekdays habit)', () => {
      const mwfHabit: Habit = {
        ...baseHabit,
        frequency: { type: 'weekdays', days: [1, 3, 5] }, // Mon, Wed, Fri
      };

      // 2026-11-02 (Mon) and 2026-11-04 (Wed) logged
      const logs = [
        { habitId: mwfHabit.id, date: '2026-11-02' },
        { habitId: mwfHabit.id, date: '2026-11-04' },
      ];

      // On Thursday (Nov 5 - unscheduled day), streak should still be 2!
      const resultThu = computeStreak(logs, mwfHabit, '2026-11-05');
      expect(resultThu).toEqual({ current: 2, longest: 2 });

      // On Friday (Nov 6 - scheduled day, today, not logged yet), streak is still 2!
      const resultFriMorning = computeStreak(logs, mwfHabit, '2026-11-06');
      expect(resultFriMorning).toEqual({ current: 2, longest: 2 });

      // If user completes Friday (Nov 6), streak becomes 3!
      const logsWithFri = [
        ...logs,
        { habitId: mwfHabit.id, date: '2026-11-06' },
      ];
      const resultFriDone = computeStreak(logsWithFri, mwfHabit, '2026-11-06');
      expect(resultFriDone).toEqual({ current: 3, longest: 3 });

      // Over the weekend (Nov 7 Sat, Nov 8 Sun - unscheduled), streak is STILL 3!
      const resultSun = computeStreak(logsWithFri, mwfHabit, '2026-11-08');
      expect(resultSun).toEqual({ current: 3, longest: 3 });
    });

    it('correctly handles log mundur (retroactive backfill or unordered logs)', () => {
      // Logs passed out of chronological order
      const unorderedLogs = [
        { habitId: baseHabit.id, date: '2026-11-04' },
        { habitId: baseHabit.id, date: '2026-11-01' },
        { habitId: baseHabit.id, date: '2026-11-03' },
        { habitId: baseHabit.id, date: '2026-11-02' },
      ];

      const result = computeStreak(unorderedLogs, baseHabit, '2026-11-04');
      expect(result).toEqual({ current: 4, longest: 4 });
    });

    it('preserves streak for archived habits without penalizing subsequent days', () => {
      const archivedHabit: Habit = {
        ...baseHabit,
        archivedAt: '2026-11-03T18:00:00.000Z',
      };

      const logs = [
        { habitId: archivedHabit.id, date: '2026-11-01' },
        { habitId: archivedHabit.id, date: '2026-11-02' },
        { habitId: archivedHabit.id, date: '2026-11-03' },
      ];

      // Today is Nov 06, habit was archived on Nov 03.
      // Streak should evaluate up to archival date: streak is 3, not 0!
      const result = computeStreak(logs, archivedHabit, '2026-11-06');
      expect(result).toEqual({ current: 3, longest: 3 });
    });
  });

  describe('getWeekStrip', () => {
    it('generates 7 days starting on Monday when weekStartsOn = 1', () => {
      // 2026-11-04 is Wednesday
      const week = getWeekStrip('2026-11-04', 1);

      expect(week).toHaveLength(7);
      expect(week[0].shortDayName).toBe('Mon');
      expect(week[0].date).toBe('2026-11-02');
      expect(week[2].date).toBe('2026-11-04');
      expect(week[2].isReference).toBe(true);
      expect(week[6].shortDayName).toBe('Sun');
      expect(week[6].date).toBe('2026-11-08');
    });

    it('generates 7 days starting on Sunday when weekStartsOn = 0', () => {
      // 2026-11-04 is Wednesday
      const week = getWeekStrip('2026-11-04', 0);

      expect(week).toHaveLength(7);
      expect(week[0].shortDayName).toBe('Sun');
      expect(week[0].date).toBe('2026-11-01');
      expect(week[3].date).toBe('2026-11-04');
      expect(week[3].isReference).toBe(true);
      expect(week[6].shortDayName).toBe('Sat');
      expect(week[6].date).toBe('2026-11-07');
    });
  });
});
