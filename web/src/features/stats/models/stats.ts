/**
 * Supported statistics time periods.
 */
export type PeriodType = 'week' | 'month';

/**
 * Calendar date range for statistics aggregation.
 */
export interface DateRange {
  startDate: string; // 'YYYY-MM-DD'
  endDate: string; // 'YYYY-MM-DD'
  label: string; // e.g. "Nov 2 – Nov 8, 2026" or "November 2026"
  days: string[]; // List of all calendar date strings in chronological order
}

/**
 * Daily productivity metrics for a single date.
 */
export interface DayMetric {
  date: string; // 'YYYY-MM-DD'
  dayLabel: string; // e.g. "Mon", "Tue" or "01", "02"
  shortDateLabel: string; // e.g. "Nov 4"
  tasksCompleted: number;
  habitsScheduled: number;
  habitsCompleted: number;
  habitRate: number; // 0–100 integer percentage
}

/**
 * Eisenhower matrix task distribution counts and percentages.
 */
export interface QuadrantDistribution {
  DO: number;
  SCHEDULE: number;
  DELEGATE: number;
  ELIMINATE: number;
  total: number;
  percentages: {
    DO: number;
    SCHEDULE: number;
    DELEGATE: number;
    ELIMINATE: number;
  };
}

/**
 * Information regarding the habit with the longest streak.
 */
export interface BestStreakStat {
  habitId: string;
  habitName: string;
  colorKey: string;
  streak: number;
}

/**
 * Aggregated statistics summary for a given period.
 */
export interface PeriodStats {
  periodType: PeriodType;
  range: DateRange;
  totalTasksCompleted: number;
  totalHabitsScheduled: number;
  totalHabitsCompleted: number;
  overallHabitRate: number; // 0–100 integer percentage
  dailyMetrics: DayMetric[];
  bestStreak: BestStreakStat | null;
  quadrantDistribution: QuadrantDistribution;
}

