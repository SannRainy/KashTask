import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ToastProvider } from '@shared/ui/Toast';
import {
  initTaskStore,
  useTaskStore,
  type ITaskRepository,
  type Task,
} from '@features/tasks';
import { MatrixPage } from './MatrixPage';

class MockTaskRepository implements ITaskRepository {
  private tasks = new Map<string, Task>();

  async getAll(): Promise<Task[]> {
    return Array.from(this.tasks.values());
  }

  async getById(id: string): Promise<Task | null> {
    return this.tasks.get(id) ?? null;
  }

  async save(task: Task): Promise<void> {
    this.tasks.set(task.id, { ...task });
  }

  async saveMany(tasks: Task[]): Promise<void> {
    for (const t of tasks) {
      await this.save(t);
    }
  }

  async delete(id: string): Promise<void> {
    this.tasks.delete(id);
  }

  async clear(): Promise<void> {
    this.tasks.clear();
  }
}

describe('Matrix UI Integration', () => {
  let repo: MockTaskRepository;

  beforeEach(async () => {
    repo = new MockTaskRepository();
    useTaskStore.setState({
      tasks: [],
      filter: 'all',
      quadrant: 'all',
      sortBy: 'order',
      loading: false,
      error: null,
    });
    await initTaskStore(repo);
  });

  it('renders 2x2 matrix board with all 4 quadrants and their headers', () => {
    render(
      <ToastProvider>
        <MatrixPage />
      </ToastProvider>
    );

    // Verify 4 quadrant columns exist
    expect(screen.getByTestId('quadrant-column-DO')).toBeInTheDocument();
    expect(screen.getByTestId('quadrant-column-SCHEDULE')).toBeInTheDocument();
    expect(screen.getByTestId('quadrant-column-DELEGATE')).toBeInTheDocument();
    expect(screen.getByTestId('quadrant-column-ELIMINATE')).toBeInTheDocument();

    // Verify quadrant names
    expect(
      screen.getByRole('heading', { name: 'Do First' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Schedule' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Delegate' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Eliminate' })
    ).toBeInTheDocument();
  });

  it('quick-adds tasks directly into specific quadrants with correct flags', async () => {
    render(
      <ToastProvider>
        <MatrixPage />
      </ToastProvider>
    );

    // 1. Quick-add to DO
    const doInput = screen.getByLabelText(/Quick add task to Do First/i);
    fireEvent.change(doInput, { target: { value: 'Fix Production Bug' } });
    fireEvent.keyDown(doInput, { key: 'Enter', code: 'Enter' });

    // 2. Quick-add to SCHEDULE
    const scheduleInput = screen.getByLabelText(/Quick add task to Schedule/i);
    fireEvent.change(scheduleInput, { target: { value: 'Exercise Workout' } });
    fireEvent.keyDown(scheduleInput, { key: 'Enter', code: 'Enter' });

    await waitFor(() => {
      expect(screen.getByText('Fix Production Bug')).toBeInTheDocument();
      expect(screen.getByText('Exercise Workout')).toBeInTheDocument();
    });

    const tasksInStore = useTaskStore.getState().tasks;
    const doTask = tasksInStore.find((t) => t.title === 'Fix Production Bug')!;
    const scheduleTask = tasksInStore.find(
      (t) => t.title === 'Exercise Workout'
    )!;

    // DO: urgent=true, important=true
    expect(doTask.urgent).toBe(true);
    expect(doTask.important).toBe(true);

    // SCHEDULE: urgent=false, important=true
    expect(scheduleTask.urgent).toBe(false);
    expect(scheduleTask.important).toBe(true);
  });

  it('provides accessible drag handles with keyboard sortable attributes', async () => {
    // Preload a task into DO
    await useTaskStore.getState().addTask({
      title: 'Accessible Task',
      urgent: true,
      important: true,
    });

    render(
      <ToastProvider>
        <MatrixPage />
      </ToastProvider>
    );

    const dragHandle = screen.getByLabelText(/Drag task "Accessible Task"/i);
    expect(dragHandle).toBeInTheDocument();
    expect(dragHandle).toHaveAttribute('aria-roledescription', 'sortable');
  });

  it('allows mobile tab switching across quadrants', () => {
    render(
      <ToastProvider>
        <MatrixPage />
      </ToastProvider>
    );

    const mobileScheduleTab = screen.getByRole('tab', { name: /SCHEDULE/i });
    fireEvent.click(mobileScheduleTab);

    expect(mobileScheduleTab).toHaveAttribute('aria-selected', 'true');
    const grid = screen.getByRole('region', {
      name: /Eisenhower 2x2 Matrix Board/i,
    });
    expect(grid).toHaveAttribute('data-active-mobile', 'SCHEDULE');
  });

  it('toggles task completion status inside the matrix board', async () => {
    await useTaskStore.getState().addTask({
      title: 'Task to Complete',
      urgent: true,
      important: true,
    });

    render(
      <ToastProvider>
        <MatrixPage />
      </ToastProvider>
    );

    const checkbox = screen.getByLabelText(
      /Mark "Task to Complete" as complete/i
    );
    expect(checkbox).not.toBeChecked();

    fireEvent.click(checkbox);

    await waitFor(() => {
      expect(
        screen.getByLabelText(/Mark "Task to Complete" as incomplete/i)
      ).toBeChecked();
    });

    const taskInStore = useTaskStore.getState().tasks[0];
    expect(taskInStore.status).toBe('done');
    expect(taskInStore.completedAt).toBeDefined();
  });
});
