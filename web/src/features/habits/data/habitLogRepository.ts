import type { StorageAdapter, StorageManager } from '@core/storage';
import type { IHabitLogRepository, HabitLog } from '../models/habit';

/**
 * HabitLogRepository data layer implementation.
 * Encapsulates offline storage access for daily habit logs with composite key (habitId:date).
 */
export class HabitLogRepository implements IHabitLogRepository {
  private readonly collection: StorageAdapter<HabitLog>;

  constructor(storageManager: StorageManager) {
    this.collection = storageManager.getCollection<HabitLog>(
      'habitLogs',
      (log) => `${log.habitId}:${log.date}`
    );
  }

  async getAll(): Promise<HabitLog[]> {
    return this.collection.getAll();
  }

  async getByHabitId(habitId: string): Promise<HabitLog[]> {
    const all = await this.collection.getAll();
    return all.filter((log) => log.habitId === habitId);
  }

  async get(habitId: string, date: string): Promise<HabitLog | null> {
    return this.collection.get(`${habitId}:${date}`);
  }

  async save(log: HabitLog): Promise<void> {
    return this.collection.put(log);
  }

  async delete(habitId: string, date: string): Promise<void> {
    return this.collection.delete(`${habitId}:${date}`);
  }

  async clear(): Promise<void> {
    return this.collection.clear();
  }
}
