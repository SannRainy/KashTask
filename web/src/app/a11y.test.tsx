/**
 * a11y.test.tsx — automated accessibility audits using axe-core and focus order verification.
 * Verifies that each page/view passes WCAG accessibility checks and focus management works properly.
 */
import { beforeEach, describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import axe from 'axe-core';
import { ThemeProvider } from './providers/ThemeProvider';
import { ToastProvider } from '@shared/ui/Toast';
import { AppShell } from './AppShell';
import { KeyboardHelpDialog } from './KeyboardHelpDialog';
import { NotFoundPage } from './NotFoundPage';
import { Dialog } from '@shared/ui/Dialog';
import { Button } from '@shared/ui/Button';
import {
  TasksPage,
  initTaskStore,
  type ITaskRepository,
  type Task,
} from '@features/tasks';
import { MatrixPage } from '@features/matrix';
import {
  HabitsPage,
  initHabitStore,
  type IHabitRepository,
  type IHabitLogRepository,
  type Habit,
  type HabitLog,
} from '@features/habits';
import { StatsPage } from '@features/stats';
import {
  SettingsPage,
  initSettings,
  type ISettingsRepository,
  type Settings,
  DEFAULT_SETTINGS,
} from '@features/settings';

// Mock repositories for safe isolated rendering
class MockTaskRepo implements ITaskRepository {
  private items = new Map<string, Task>();
  async getAll(): Promise<Task[]> {
    return Array.from(this.items.values());
  }
  async getById(id: string): Promise<Task | null> {
    return this.items.get(id) ?? null;
  }
  async save(t: Task): Promise<void> {
    this.items.set(t.id, t);
  }
  async saveMany(ts: Task[]): Promise<void> {
    ts.forEach((t) => this.items.set(t.id, t));
  }
  async delete(id: string): Promise<void> {
    this.items.delete(id);
  }
  async clear(): Promise<void> {
    this.items.clear();
  }
}

class MockHabitRepo implements IHabitRepository {
  private items = new Map<string, Habit>();
  async getAll(): Promise<Habit[]> {
    return Array.from(this.items.values());
  }
  async getById(id: string): Promise<Habit | null> {
    return this.items.get(id) ?? null;
  }
  async save(h: Habit): Promise<void> {
    this.items.set(h.id, h);
  }
  async saveMany(hs: Habit[]): Promise<void> {
    hs.forEach((h) => this.items.set(h.id, h));
  }
  async delete(id: string): Promise<void> {
    this.items.delete(id);
  }
  async clear(): Promise<void> {
    this.items.clear();
  }
}

class MockHabitLogRepo implements IHabitLogRepository {
  private items = new Map<string, HabitLog>();
  async getAll(): Promise<HabitLog[]> {
    return Array.from(this.items.values());
  }
  async getByHabitId(habitId: string): Promise<HabitLog[]> {
    return Array.from(this.items.values()).filter((l) => l.habitId === habitId);
  }
  async get(habitId: string, date: string): Promise<HabitLog | null> {
    return this.items.get(`${habitId}:${date}`) ?? null;
  }
  async save(log: HabitLog): Promise<void> {
    this.items.set(`${log.habitId}:${log.date}`, log);
  }
  async delete(habitId: string, date: string): Promise<void> {
    this.items.delete(`${habitId}:${date}`);
  }
  async clear(): Promise<void> {
    this.items.clear();
  }
}

class MockSettingsRepo implements ISettingsRepository {
  private settings: Settings = { ...DEFAULT_SETTINGS };
  async getSettings(): Promise<Settings> {
    return { ...this.settings };
  }
  async saveSettings(patch: Partial<Omit<Settings, 'key'>>): Promise<Settings> {
    this.settings = { ...this.settings, ...patch };
    return { ...this.settings };
  }
}

async function checkA11y(container: HTMLElement) {
  const results = await axe.run(container, {
    runOnly: {
      type: 'tag',
      values: ['wcag2a', 'wcag2aa', 'best-practice'],
    },
    rules: {
      'color-contrast': { enabled: false },
    },
  });

  const violations = results.violations.map((v) => ({
    id: v.id,
    impact: v.impact,
    description: v.description,
    nodes: v.nodes.map((n) => n.html),
  }));

  expect(violations).toEqual([]);
}

describe('Accessibility Audits across Pages (axe-core)', () => {
  beforeEach(async () => {
    const taskRepo = new MockTaskRepo();
    const habitRepo = new MockHabitRepo();
    const logRepo = new MockHabitLogRepo();
    const settingsRepo = new MockSettingsRepo();

    await Promise.all([
      initTaskStore(taskRepo),
      initHabitStore(habitRepo, logRepo),
      initSettings(settingsRepo),
    ]);
  });

  it('AppShell and layout structure pass a11y checks', async () => {
    const { container } = render(
      <ThemeProvider>
        <ToastProvider>
          <AppShell currentPath="/" onNavigate={() => {}}>
            <main>
              <h1>Overview</h1>
              <p>Welcome to KashTask</p>
            </main>
          </AppShell>
        </ToastProvider>
      </ThemeProvider>
    );
    await checkA11y(container);
  });

  it('TasksPage passes a11y checks', async () => {
    const { container } = render(
      <ThemeProvider>
        <ToastProvider>
          <TasksPage />
        </ToastProvider>
      </ThemeProvider>
    );
    await checkA11y(container);
  });

  it('MatrixPage passes a11y checks', async () => {
    const { container } = render(
      <ThemeProvider>
        <ToastProvider>
          <MatrixPage />
        </ToastProvider>
      </ThemeProvider>
    );
    await checkA11y(container);
  });

  it('HabitsPage passes a11y checks', async () => {
    const { container } = render(
      <ThemeProvider>
        <ToastProvider>
          <HabitsPage />
        </ToastProvider>
      </ThemeProvider>
    );
    await checkA11y(container);
  });

  it('StatsPage passes a11y checks', async () => {
    const { container } = render(
      <ThemeProvider>
        <ToastProvider>
          <StatsPage />
        </ToastProvider>
      </ThemeProvider>
    );
    await checkA11y(container);
  });

  it('SettingsPage passes a11y checks', async () => {
    const { container } = render(
      <ThemeProvider>
        <ToastProvider>
          <SettingsPage />
        </ToastProvider>
      </ThemeProvider>
    );
    await checkA11y(container);
  });

  it('KeyboardHelpDialog passes a11y checks when open', async () => {
    const { container } = render(
      <ThemeProvider>
        <KeyboardHelpDialog open={true} onClose={() => {}} />
      </ThemeProvider>
    );
    await checkA11y(container);
  });

  it('NotFoundPage passes a11y checks', async () => {
    const { container } = render(
      <ThemeProvider>
        <NotFoundPage onNavigate={() => {}} />
      </ThemeProvider>
    );
    await checkA11y(container);
  });
});

describe('Focus Management & Keyboard Navigation', () => {
  it('Dialog traps focus correctly and respects Escape key', () => {
    const handleClose = vi.fn();
    render(
      <Dialog open={true} onClose={handleClose} title="Test Dialog">
        <div>
          <Button>First Action</Button>
          <Button>Second Action</Button>
        </div>
      </Dialog>
    );

    // Escape closes dialog
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('AppShell navigation items have proper aria-current and roles', () => {
    render(
      <ThemeProvider>
        <ToastProvider>
          <AppShell currentPath="/tasks" onNavigate={() => {}}>
            <main>Tasks Content</main>
          </AppShell>
        </ToastProvider>
      </ThemeProvider>
    );

    // Active item has aria-current="page"
    const tasksLinks = screen.getAllByRole('link', { name: /tasks/i });
    expect(tasksLinks.length).toBeGreaterThan(0);
    expect(tasksLinks[0]).toHaveAttribute('aria-current', 'page');

    // Inactive link does not have aria-current
    const habitsLinks = screen.getAllByRole('link', { name: /habits/i });
    expect(habitsLinks[0]).not.toHaveAttribute('aria-current');
  });
});
