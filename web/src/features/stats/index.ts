// stats feature — public API barrel
// Only symbols exported here are accessible from outside this feature.

export type {
  PeriodType,
  DateRange,
  DayMetric,
  QuadrantDistribution,
  BestStreakStat,
  PeriodStats,
} from './models';

export {
  selectPeriodStats,
  selectQuadrantDistribution,
  selectBestStreak,
  getWeekDateRange,
  getMonthDateRange,
  navigatePeriod,
} from './logic';

export {
  StatsPage,
  PeriodSelector,
  SummaryCards,
  BarChart,
  HabitHeatmap,
  QuadrantBreakdown,
} from './ui';
