import { beforeEach, describe, expect, it } from 'vitest';
import { MemoryStorageManager } from '@core/storage/adapters/memoryAdapter';
import { createHabitEntity } from '../models/habit';
import { HabitRepository } from './habitRepository';
import { HabitLogRepository } from './habitLogRepository';

describe('HabitRepository & HabitLogRepository (with MemoryAdapter)', () => {
  let storageManager: MemoryStorageManager;
  let habitRepo: HabitRepository;
  let logRepo: HabitLogRepository;

  beforeEach(() => {
    storageManager = new MemoryStorageManager();
    habitRepo = new HabitRepository(storageManager);
    logRepo = new HabitLogRepository(storageManager);
  });

  it('saves, retrieves and deletes habits', async () => {
    expect(await habitRepo.getAll()).toEqual([]);

    const habit = createHabitEntity({
      name: 'Read 20 mins',
      frequency: { type: 'daily' },
      colorKey: 'indigo',
    });

    await habitRepo.save(habit);

    const all = await habitRepo.getAll();
    expect(all).toHaveLength(1);
    expect(await habitRepo.getById(habit.id)).toEqual(habit);

    await habitRepo.delete(habit.id);
    expect(await habitRepo.getById(habit.id)).toBeNull();
  });

  it('saves, retrieves and deletes habit logs with composite key', async () => {
    const habitId = '01HARC5B0Q8A4T5V9B11C2D3E4';
    const log1 = { habitId, date: '2026-11-04' };
    const log2 = { habitId, date: '2026-11-05' };

    await logRepo.save(log1);
    await logRepo.save(log2);

    const logs = await logRepo.getByHabitId(habitId);
    expect(logs).toHaveLength(2);

    expect(await logRepo.get(habitId, '2026-11-04')).toEqual(log1);
    expect(await logRepo.get(habitId, '2026-11-06')).toBeNull();

    await logRepo.delete(habitId, '2026-11-04');
    expect(await logRepo.get(habitId, '2026-11-04')).toBeNull();
    expect(await logRepo.getByHabitId(habitId)).toHaveLength(1);
  });
});
