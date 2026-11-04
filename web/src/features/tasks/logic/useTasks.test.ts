import { beforeEach, describe, expect, it } from 'vitest';
import type { ITaskRepository, Task } from '../models/task';
import { createTaskEntity } from '../models/task';
import { initTaskStore, useTaskStore } from './useTasks';

class MockTaskRepository implements ITaskRepository {
  tasks: Task[] = [];
  shouldFailSave = false;
  shouldFailDelete = false;

  async getAll(): Promise<Task[]> {
    return [...this.tasks];
  }

  async getById(id: string): Promise<Task | null> {
    return this.tasks.find((t) => t.id === id) ?? null;
  }

  async save(task: Task): Promise<void> {
    if (this.shouldFailSave) {
      throw new Error('Database write failure');
    }
    const idx = this.tasks.findIndex((t) => t.id === task.id);
    if (idx >= 0) {
      this.tasks[idx] = task;
    } else {
      this.tasks.push(task);
    }
  }

  async saveMany(tasks: Task[]): Promise<void> {
    for (const t of tasks) {
      await this.save(t);
    }
  }

  async delete(id: string): Promise<void> {
    if (this.shouldFailDelete) {
      throw new Error('Database delete failure');
    }
    this.tasks = this.tasks.filter((t) => t.id !== id);
  }

  async clear(): Promise<void> {
    this.tasks = [];
  }
}

describe('useTasks Store (Optimistic Updates & Rollback)', () => {
  let mockRepo: MockTaskRepository;

  beforeEach(async () => {
    mockRepo = new MockTaskRepository();
    // Reset store state
    useTaskStore.setState({
      tasks: [],
      filter: 'all',
      quadrant: 'all',
      sortBy: 'order',
      loading: false,
      error: null,
    });
    await initTaskStore(mockRepo);
  });

  it('hydrates store from repository on load', async () => {
    const existing = createTaskEntity({ title: 'Preloaded Task' });
    mockRepo.tasks = [existing];

    await useTaskStore.getState().loadTasks();
    expect(useTaskStore.getState().tasks).toEqual([existing]);
  });

  it('optimistically adds task and commits to repository', async () => {
    const task = await useTaskStore.getState().addTask({ title: 'New Task' });

    expect(useTaskStore.getState().tasks).toHaveLength(1);
    expect(useTaskStore.getState().tasks[0].id).toBe(task.id);
    expect(mockRepo.tasks).toHaveLength(1);
  });

  it('rolls back added task if repository save fails', async () => {
    mockRepo.shouldFailSave = true;

    await expect(
      useTaskStore.getState().addTask({ title: 'Will Fail' })
    ).rejects.toThrow('Database write failure');

    expect(useTaskStore.getState().tasks).toHaveLength(0);
    expect(useTaskStore.getState().error).toBe('Failed to save task');
  });

  it('optimistically toggles task status and rolls back on failure', async () => {
    mockRepo.shouldFailSave = false;
    const task = await useTaskStore
      .getState()
      .addTask({ title: 'Toggle test' });

    // Success toggle
    await useTaskStore.getState().toggleTask(task.id);
    expect(useTaskStore.getState().tasks[0].status).toBe('done');

    // Fail toggle -> rolls back to 'done'
    mockRepo.shouldFailSave = true;
    await expect(useTaskStore.getState().toggleTask(task.id)).rejects.toThrow(
      'Database write failure'
    );

    expect(useTaskStore.getState().tasks[0].status).toBe('done');
    expect(useTaskStore.getState().error).toBe('Failed to toggle task');
  });

  it('optimistically deletes task, supports undo, and rolls back on failure', async () => {
    mockRepo.shouldFailSave = false;
    mockRepo.shouldFailDelete = false;
    const task = await useTaskStore.getState().addTask({ title: 'To Delete' });

    // Delete
    const { undo } = await useTaskStore.getState().deleteTask(task.id);
    expect(useTaskStore.getState().tasks).toHaveLength(0);
    expect(mockRepo.tasks).toHaveLength(0);

    // Undo restore
    await undo();
    expect(useTaskStore.getState().tasks).toHaveLength(1);
    expect(useTaskStore.getState().tasks[0].id).toBe(task.id);
    expect(mockRepo.tasks).toHaveLength(1);

    // Fail delete rollback
    mockRepo.shouldFailDelete = true;
    await expect(useTaskStore.getState().deleteTask(task.id)).rejects.toThrow(
      'Database delete failure'
    );

    expect(useTaskStore.getState().tasks).toHaveLength(1);
    expect(useTaskStore.getState().error).toBe('Failed to delete task');
  });
});
