import { StorageManager } from './types';
import {
  IndexedDbStorageManager,
  IndexedDbOptions,
} from './adapters/indexedDbAdapter';
import {
  LocalStorageManager,
  LocalStorageAdapterOptions,
} from './adapters/localStorageAdapter';
import { MemoryStorageManager } from './adapters/memoryAdapter';
import { requestPersistentStorage } from './persistence';
import { MigrationRunner } from './migrations/runner';
import { Migration } from './migrations/types';
import { canonicalMigrations } from './migrations/registry';

export type StorageAdapterType = 'indexeddb' | 'localstorage' | 'memory';

export interface StorageFactoryOptions {
  /**
   * Explicitly force a specific underlying storage engine.
   * Useful for testing and controlled environments.
   */
  forceAdapter?: StorageAdapterType;

  /**
   * Custom database name for IndexedDB.
   */
  dbName?: string;

  /**
   * Custom key prefix for LocalStorage fallback.
   */
  localStoragePrefix?: string;

  /**
   * Whether to automatically request persistent storage quota. Default: true.
   */
  autoPersist?: boolean;

  /**
   * Whether to run schema migrations automatically upon initialization. Default: true.
   */
  autoMigrate?: boolean;

  /**
   * List of migrations to execute. Defaults to canonicalMigrations.
   */
  migrations?: Migration[];
}

/**
 * Probes whether IndexedDB is functional in the current browser runtime.
 * Throws or returns false in restricted environments such as Firefox Private Browsing.
 */
async function canUseIndexedDB(
  dbName = '__kashtask_probe__'
): Promise<boolean> {
  if (typeof window === 'undefined' && typeof indexedDB === 'undefined') {
    return false;
  }

  const idbFactory =
    typeof indexedDB !== 'undefined'
      ? indexedDB
      : typeof window !== 'undefined'
        ? window.indexedDB
        : undefined;

  if (!idbFactory) {
    return false;
  }

  return new Promise<boolean>((resolve) => {
    try {
      const request = idbFactory.open(dbName);

      request.onsuccess = () => {
        try {
          const db = request.result;
          db.close();
          // Clean up probe database
          idbFactory.deleteDatabase(dbName);
          resolve(true);
        } catch {
          resolve(true);
        }
      };

      request.onerror = () => {
        resolve(false);
      };

      request.onblocked = () => {
        resolve(false);
      };
    } catch {
      resolve(false);
    }
  });
}

/**
 * Probes whether LocalStorage is functional in the current environment.
 */
function canUseLocalStorage(): boolean {
  if (typeof window === 'undefined' && typeof localStorage === 'undefined') {
    return false;
  }

  try {
    const storage =
      typeof localStorage !== 'undefined'
        ? localStorage
        : typeof window !== 'undefined'
          ? window.localStorage
          : undefined;

    if (!storage) {
      return false;
    }

    const testKey = '__kashtask_probe_ls__';
    storage.setItem(testKey, '1');
    storage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Creates and initializes a StorageManager instance with automatic engine detection,
 * graceful fallback (IndexedDB -> LocalStorage -> Memory), persistence request, and migration execution.
 */
export async function createStorageManager(
  options: StorageFactoryOptions = {}
): Promise<{ manager: StorageManager; engine: StorageAdapterType }> {
  let chosenEngine: StorageAdapterType;
  let manager: StorageManager;

  if (options.forceAdapter) {
    chosenEngine = options.forceAdapter;
  } else if (await canUseIndexedDB()) {
    chosenEngine = 'indexeddb';
  } else if (canUseLocalStorage()) {
    chosenEngine = 'localstorage';
  } else {
    chosenEngine = 'memory';
  }

  switch (chosenEngine) {
    case 'indexeddb': {
      const dbOptions: IndexedDbOptions = {
        dbName: options.dbName,
      };
      manager = new IndexedDbStorageManager(dbOptions);
      break;
    }
    case 'localstorage': {
      const lsOptions: LocalStorageAdapterOptions = {
        prefix: options.localStoragePrefix,
      };
      manager = new LocalStorageManager(lsOptions);
      break;
    }
    case 'memory':
    default: {
      manager = new MemoryStorageManager();
      break;
    }
  }

  // Request persistent storage if enabled and supported
  if (options.autoPersist !== false) {
    void requestPersistentStorage();
  }

  // Execute schema migrations if enabled
  if (options.autoMigrate !== false) {
    const runner = new MigrationRunner(
      manager,
      options.migrations ?? canonicalMigrations
    );
    await runner.runMigrations();
  }

  return { manager, engine: chosenEngine };
}
