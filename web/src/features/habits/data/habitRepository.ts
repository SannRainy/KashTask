import type { StorageAdapter, StorageManager } from '@core/storage';
import type { IHabitRepository, Habit } from '../models/habit';

/**
 * HabitRepository data layer implementation.
 * Encapsulates offline storage access for habits.
 */
export class HabitRepository implements IHabitRepository {
  private readonly collection: StorageAdapter<Habit>;

  constructor(storageManager: StorageManager) {
    this.collection = storageManager.getCollection<Habit>('habits');
  }

  async getAll(): Promise<Habit[]> {
    return this.collection.getAll();
  }

  async getById(id: string): Promise<Habit | null> {
    return this.collection.get(id);
  }

  async save(habit: Habit): Promise<void> {
    return this.collection.put(habit);
  }

  async saveMany(habits: Habit[]): Promise<void> {
    return this.collection.putMany(habits);
  }

  async delete(id: string): Promise<void> {
    return this.collection.delete(id);
  }

  async clear(): Promise<void> {
    return this.collection.clear();
  }
}
