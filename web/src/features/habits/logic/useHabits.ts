import { create } from 'zustand';
import type {
  CreateHabitInput,
  Habit,
  HabitLog,
  IHabitLogRepository,
  IHabitRepository,
} from '../models/habit';
import { createHabitEntity } from '../models/habit';
import { getNowISOString, getTodayDateString } from '@core/clock';
import { computeStreak, isScheduled } from './habitOperations';

export type HabitFilter = 'active' | 'archived' | 'all';

interface HabitState {
  habits: Habit[];
  logs: HabitLog[];
  selectedDate: string;
  filter: HabitFilter;
  loading: boolean;
  error: string | null;

  // Actions
  loadData: () => Promise<void>;
  addHabit: (input: CreateHabitInput) => Promise<Habit>;
  updateHabit: (
    id: string,
    patch: Partial<Omit<Habit, 'id' | 'createdAt'>>
  ) => Promise<void>;
  archiveHabit: (
    id: string
  ) => Promise<{ habit: Habit; undo: () => Promise<void> }>;
  unarchiveHabit: (id: string) => Promise<void>;
  deleteHabit: (
    id: string
  ) => Promise<{ habit: Habit; logs: HabitLog[]; undo: () => Promise<void> }>;
  toggleHabitDay: (habitId: string, date: string) => Promise<boolean>;
  setSelectedDate: (date: string) => void;
  setFilter: (filter: HabitFilter) => void;
}

let _habitRepo: IHabitRepository | null = null;
let _logRepo: IHabitLogRepository | null = null;

export const useHabitStore = create<HabitState>()((set, get) => ({
  habits: [],
  logs: [],
  selectedDate: getTodayDateString(),
  filter: 'active',
  loading: false,
  error: null,

  async loadData() {
    if (!_habitRepo || !_logRepo) return;
    set({ loading: true, error: null });
    try {
      const [habits, logs] = await Promise.all([
        _habitRepo.getAll(),
        _logRepo.getAll(),
      ]);
      set({ habits, logs, loading: false });
    } catch (err) {
      set({
        loading: false,
        error: err instanceof Error ? err.message : 'Failed to load habits',
      });
    }
  },

  async addHabit(input: CreateHabitInput): Promise<Habit> {
    const habitRepo = _habitRepo;
    if (!habitRepo) {
      throw new Error('Habit repository not initialized');
    }

    const newHabit = createHabitEntity(input);
    const previousHabits = get().habits;

    // Optimistic update
    set({ habits: [...previousHabits, newHabit], error: null });

    try {
      await habitRepo.save(newHabit);
      return newHabit;
    } catch (err) {
      // Rollback
      set({ habits: previousHabits, error: 'Failed to save habit' });
      throw err;
    }
  },

  async updateHabit(
    id: string,
    patch: Partial<Omit<Habit, 'id' | 'createdAt'>>
  ) {
    const habitRepo = _habitRepo;
    if (!habitRepo) return;

    const previousHabits = get().habits;
    const target = previousHabits.find((h) => h.id === id);
    if (!target) return;

    const updated: Habit = {
      ...target,
      ...patch,
    };

    set({
      habits: previousHabits.map((h) => (h.id === id ? updated : h)),
      error: null,
    });

    try {
      await habitRepo.save(updated);
    } catch (err) {
      set({ habits: previousHabits, error: 'Failed to update habit' });
      throw err;
    }
  },

  async archiveHabit(id: string) {
    const habitRepo = _habitRepo;
    if (!habitRepo) {
      throw new Error('Habit repository not initialized');
    }

    const previousHabits = get().habits;
    const habit = previousHabits.find((h) => h.id === id);
    if (!habit) {
      throw new Error(`Habit with id ${id} not found`);
    }

    const now = getNowISOString();
    const archived: Habit = {
      ...habit,
      archivedAt: now,
    };

    set({
      habits: previousHabits.map((h) => (h.id === id ? archived : h)),
      error: null,
    });

    try {
      await habitRepo.save(archived);
    } catch (err) {
      set({ habits: previousHabits, error: 'Failed to archive habit' });
      throw err;
    }

    return {
      habit,
      undo: async () => {
        set({
          habits: get().habits.map((h) => (h.id === id ? habit : h)),
        });
        await habitRepo.save(habit);
      },
    };
  },

  async unarchiveHabit(id: string) {
    const habitRepo = _habitRepo;
    if (!habitRepo) return;

    const previousHabits = get().habits;
    const habit = previousHabits.find((h) => h.id === id);
    if (!habit) return;

    const restored: Habit = {
      ...habit,
      archivedAt: undefined,
    };

    set({
      habits: previousHabits.map((h) => (h.id === id ? restored : h)),
      error: null,
    });

    try {
      await habitRepo.save(restored);
    } catch (err) {
      set({ habits: previousHabits, error: 'Failed to restore habit' });
      throw err;
    }
  },

  async deleteHabit(id: string) {
    const habitRepo = _habitRepo;
    const logRepo = _logRepo;
    if (!habitRepo || !logRepo) {
      throw new Error('Habit repositories not initialized');
    }

    const previousHabits = get().habits;
    const habit = previousHabits.find((h) => h.id === id);
    if (!habit) {
      throw new Error(`Habit with id ${id} not found`);
    }

    const previousLogs = get().logs;
    const relatedLogs = previousLogs.filter((l) => l.habitId === id);

    // Optimistic removal
    set({
      habits: previousHabits.filter((h) => h.id !== id),
      logs: previousLogs.filter((l) => l.habitId !== id),
      error: null,
    });

    try {
      await habitRepo.delete(id);
      for (const log of relatedLogs) {
        await logRepo.delete(log.habitId, log.date);
      }
    } catch (err) {
      set({
        habits: previousHabits,
        logs: previousLogs,
        error: 'Failed to delete habit',
      });
      throw err;
    }

    return {
      habit,
      logs: relatedLogs,
      undo: async () => {
        set({
          habits: [...get().habits, habit],
          logs: [...get().logs, ...relatedLogs],
        });
        await habitRepo.save(habit);
        for (const log of relatedLogs) {
          await logRepo.save(log);
        }
      },
    };
  },

  async toggleHabitDay(habitId: string, date: string): Promise<boolean> {
    const logRepo = _logRepo;
    if (!logRepo) {
      throw new Error('Habit log repository not initialized');
    }

    const previousLogs = get().logs;
    const existingIndex = previousLogs.findIndex(
      (l) => l.habitId === habitId && l.date === date
    );
    const wasCompleted = existingIndex !== -1;

    let updatedLogs: HabitLog[];
    if (wasCompleted) {
      updatedLogs = previousLogs.filter((_, idx) => idx !== existingIndex);
    } else {
      updatedLogs = [...previousLogs, { habitId, date }];
    }

    // Optimistic update
    set({ logs: updatedLogs, error: null });

    try {
      if (wasCompleted) {
        await logRepo.delete(habitId, date);
      } else {
        await logRepo.save({ habitId, date });
      }
      return !wasCompleted;
    } catch (err) {
      // Rollback
      set({ logs: previousLogs, error: 'Failed to update habit log' });
      throw err;
    }
  },

  setSelectedDate(date: string) {
    set({ selectedDate: date });
  },

  setFilter(filter: HabitFilter) {
    set({ filter });
  },
}));

