import { describe, it, expect } from 'vitest';
import type { Task } from '@features/tasks';
import type { Habit, HabitLog } from '@features/habits';
import {
  selectPeriodStats,
  selectQuadrantDistribution,
  selectBestStreak,
} from './statsSelectors';
import {
  getWeekDateRange,
  getMonthDateRange,
  navigatePeriod,
  getDaysInMonth,
} from './statsPeriodUtils';

describe('Stats Period Utils', () => {
  it('correctly calculates days in month including leap years', () => {
    // 2024 is a leap year (Feb has 29 days)
    expect(getDaysInMonth(2024, 2)).toBe(29);
    // 2026 is non-leap (Feb has 28 days)
    expect(getDaysInMonth(2026, 2)).toBe(28);
    // Months with 30 and 31 days
    expect(getDaysInMonth(2026, 11)).toBe(30);
    expect(getDaysInMonth(2026, 12)).toBe(31);
  });

  it('handles year rollover for weekly range', () => {
    // 2026-12-31 is Thursday
    const range = getWeekDateRange('2026-12-31', 1);
    expect(range.startDate).toBe('2026-12-28'); // Monday
    expect(range.endDate).toBe('2027-01-03'); // Sunday
    expect(range.days).toHaveLength(7);
    expect(range.label).toContain('2026');
    expect(range.label).toContain('2027');
  });

  it('handles month rollover for weekly range', () => {
    // 2026-11-01 was Sunday. If weekStartsOn = 1 (Monday), week starts Oct 26 and ends Nov 1
    const rangeMon = getWeekDateRange('2026-11-01', 1);
    expect(rangeMon.startDate).toBe('2026-10-26');
    expect(rangeMon.endDate).toBe('2026-11-01');
    expect(rangeMon.label).toBe('Oct 26 – Nov 1, 2026');

    // If weekStartsOn = 0 (Sunday), week starts Nov 1 and ends Nov 7
    const rangeSun = getWeekDateRange('2026-11-01', 0);
    expect(rangeSun.startDate).toBe('2026-11-01');
    expect(rangeSun.endDate).toBe('2026-11-07');
    expect(rangeSun.label).toBe('Nov 1 – Nov 7, 2026');
  });

  it('generates full month range for November 2026', () => {
    const range = getMonthDateRange('2026-11-15');
    expect(range.startDate).toBe('2026-11-01');
    expect(range.endDate).toBe('2026-11-30');
    expect(range.days).toHaveLength(30);
    expect(range.label).toBe('November 2026');
  });

  it('navigates periods backward and forward cleanly', () => {
    // Week navigation
    expect(navigatePeriod('2026-11-04', 'week', 'prev')).toBe('2026-10-28');
    expect(navigatePeriod('2026-11-04', 'week', 'next')).toBe('2026-11-11');

    // Month navigation
    expect(navigatePeriod('2026-11-04', 'month', 'prev')).toBe('2026-10-01');
    expect(navigatePeriod('2026-11-04', 'month', 'next')).toBe('2026-12-01');
  });
});

