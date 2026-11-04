import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createStorageManager } from './factory';
import { MemoryStorageManager } from './adapters/memoryAdapter';
import { LocalStorageManager } from './adapters/localStorageAdapter';
import { IndexedDbStorageManager } from './adapters/indexedDbAdapter';

describe('core/storage/factory', () => {
  let createdManagers: { close(): Promise<void> }[] = [];

  beforeEach(() => {
    createdManagers = [];
  });

  afterEach(async () => {
    for (const m of createdManagers) {
      await m.close();
    }
  });

  it('creates MemoryStorageManager when forceAdapter is "memory"', async () => {
    const { manager, engine } = await createStorageManager({
      forceAdapter: 'memory',
      autoMigrate: false,
    });
    createdManagers.push(manager);

    expect(engine).toBe('memory');
    expect(manager).toBeInstanceOf(MemoryStorageManager);
  });

  it('creates LocalStorageManager when forceAdapter is "localstorage"', async () => {
    const { manager, engine } = await createStorageManager({
      forceAdapter: 'localstorage',
      localStoragePrefix: 'factory_test_ls',
      autoMigrate: false,
    });
    createdManagers.push(manager);

    expect(engine).toBe('localstorage');
    expect(manager).toBeInstanceOf(LocalStorageManager);
  });

  it('creates IndexedDbStorageManager when forceAdapter is "indexeddb"', async () => {
    const { manager, engine } = await createStorageManager({
      forceAdapter: 'indexeddb',
      dbName: 'factory_test_idb',
      autoMigrate: false,
    });
    createdManagers.push(manager);

    expect(engine).toBe('indexeddb');
    expect(manager).toBeInstanceOf(IndexedDbStorageManager);
  });

  it('executes autoMigrate by default and sets schema version to 1', async () => {
    const { manager } = await createStorageManager({
      forceAdapter: 'memory',
      autoMigrate: true,
    });
    createdManagers.push(manager);

    expect(await manager.getSchemaVersion()).toBe(1);

    const settingsAdapter = manager.getCollection('settings');
    const settings = await settingsAdapter.get('global');
    expect(settings).not.toBeNull();
  });
});

