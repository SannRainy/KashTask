import type { Clock } from '@core/clock';
import {
  systemClock,
  toLocalDateString,
  getTodayDateString,
} from '@core/clock';
import type { Task, Quadrant } from '@features/tasks';
import { deriveQuadrant } from '@features/tasks';
import type { Habit, HabitLog } from '@features/habits';
import { isScheduled, computeStreak } from '@features/habits';
import type {
  BestStreakStat,
  DayMetric,
  PeriodStats,
  PeriodType,
  QuadrantDistribution,
} from '../models/stats';
import {
  createLocalDate,
  getDayOfWeek,
  getMonthDateRange,
  getWeekDateRange,
} from './statsPeriodUtils';

const DAY_NAMES_SHORT = [
  'Sun',
  'Mon',
  'Tue',
  'Wed',
  'Thu',
  'Fri',
  'Sat',
] as const;

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

/**
 * Pure selector calculating Eisenhower quadrant distribution for tasks.
 */
export function selectQuadrantDistribution(
  tasks: Task[]
): QuadrantDistribution {
  const counts: Record<Quadrant, number> = {
    DO: 0,
    SCHEDULE: 0,
    DELEGATE: 0,
    ELIMINATE: 0,
  };

  for (const task of tasks) {
    const q = deriveQuadrant(task);
    counts[q] += 1;
  }

  const total = tasks.length;
  const percentages = {
    DO: total > 0 ? Math.round((counts.DO / total) * 100) : 0,
    SCHEDULE: total > 0 ? Math.round((counts.SCHEDULE / total) * 100) : 0,
    DELEGATE: total > 0 ? Math.round((counts.DELEGATE / total) * 100) : 0,
    ELIMINATE: total > 0 ? Math.round((counts.ELIMINATE / total) * 100) : 0,
  };

  return {
    DO: counts.DO,
    SCHEDULE: counts.SCHEDULE,
    DELEGATE: counts.DELEGATE,
    ELIMINATE: counts.ELIMINATE,
    total,
    percentages,
  };
}

/**
 * Pure selector finding the habit with the best streak (longest or current).
 */
export function selectBestStreak(
  habits: Habit[],
  logs: HabitLog[],
  referenceDate?: string | Date,
  clock: Clock = systemClock
): BestStreakStat | null {
  if (habits.length === 0) return null;

  let best: BestStreakStat | null = null;
  let highestValue = -1;

  for (const habit of habits) {
    const streak = computeStreak(logs, habit, referenceDate, clock);
    const candidateValue = Math.max(streak.current, streak.longest);

    if (candidateValue > highestValue) {
      highestValue = candidateValue;
      best = {
        habitId: habit.id,
        habitName: habit.name,
        colorKey: habit.colorKey,
        streak: candidateValue,
      };
    }
  }

  return best;
}

export interface SelectPeriodStatsOptions {
  tasks: Task[];
  habits: Habit[];
  logs: HabitLog[];
  periodType: PeriodType;
  referenceDate?: string | Date;
  weekStartsOn?: 0 | 1;
  clock?: Clock;
}

/**
 * Pure selector aggregating statistics for a given week or month.
 */
export function selectPeriodStats({
  tasks,
  habits,
  logs,
  periodType,
  referenceDate,
  weekStartsOn = 1,
  clock = systemClock,
}: SelectPeriodStatsOptions): PeriodStats {
  const refStr = referenceDate
    ? typeof referenceDate === 'string'
      ? referenceDate
      : toLocalDateString(referenceDate)
    : getTodayDateString(clock);

  // Compute period DateRange
  const range =
    periodType === 'week'
      ? getWeekDateRange(refStr, weekStartsOn)
      : getMonthDateRange(refStr);

  // Map task completion by local date
  const tasksCompletedByDate = new Map<string, number>();
  for (const task of tasks) {
    if (task.status === 'done' && task.completedAt) {
      const compDateStr = toLocalDateString(new Date(task.completedAt));
      tasksCompletedByDate.set(
        compDateStr,
        (tasksCompletedByDate.get(compDateStr) || 0) + 1
      );
    }
  }

  // Set of habit completions by "habitId:date"
  const habitCompletionSet = new Set<string>();
  for (const log of logs) {
    habitCompletionSet.add(`${log.habitId}:${log.date}`);
  }

  let totalTasksCompleted = 0;
  let totalHabitsScheduled = 0;
  let totalHabitsCompleted = 0;

  const dailyMetrics: DayMetric[] = range.days.map((dateStr) => {
    const dateObj = createLocalDate(dateStr);
    const dayOfWeek = getDayOfWeek(dateStr);
    const dayNum = dateObj.getDate();
    const monthIndex = dateObj.getMonth();

    const dayLabel =
      periodType === 'week'
        ? DAY_NAMES_SHORT[dayOfWeek]
        : String(dayNum).padStart(2, '0');

    const shortDateLabel = `${MONTH_NAMES_SHORT[monthIndex]} ${dayNum}`;

    const tasksCompleted = tasksCompletedByDate.get(dateStr) || 0;
    totalTasksCompleted += tasksCompleted;

    let scheduledCount = 0;
    let completedCount = 0;

    for (const habit of habits) {
      if (isScheduled(habit, dateStr)) {
        scheduledCount += 1;
        if (habitCompletionSet.has(`${habit.id}:${dateStr}`)) {
          completedCount += 1;
        }
      }
    }

    totalHabitsScheduled += scheduledCount;
    totalHabitsCompleted += completedCount;

    const habitRate =
      scheduledCount > 0
        ? Math.round((completedCount / scheduledCount) * 100)
        : 0;

    return {
      date: dateStr,
      dayLabel,
      shortDateLabel,
      tasksCompleted,
      habitsScheduled: scheduledCount,
      habitsCompleted: completedCount,
      habitRate,
    };
  });

  const overallHabitRate =
    totalHabitsScheduled > 0
      ? Math.round((totalHabitsCompleted / totalHabitsScheduled) * 100)
      : 0;

  const bestStreak = selectBestStreak(habits, logs, refStr, clock);
  const quadrantDistribution = selectQuadrantDistribution(tasks);

  return {
    periodType,
    range,
    totalTasksCompleted,
    totalHabitsScheduled,
    totalHabitsCompleted,
    overallHabitRate,
    dailyMetrics,
    bestStreak,
    quadrantDistribution,
  };
}