/**
 * Initialize habit store with repository instances.
 */
export async function initHabitStore(
  habitRepo: IHabitRepository,
  logRepo: IHabitLogRepository
): Promise<void> {
  _habitRepo = habitRepo;
  _logRepo = logRepo;
  await useHabitStore.getState().loadData();
}

/**
 * Convenience hook providing habit data and helpers.
 */
export function useHabits() {
  const habits = useHabitStore((s) => s.habits);
  const logs = useHabitStore((s) => s.logs);
  const selectedDate = useHabitStore((s) => s.selectedDate);
  const filter = useHabitStore((s) => s.filter);
  const loading = useHabitStore((s) => s.loading);
  const error = useHabitStore((s) => s.error);

  const addHabit = useHabitStore((s) => s.addHabit);
  const updateHabit = useHabitStore((s) => s.updateHabit);
  const archiveHabit = useHabitStore((s) => s.archiveHabit);
  const unarchiveHabit = useHabitStore((s) => s.unarchiveHabit);
  const deleteHabit = useHabitStore((s) => s.deleteHabit);
  const toggleHabitDay = useHabitStore((s) => s.toggleHabitDay);
  const setSelectedDate = useHabitStore((s) => s.setSelectedDate);
  const setFilter = useHabitStore((s) => s.setFilter);
  const loadData = useHabitStore((s) => s.loadData);

  // Filter habits according to selected filter tab
  const filteredHabits = habits.filter((habit) => {
    if (filter === 'active') return !habit.archivedAt;
    if (filter === 'archived') return Boolean(habit.archivedAt);
    return true; // 'all'
  });

  // Check if a habit is completed on a specific date
  const isCompletedOn = (habitId: string, date: string): boolean => {
    return logs.some((l) => l.habitId === habitId && l.date === date);
  };

  // Compute streak for a given habit
  const getStreak = (habit: Habit) => {
    return computeStreak(logs, habit, selectedDate);
  };

  return {
    habits,
    filteredHabits,
    logs,
    selectedDate,
    filter,
    loading,
    error,
    addHabit,
    updateHabit,
    archiveHabit,
    unarchiveHabit,
    deleteHabit,
    toggleHabitDay,
    setSelectedDate,
    setFilter,
    loadData,
    isCompletedOn,
    getStreak,
    isScheduled: (habit: Habit, date: string) => isScheduled(habit, date),
  };
}
