import { beforeEach, describe, expect, it } from 'vitest';
import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from '@testing-library/react';
import { ToastProvider } from '@shared/ui/Toast';
import type { ITaskRepository, Task } from '../models/task';
import { initTaskStore, useTaskStore } from '../logic/useTasks';
import { TasksPage } from './TasksPage';

/**
 * In-memory repository conforming to ITaskRepository for isolated UI testing.
 * Strictly adheres to architectural boundaries: feature-ui does NOT import feature-data.
 */
class InMemoryTaskRepository implements ITaskRepository {
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

describe('Tasks UI Integration', () => {
  let repo: InMemoryTaskRepository;

  beforeEach(async () => {
    repo = new InMemoryTaskRepository();
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

  it('add task -> toggle complete -> reload -> data still persists', async () => {
    // 1. Initial render
    const { unmount } = render(
      <ToastProvider>
        <TasksPage />
      </ToastProvider>
    );

    // Verify empty state is initially rendered
    expect(screen.getByText(/No tasks yet/i)).toBeInTheDocument();

    // 2. Add a new task using the quick add input
    const quickInput = screen.getByLabelText(/Quick add task/i);
    fireEvent.change(quickInput, { target: { value: 'Buy Groceries' } });
    fireEvent.keyDown(quickInput, { key: 'Enter', code: 'Enter' });

    // Verify task is added to the DOM
    await waitFor(() => {
      expect(screen.getByText('Buy Groceries')).toBeInTheDocument();
    });

    // 3. Mark task as completed (click the checkbox)
    const checkbox = screen.getByLabelText(/Mark "Buy Groceries" as complete/i);
    expect(checkbox).not.toBeChecked();

    fireEvent.click(checkbox);

    // Verify checkbox is now checked
    await waitFor(() => {
      expect(
        screen.getByLabelText(/Mark "Buy Groceries" as incomplete/i)
      ).toBeChecked();
    });

    // Verify task title has completed styling
    const taskTitle = screen.getByText('Buy Groceries');
    expect(taskTitle.className).toMatch(/titleDone/);

    // 4. Simulate reload (unmount component, reload store from repository, re-render)
    unmount();

    // Re-hydrate store from the persistent repository
    await initTaskStore(repo);

    render(
      <ToastProvider>
        <TasksPage />
      </ToastProvider>
    );

    // 5. Verify task persisted across the reload in completed state
    await waitFor(() => {
      expect(screen.getByText('Buy Groceries')).toBeInTheDocument();
    });

    const persistedCheckbox = screen.getByLabelText(
      /Mark "Buy Groceries" as incomplete/i
    );
    expect(persistedCheckbox).toBeChecked();
  });

  it('adds task via TaskForm dialog with quadrant toggles', async () => {
    render(
      <ToastProvider>
        <TasksPage />
      </ToastProvider>
    );

    // Click "+ New Task" to open dialog
    fireEvent.click(screen.getByRole('button', { name: /\+ New Task/i }));

    expect(screen.getByRole('dialog')).toBeInTheDocument();

    // Fill form
    const titleInput = screen.getByLabelText(/^Title$/i);
    fireEvent.change(titleInput, {
      target: { value: 'Urgent Strategy Meeting' },
    });

    // Toggle Urgent and Important
    const urgentBox = screen.getByLabelText(/^Urgent$/i);
    const importantBox = screen.getByLabelText(/^Important$/i);
    fireEvent.click(urgentBox);
    fireEvent.click(importantBox);

    // Verify live quadrant preview displays 'Quadrant: DO'
    expect(screen.getByText(/Quadrant: DO/i)).toBeInTheDocument();

    // Submit dialog form
    const dialog = screen.getByRole('dialog');
    fireEvent.click(
      within(dialog).getByRole('button', { name: /Create Task/i })
    );

    // Verify task created in list with 'DO' badge
    await waitFor(() => {
      expect(screen.getByText('Urgent Strategy Meeting')).toBeInTheDocument();
      const taskCard = screen.getByTestId(/^task-item-/);
      expect(within(taskCard).getByText('DO')).toBeInTheDocument();
    });
  });

  it('filters tasks by all, active, and done', async () => {
    render(
      <ToastProvider>
        <TasksPage />
      </ToastProvider>
    );

    // Quick add 2 tasks
    const quickInput = screen.getByLabelText(/Quick add task/i);
    fireEvent.change(quickInput, { target: { value: 'Active Task 1' } });
    fireEvent.keyDown(quickInput, { key: 'Enter', code: 'Enter' });

    fireEvent.change(quickInput, { target: { value: 'Completed Task 2' } });
    fireEvent.keyDown(quickInput, { key: 'Enter', code: 'Enter' });

    await waitFor(() => {
      expect(screen.getByText('Active Task 1')).toBeInTheDocument();
      expect(screen.getByText('Completed Task 2')).toBeInTheDocument();
    });

    // Mark second task as completed
    const cb2 = screen.getByLabelText(/Mark "Completed Task 2" as complete/i);
    fireEvent.click(cb2);

    // Switch to "Active" filter tab
    fireEvent.click(screen.getByRole('tab', { name: /Active/i }));
    expect(screen.getByText('Active Task 1')).toBeInTheDocument();
    expect(screen.queryByText('Completed Task 2')).not.toBeInTheDocument();

    // Switch to "Done" filter tab
    fireEvent.click(screen.getByRole('tab', { name: /Done/i }));
    expect(screen.queryByText('Active Task 1')).not.toBeInTheDocument();
    expect(screen.getByText('Completed Task 2')).toBeInTheDocument();
  });
});