describe('Stats Selectors', () => {
  const fixedClock = () => new Date('2026-11-04T12:00:00.000Z');

  const mockTasks: Task[] = [
    {
      id: '01HARC4K1M9K7Z2P7N00W8J4Q1',
      title: 'Do task (Q1)',
      urgent: true,
      important: true,
      status: 'done',
      order: 1,
      createdAt: '2026-11-04T07:00:00.000Z',
      updatedAt: '2026-11-04T08:00:00.000Z',
      completedAt: '2026-11-04T08:00:00.000Z',
    },
    {
      id: '01HARC4K1M9K7Z2P7N00W8J4Q2',
      title: 'Schedule task (Q2)',
      urgent: false,
      important: true,
      status: 'done',
      order: 2,
      createdAt: '2026-11-04T07:00:00.000Z',
      updatedAt: '2026-11-04T09:00:00.000Z',
      completedAt: '2026-11-04T09:00:00.000Z',
    },
    {
      id: '01HARC4K1M9K7Z2P7N00W8J4Q3',
      title: 'Delegate task (Q3)',
      urgent: true,
      important: false,
      status: 'done',
      order: 3,
      createdAt: '2026-11-04T07:00:00.000Z',
      updatedAt: '2026-11-05T10:00:00.000Z',
      completedAt: '2026-11-05T10:00:00.000Z',
    },
    {
      id: '01HARC4K1M9K7Z2P7N00W8J4Q4',
      title: 'Eliminate task (Q4)',
      urgent: false,
      important: false,
      status: 'todo',
      order: 4,
      createdAt: '2026-11-04T07:00:00.000Z',
      updatedAt: '2026-11-04T07:00:00.000Z',
    },
  ];

  const mockHabits: Habit[] = [
    {
      id: '01HARC5B0Q8A4T5V9B11C2D301',
      name: 'Daily Meditation',
      frequency: { type: 'daily' },
      colorKey: 'indigo',
      createdAt: '2026-11-01T00:00:00.000Z',
    },
    {
      id: '01HARC5B0Q8A4T5V9B11C2D302',
      name: 'Gym Workout',
      frequency: { type: 'weekdays', days: [1, 3, 5] }, // Mon (2), Wed (4), Fri (6)
      colorKey: 'emerald',
      createdAt: '2026-11-01T00:00:00.000Z',
    },
  ];

  const mockLogs: HabitLog[] = [
    // Habit 1: Daily Meditation (Nov 1, 2, 3, 4)
    { habitId: '01HARC5B0Q8A4T5V9B11C2D301', date: '2026-11-01' },
    { habitId: '01HARC5B0Q8A4T5V9B11C2D301', date: '2026-11-02' },
    { habitId: '01HARC5B0Q8A4T5V9B11C2D301', date: '2026-11-03' },
    { habitId: '01HARC5B0Q8A4T5V9B11C2D301', date: '2026-11-04' },
    // Habit 2: Gym Workout (Nov 2 Mon, Nov 4 Wed)
    { habitId: '01HARC5B0Q8A4T5V9B11C2D302', date: '2026-11-02' },
    { habitId: '01HARC5B0Q8A4T5V9B11C2D302', date: '2026-11-04' },
  ];

  it('calculates quadrant distribution accurately', () => {
    const dist = selectQuadrantDistribution(mockTasks);
    expect(dist.total).toBe(4);
    expect(dist.DO).toBe(1);
    expect(dist.SCHEDULE).toBe(1);
    expect(dist.DELEGATE).toBe(1);
    expect(dist.ELIMINATE).toBe(1);
    expect(dist.percentages.DO).toBe(25);
    expect(dist.percentages.SCHEDULE).toBe(25);
    expect(dist.percentages.DELEGATE).toBe(25);
    expect(dist.percentages.ELIMINATE).toBe(25);
  });

  it('selects best streak habit', () => {
    const best = selectBestStreak(
      mockHabits,
      mockLogs,
      '2026-11-04',
      fixedClock
    );
    expect(best).not.toBeNull();
    expect(best?.habitName).toBe('Daily Meditation');
    expect(best?.streak).toBe(4);
  });

  it('computes weekly statistics starting on Monday (weekStartsOn = 1)', () => {
    const stats = selectPeriodStats({
      tasks: mockTasks,
      habits: mockHabits,
      logs: mockLogs,
      periodType: 'week',
      referenceDate: '2026-11-04',
      weekStartsOn: 1,
      clock: fixedClock,
    });

    expect(stats.periodType).toBe('week');
    expect(stats.range.startDate).toBe('2026-11-02');
    expect(stats.range.endDate).toBe('2026-11-08');
    expect(stats.range.days).toHaveLength(7);

    // Total tasks completed: 2 on Nov 4, 1 on Nov 5 = 3
    expect(stats.totalTasksCompleted).toBe(3);

    // Check Nov 4 daily metric
    const nov4Metric = stats.dailyMetrics.find((m) => m.date === '2026-11-04');
    expect(nov4Metric).toBeDefined();
    expect(nov4Metric?.tasksCompleted).toBe(2);
    // On Nov 4 (Wed): both habits scheduled and both completed -> 100%
    expect(nov4Metric?.habitsScheduled).toBe(2);
    expect(nov4Metric?.habitsCompleted).toBe(2);
    expect(nov4Metric?.habitRate).toBe(100);

    // Check Nov 3 daily metric (Tue)
    const nov3Metric = stats.dailyMetrics.find((m) => m.date === '2026-11-03');
    expect(nov3Metric).toBeDefined();
    expect(nov3Metric?.tasksCompleted).toBe(0);
    // Habit 1 scheduled and completed, Habit 2 NOT scheduled on Tue -> 1/1 = 100%
    expect(nov3Metric?.habitsScheduled).toBe(1);
    expect(nov3Metric?.habitsCompleted).toBe(1);
    expect(nov3Metric?.habitRate).toBe(100);

    // Check Nov 5 daily metric (Thu)
    const nov5Metric = stats.dailyMetrics.find((m) => m.date === '2026-11-05');
    expect(nov5Metric).toBeDefined();
    expect(nov5Metric?.tasksCompleted).toBe(1);
    // Habit 1 scheduled, but NOT logged -> 0/1 = 0%
    expect(nov5Metric?.habitsScheduled).toBe(1);
    expect(nov5Metric?.habitsCompleted).toBe(0);
    expect(nov5Metric?.habitRate).toBe(0);
  });

  it('computes weekly statistics starting on Sunday (weekStartsOn = 0)', () => {
    const stats = selectPeriodStats({
      tasks: mockTasks,
      habits: mockHabits,
      logs: mockLogs,
      periodType: 'week',
      referenceDate: '2026-11-04',
      weekStartsOn: 0,
      clock: fixedClock,
    });

    expect(stats.range.startDate).toBe('2026-11-01');
    expect(stats.range.endDate).toBe('2026-11-07');
    expect(stats.dailyMetrics[0].dayLabel).toBe('Sun');
    expect(stats.dailyMetrics[0].date).toBe('2026-11-01');
    expect(stats.dailyMetrics[0].habitsCompleted).toBe(1); // Habit 1 completed on Nov 1
  });

  it('computes monthly statistics for November 2026', () => {
    const stats = selectPeriodStats({
      tasks: mockTasks,
      habits: mockHabits,
      logs: mockLogs,
      periodType: 'month',
      referenceDate: '2026-11-04',
      clock: fixedClock,
    });

    expect(stats.periodType).toBe('month');
    expect(stats.range.startDate).toBe('2026-11-01');
    expect(stats.range.endDate).toBe('2026-11-30');
    expect(stats.dailyMetrics).toHaveLength(30);
    expect(stats.totalTasksCompleted).toBe(3);
    expect(stats.bestStreak?.streak).toBe(4);
  });
});
