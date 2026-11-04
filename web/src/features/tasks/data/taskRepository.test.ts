import { beforeEach, describe, expect, it } from 'vitest';
import { MemoryStorageManager } from '@core/storage/adapters/memoryAdapter';
import { createTaskEntity } from '../models/task';
import { TaskRepository } from './taskRepository';

describe('TaskRepository (with MemoryAdapter)', () => {
  let storageManager: MemoryStorageManager;
  let repo: TaskRepository;

  beforeEach(() => {
    storageManager = new MemoryStorageManager();
    repo = new TaskRepository(storageManager);
  });

  it('saves and retrieves tasks', async () => {
    expect(await repo.getAll()).toEqual([]);

    const task1 = createTaskEntity({ title: 'Task 1' });
    const task2 = createTaskEntity({ title: 'Task 2', urgent: true });

    await repo.save(task1);
    await repo.save(task2);

    const all = await repo.getAll();
    expect(all).toHaveLength(2);
    expect(await repo.getById(task1.id)).toEqual(task1);
    expect(await repo.getById(task2.id)).toEqual(task2);
  });

  it('deletes tasks by id', async () => {
    const task = createTaskEntity({ title: 'Task to delete' });
    await repo.save(task);

    expect(await repo.getById(task.id)).not.toBeNull();
    await repo.delete(task.id);
    expect(await repo.getById(task.id)).toBeNull();
  });

  it('clears all tasks', async () => {
    await repo.saveMany([
      createTaskEntity({ title: 'Task A' }),
      createTaskEntity({ title: 'Task B' }),
    ]);

    expect(await repo.getAll()).toHaveLength(2);
    await repo.clear();
    expect(await repo.getAll()).toHaveLength(0);
  });
});

