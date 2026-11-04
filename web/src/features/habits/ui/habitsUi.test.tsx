import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ToastProvider } from '@shared/ui/Toast';
import type {
  Habit,
  HabitLog,
  IHabitLogRepository,
  IHabitRepository,
} from '../models/habit';
import { initHabitStore, useHabitStore } from '../logic/useHabits';
import { HabitsPage } from './HabitsPage';

class InMemoryHabitRepository implements IHabitRepository {
  private items = new Map<string, Habit>();

  async getAll(): Promise<Habit[]> {
    return Array.from(this.items.values());
  }
  async getById(id: string): Promise<Habit | null> {
    return this.items.get(id) ?? null;
  }
  async save(habit: Habit): Promise<void> {
    this.items.set(habit.id, { ...habit });
  }
  async saveMany(habits: Habit[]): Promise<void> {
    for (const h of habits) await this.save(h);
  }
  async delete(id: string): Promise<void> {
    this.items.delete(id);
  }
  async clear(): Promise<void> {
    this.items.clear();
  }
}

class InMemoryHabitLogRepository implements IHabitLogRepository {
  private logs = new Map<string, HabitLog>();

  async getAll(): Promise<HabitLog[]> {
    return Array.from(this.logs.values());
  }
  async getByHabitId(habitId: string): Promise<HabitLog[]> {
    return Array.from(this.logs.values()).filter((l) => l.habitId === habitId);
  }
  async get(habitId: string, date: string): Promise<HabitLog | null> {
    return this.logs.get(`${habitId}:${date}`) ?? null;
  }
  async save(log: HabitLog): Promise<void> {
    this.logs.set(`${log.habitId}:${log.date}`, { ...log });
  }
  async delete(habitId: string, date: string): Promise<void> {
    this.logs.delete(`${habitId}:${date}`);
  }
  async clear(): Promise<void> {
    this.logs.clear();
  }
}

describe('Habits UI Integration', () => {
  let habitRepo: InMemoryHabitRepository;
  let logRepo: InMemoryHabitLogRepository;

  beforeEach(async () => {
    habitRepo = new InMemoryHabitRepository();
    logRepo = new InMemoryHabitLogRepository();
    useHabitStore.setState({
      habits: [],
      logs: [],
      filter: 'active',
      loading: false,
      error: null,
    });
    await initHabitStore(habitRepo, logRepo);
  });

  it('adds a new habit, toggles completion, and updates streak badge', async () => {
    render(
      <ToastProvider>
        <HabitsPage />
      </ToastProvider>
    );

    // Initial empty state
    expect(screen.getByText('No habits found')).toBeDefined();

    // Click "+ New Habit"
    fireEvent.click(screen.getByText('+ New Habit'));

    // Fill form
    const nameInput = screen.getByLabelText(/Habit Name/i);
    fireEvent.change(nameInput, { target: { value: 'Drink 2L Water' } });

    // Submit form
    fireEvent.click(screen.getByText('Create Habit'));

    // Wait for habit item to appear
    await waitFor(() => {
      expect(screen.getByText('Drink 2L Water')).toBeDefined();
    });

    // Check initial streak badge (0)
    const streakBadge = screen.getByText(/🔥 0/);
    expect(streakBadge).toBeDefined();

    // Toggle completion for today
    const checkbox = screen.getByRole('checkbox', {
      name: /Toggle "Drink 2L Water"/i,
    });
    fireEvent.click(checkbox);

    // Streak badge updates to 1
    await waitFor(() => {
      expect(screen.getByText(/🔥 1/)).toBeDefined();
    });

    // Verify persisted in repo
    expect(await habitRepo.getAll()).toHaveLength(1);
    expect(await logRepo.getAll()).toHaveLength(1);
  });

  it('persists data after simulated reload', async () => {
    // 1. First render and add habit
    const { unmount } = render(
      <ToastProvider>
        <HabitsPage />
      </ToastProvider>
    );

    fireEvent.click(screen.getByText('+ New Habit'));
    fireEvent.change(screen.getByLabelText(/Habit Name/i), {
      target: { value: 'Read 20 pages' },
    });
    fireEvent.click(screen.getByText('Create Habit'));

    await waitFor(() => {
      expect(screen.getByText('Read 20 pages')).toBeDefined();
    });

    unmount();

    // 2. Simulate refresh by reinitializing store from repository
    useHabitStore.setState({ habits: [], logs: [] });
    await initHabitStore(habitRepo, logRepo);

    render(
      <ToastProvider>
        <HabitsPage />
      </ToastProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Read 20 pages')).toBeDefined();
    });
  });

  it('archives habit and supports undo from toast', async () => {
    render(
      <ToastProvider>
        <HabitsPage />
      </ToastProvider>
    );

    // Add habit
    fireEvent.click(screen.getByText('+ New Habit'));
    fireEvent.change(screen.getByLabelText(/Habit Name/i), {
      target: { value: 'Morning Run' },
    });
    fireEvent.click(screen.getByText('Create Habit'));

    await waitFor(() => {
      expect(screen.getByText('Morning Run')).toBeDefined();
    });

    // Click archive button
    const archiveBtn = screen.getByRole('button', {
      name: /Archive Morning Run/i,
    });
    fireEvent.click(archiveBtn);

    // Wait for toast with undo button
    await waitFor(() => {
      expect(screen.getByText(/archived/i)).toBeDefined();
    });

    // In Active tab, habit should be gone
    expect(screen.queryByText('Morning Run')).toBeNull();

    // Click Undo in toast
    const undoBtn = screen.getByRole('button', { name: /Undo/i });
    fireEvent.click(undoBtn);

    // Habit restored in Active tab
    await waitFor(() => {
      expect(screen.getByText('Morning Run')).toBeDefined();
    });
  });
});
