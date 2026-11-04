import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { StorageAdapter, StorageManager, KeyExtractor } from './types';
import { MemoryStorageManager } from './adapters/memoryAdapter';
import { LocalStorageManager } from './adapters/localStorageAdapter';
import { IndexedDbStorageManager } from './adapters/indexedDbAdapter';

interface TestTask {
  id: string;
  title: string;
  urgent: boolean;
  important: boolean;
  status: 'todo' | 'done';
}

interface TestHabitLog {
  habitId: string;
  date: string;
  completed: boolean;
}

/**
 * Universal Contract Test Suite executed identically against every StorageAdapter implementation.
 */
function runStorageAdapterContract(
  name: string,
  createManager: () => Promise<StorageManager> | StorageManager
) {
  describe(`StorageAdapter Contract: ${name}`, () => {
    let manager: StorageManager;
    let taskAdapter: StorageAdapter<TestTask>;
    let habitLogAdapter: StorageAdapter<TestHabitLog>;

    const habitLogKeyExtractor: KeyExtractor<TestHabitLog> = (log) =>
      `${log.habitId}:${log.date}`;

    beforeEach(async () => {
      manager = await createManager();
      await manager.clearAll();
      taskAdapter = manager.getCollection<TestTask>('tasks');
      habitLogAdapter = manager.getCollection<TestHabitLog>(
        'habitLogs',
        habitLogKeyExtractor
      );
    });

    afterEach(async () => {
      await manager.clearAll();
      await manager.close();
    });

    it('returns null when querying an item that does not exist', async () => {
      const result = await taskAdapter.get('non_existent_id');
      expect(result).toBeNull();
    });

    it('puts and gets a single entity by id', async () => {
      const task: TestTask = {
        id: 'task_1',
        title: 'Review PR',
        urgent: true,
        important: true,
        status: 'todo',
      };

      await taskAdapter.put(task);
      const fetched = await taskAdapter.get('task_1');

      expect(fetched).toEqual(task);
    });

    it('overwrites an existing entity when putting with identical key', async () => {
      const initial: TestTask = {
        id: 'task_1',
        title: 'Initial Title',
        urgent: false,
        important: false,
        status: 'todo',
      };

      await taskAdapter.put(initial);

      const updated: TestTask = {
        id: 'task_1',
        title: 'Updated Title',
        urgent: true,
        important: false,
        status: 'done',
      };

      await taskAdapter.put(updated);
      const fetched = await taskAdapter.get('task_1');

      expect(fetched).toEqual(updated);
    });

    it('puts multiple entities with putMany and gets all via getAll', async () => {
      const tasks: TestTask[] = [
        {
          id: 'task_1',
          title: 'Task One',
          urgent: true,
          important: false,
          status: 'todo',
        },
        {
          id: 'task_2',
          title: 'Task Two',
          urgent: false,
          important: true,
          status: 'todo',
        },
        {
          id: 'task_3',
          title: 'Task Three',
          urgent: false,
          important: false,
          status: 'done',
        },
      ];

      await taskAdapter.putMany(tasks);
      const all = await taskAdapter.getAll();

      expect(all).toHaveLength(3);
      expect(all.map((t) => t.id).sort()).toEqual(
        ['task_1', 'task_2', 'task_3'].sort()
      );
    });

    it('deletes an entity by id', async () => {
      const task: TestTask = {
        id: 'task_del',
        title: 'To Be Deleted',
        urgent: false,
        important: false,
        status: 'todo',
      };

      await taskAdapter.put(task);
      expect(await taskAdapter.get('task_del')).not.toBeNull();

      await taskAdapter.delete('task_del');
      expect(await taskAdapter.get('task_del')).toBeNull();
    });

    it('clears all items in a single collection without affecting other collections', async () => {
      const task: TestTask = {
        id: 'task_1',
        title: 'Task in tasks collection',
        urgent: false,
        important: false,
        status: 'todo',
      };
      await taskAdapter.put(task);

      const log: TestHabitLog = {
        habitId: 'habit_1',
        date: '2026-11-04',
        completed: true,
      };
      await habitLogAdapter.put(log);

      // Clear tasks collection
      await taskAdapter.clear();

      expect(await taskAdapter.getAll()).toHaveLength(0);
      // habitLogs must remain untouched
      expect(await habitLogAdapter.getAll()).toHaveLength(1);
    });

    it('supports composite keys like habitLogs (habitId:date)', async () => {
      const log1: TestHabitLog = {
        habitId: 'h1',
        date: '2026-11-01',
        completed: true,
      };
      const log2: TestHabitLog = {
        habitId: 'h1',
        date: '2026-11-02',
        completed: true,
      };
      const log3: TestHabitLog = {
        habitId: 'h2',
        date: '2026-11-01',
        completed: false,
      };

      await habitLogAdapter.putMany([log1, log2, log3]);

      const fetchedLog = await habitLogAdapter.get('h1:2026-11-02');
      expect(fetchedLog).toEqual(log2);

      const all = await habitLogAdapter.getAll();
      expect(all).toHaveLength(3);

      await habitLogAdapter.delete('h1:2026-11-01');
      expect(await habitLogAdapter.get('h1:2026-11-01')).toBeNull();
      expect(await habitLogAdapter.getAll()).toHaveLength(2);
    });

    it('manages schema version across instances', async () => {
      expect(await manager.getSchemaVersion()).toBe(0);
      await manager.setSchemaVersion(3);
      expect(await manager.getSchemaVersion()).toBe(3);
    });
  });
}

// 1. Run contract on MemoryAdapter
runStorageAdapterContract('MemoryAdapter', () => new MemoryStorageManager());

// 2. Run contract on LocalStorageAdapter
runStorageAdapterContract(
  'LocalStorageAdapter',
  () => new LocalStorageManager({ prefix: 'kashtask_test_contract' })
);

// 3. Run contract on IndexedDbAdapter (via fake-indexeddb)
let dbCounter = 0;
runStorageAdapterContract(
  'IndexedDbAdapter',
  () =>
    new IndexedDbStorageManager({ dbName: `test_contract_db_${++dbCounter}` })
);
