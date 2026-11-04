// habits feature — public API barrel
// Only symbols exported here are accessible from outside this feature.

export type {
  Habit,
  HabitLog,
  HabitFrequency,
  CreateHabitInput,
  IHabitRepository,
  IHabitLogRepository,
  HabitColorKey,
  HabitColorDefinition,
} from './models';

export {
  HabitSchema,
  HabitLogSchema,
  HabitFrequencySchema,
  CreateHabitInputSchema,
  HABIT_COLORS,
  HABIT_COLOR_KEYS,
  createHabitEntity,
} from './models';

export {
  HabitRepository,
  HabitLogRepository,
} from './data';

export {
  useHabits,
  useHabitStore,
  initHabitStore,
  computeStreak,
  isScheduled,
  getWeekStrip,
  parseDateParts,
  createLocalDate,
  getDayOfWeek,
  addDays,
  daysBetween,
} from './logic';

export type {
  WeekStripDay,
  StreakResult,
  HabitFilter,
} from './logic';

export {
  HabitsPage,
  HabitItem,
  HabitForm,
  WeekStrip,
} from './ui';
