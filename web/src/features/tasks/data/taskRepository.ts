import type { StorageAdapter, StorageManager } from '@core/storage';
import type { ITaskRepository, Task } from '../models/task';

/**
 * TaskRepository data layer implementation.
 * Only this layer directly accesses the core storage engine.
 */
export class TaskRepository implements ITaskRepository {
  private readonly collection: StorageAdapter<Task>;

  constructor(storageManager: StorageManager) {
    this.collection = storageManager.getCollection<Task>('tasks');
  }

  async getAll(): Promise<Task[]> {
    return this.collection.getAll();
  }

  async getById(id: string): Promise<Task | null> {
    return this.collection.get(id);
  }

  async save(task: Task): Promise<void> {
    return this.collection.put(task);
  }

  async saveMany(tasks: Task[]): Promise<void> {
    return this.collection.putMany(tasks);
  }

  async delete(id: string): Promise<void> {
    return this.collection.delete(id);
  }

  async clear(): Promise<void> {
    return this.collection.clear();
  }
}

