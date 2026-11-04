import { beforeEach, describe, expect, it } from 'vitest';
import type {
  Habit,
  HabitLog,
  IHabitLogRepository,
  IHabitRepository,
} from '../models/habit';
import { initHabitStore, useHabitStore } from './useHabits';

class MockHabitRepository implements IHabitRepository {
  public items: Habit[] = [];
  async getAll() {
    return [...this.items];
  }
  async getById(id: string) {
    return this.items.find((h) => h.id === id) ?? null;
  }
  async save(habit: Habit) {
    const idx = this.items.findIndex((h) => h.id === habit.id);
    if (idx >= 0) this.items[idx] = habit;
    else this.items.push(habit);
  }
  async saveMany(habits: Habit[]) {
    for (const h of habits) await this.save(h);
  }
  async delete(id: string) {
    this.items = this.items.filter((h) => h.id !== id);
  }
  async clear() {
    this.items = [];
  }
}

class MockHabitLogRepository implements IHabitLogRepository {
  public items: HabitLog[] = [];
  async getAll() {
    return [...this.items];
  }
  async getByHabitId(habitId: string) {
    return this.items.filter((l) => l.habitId === habitId);
  }
  async get(habitId: string, date: string) {
    return (
      this.items.find((l) => l.habitId === habitId && l.date === date) ?? null
    );
  }
  async save(log: HabitLog) {
    const idx = this.items.findIndex(
      (l) => l.habitId === log.habitId && l.date === log.date
    );
    if (idx >= 0) this.items[idx] = log;
    else this.items.push(log);
  }
  async delete(habitId: string, date: string) {
    this.items = this.items.filter(
      (l) => !(l.habitId === habitId && l.date === date)
    );
  }
  async clear() {
    this.items = [];
  }
}

describe('useHabitStore', () => {
  let habitRepo: MockHabitRepository;
  let logRepo: MockHabitLogRepository;

  beforeEach(async () => {
    habitRepo = new MockHabitRepository();
    logRepo = new MockHabitLogRepository();
    useHabitStore.setState({ habits: [], logs: [], filter: 'active' });
    await initHabitStore(habitRepo, logRepo);
  });

  it('adds habit and persists to repository', async () => {
    const { addHabit } = useHabitStore.getState();
    const habit = await addHabit({
      name: 'Exercise 30 mins',
      frequency: { type: 'daily' },
      colorKey: 'emerald',
    });

    expect(habit.name).toBe('Exercise 30 mins');
    expect(useHabitStore.getState().habits).toHaveLength(1);
    expect(await habitRepo.getAll()).toHaveLength(1);
  });

  it('toggles habit completion for a date', async () => {
    const { addHabit, toggleHabitDay } = useHabitStore.getState();
    const habit = await addHabit({
      name: 'Read',
      frequency: { type: 'daily' },
    });

    // Toggle ON
    const completed = await toggleHabitDay(habit.id, '2026-11-04');
    expect(completed).toBe(true);
    expect(useHabitStore.getState().logs).toHaveLength(1);
    expect(await logRepo.getAll()).toHaveLength(1);

    // Toggle OFF
    const toggledOff = await toggleHabitDay(habit.id, '2026-11-04');
    expect(toggledOff).toBe(false);
    expect(useHabitStore.getState().logs).toHaveLength(0);
    expect(await logRepo.getAll()).toHaveLength(0);
  });

  it('archives habit with undo capability', async () => {
    const { addHabit, archiveHabit } = useHabitStore.getState();
    const habit = await addHabit({
      name: 'Drink tea',
      frequency: { type: 'daily' },
    });

    const { undo } = await archiveHabit(habit.id);
    expect(useHabitStore.getState().habits[0].archivedAt).toBeDefined();

    await undo();
    expect(useHabitStore.getState().habits[0].archivedAt).toBeUndefined();
  });
});
