import { openDB, IDBPDatabase } from 'idb';
import {
  StorageAdapter,
  StorageManager,
  AllStorageCollection,
  KeyExtractor,
  defaultKeyExtractor,
} from '../types';
import { StorageError } from '../error';

export interface IndexedDbOptions {
  dbName?: string;
  version?: number;
}

const DEFAULT_DB_NAME = 'kashtask_db';
const DEFAULT_DB_VERSION = 1;
const CANONICAL_STORES: AllStorageCollection[] = [
  'tasks',
  'habits',
  'habitLogs',
  'settings',
  '_meta',
];

/**
 * Storage adapter backed by modern IndexedDB using the official `idb` wrapper.
 */
export class IndexedDbAdapter<T> implements StorageAdapter<T> {
  private readonly collectionName: AllStorageCollection;
  private readonly keyExtractor: KeyExtractor<T>;
  private readonly getDb: () => Promise<IDBPDatabase>;

  constructor(
    collectionName: AllStorageCollection,
    getDb: () => Promise<IDBPDatabase>,
    keyExtractor: KeyExtractor<T> = defaultKeyExtractor
  ) {
    this.collectionName = collectionName;
    this.getDb = getDb;
    this.keyExtractor = keyExtractor;
  }

  async get(id: string): Promise<T | null> {
    try {
      const db = await this.getDb();
      const result = await db.get(this.collectionName, id);
      return result !== undefined ? (result as T) : null;
    } catch (error) {
      throw StorageError.from(
        error,
        `IndexedDB get failed on collection "${this.collectionName}" for ID "${id}"`
      );
    }
  }

  async getAll(): Promise<T[]> {
    try {
      const db = await this.getDb();
      const results = await db.getAll(this.collectionName);
      return (results ?? []) as T[];
    } catch (error) {
      throw StorageError.from(
        error,
        `IndexedDB getAll failed on collection "${this.collectionName}"`
      );
    }
  }

  async put(item: T): Promise<void> {
    try {
      const id = this.keyExtractor(item);
      const db = await this.getDb();
      await db.put(this.collectionName, item, id);
    } catch (error) {
      throw StorageError.from(
        error,
        `IndexedDB put failed on collection "${this.collectionName}"`
      );
    }
  }

  async putMany(items: T[]): Promise<void> {
    if (items.length === 0) {
      return;
    }

    try {
      const db = await this.getDb();
      const tx = db.transaction(this.collectionName, 'readwrite');
      for (const item of items) {
        const id = this.keyExtractor(item);
        await tx.store.put(item, id);
      }
      await tx.done;
    } catch (error) {
      throw StorageError.from(
        error,
        `IndexedDB putMany failed on collection "${this.collectionName}"`
      );
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const db = await this.getDb();
      await db.delete(this.collectionName, id);
    } catch (error) {
      throw StorageError.from(
        error,
        `IndexedDB delete failed on collection "${this.collectionName}" for ID "${id}"`
      );
    }
  }

  async clear(): Promise<void> {
    try {
      const db = await this.getDb();
      await db.clear(this.collectionName);
    } catch (error) {
      throw StorageError.from(
        error,
        `IndexedDB clear failed on collection "${this.collectionName}"`
      );
    }
  }
}

/**
 * StorageManager implementation backed by a shared IndexedDB database.
 */
export class IndexedDbStorageManager implements StorageManager {
  private readonly dbName: string;
  private readonly version: number;
  private dbPromise: Promise<IDBPDatabase> | null = null;
  private readonly collections = new Map<string, IndexedDbAdapter<unknown>>();

  constructor(options: IndexedDbOptions = {}) {
    this.dbName = options.dbName ?? DEFAULT_DB_NAME;
    this.version = options.version ?? DEFAULT_DB_VERSION;
  }

  private async openDatabase(): Promise<IDBPDatabase> {
    if (this.dbPromise) {
      return this.dbPromise;
    }

    this.dbPromise = (async () => {
      try {
        return await openDB(this.dbName, this.version, {
          upgrade(db) {
            for (const store of CANONICAL_STORES) {
              if (!db.objectStoreNames.contains(store)) {
                db.createObjectStore(store);
              }
            }
          },
          blocked() {
            throw new StorageError(
              'IndexedDB open request was blocked by an older open connection.',
              'database_blocked'
            );
          },
          blocking() {
            // Close connection to allow other tabs to upgrade if needed
          },
          terminated() {
            // Reset connection promise so subsequent calls try to reconnect
          },
        });
      } catch (error) {
        this.dbPromise = null;
        throw StorageError.from(
          error,
          `Failed to open IndexedDB database "${this.dbName}"`
        );
      }
    })();

    return this.dbPromise;
  }

  getCollection<T>(
    collectionName: AllStorageCollection,
    keyExtractor: KeyExtractor<T> = defaultKeyExtractor
  ): StorageAdapter<T> {
    if (!this.collections.has(collectionName)) {
      this.collections.set(
        collectionName,
        new IndexedDbAdapter<unknown>(
          collectionName,
          () => this.openDatabase(),
          keyExtractor as KeyExtractor<unknown>
        )
      );
    }
    return this.collections.get(collectionName) as unknown as StorageAdapter<T>;
  }

  async getSchemaVersion(): Promise<number> {
    const metaAdapter = this.getCollection<{ key: string; version: number }>(
      '_meta'
    );
    const record = await metaAdapter.get('schemaVersion');
    return record?.version ?? 0;
  }

  async setSchemaVersion(version: number): Promise<void> {
    const metaAdapter = this.getCollection<{ key: string; version: number }>(
      '_meta'
    );
    await metaAdapter.put({ key: 'schemaVersion', version });
  }

  async close(): Promise<void> {
    if (this.dbPromise) {
      try {
        const db = await this.dbPromise;
        db.close();
      } catch {
        // Ignore close errors
      } finally {
        this.dbPromise = null;
        this.collections.clear();
      }
    }
  }

  async clearAll(): Promise<void> {
    for (const store of CANONICAL_STORES) {
      const adapter = this.getCollection(store);
      await adapter.clear();
    }
  }
}
