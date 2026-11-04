import {
  StorageAdapter,
  StorageManager,
  AllStorageCollection,
  KeyExtractor,
  defaultKeyExtractor,
} from '../types';

/**
 * In-memory storage adapter for fast deterministic testing and fallback.
 */
export class MemoryAdapter<T> implements StorageAdapter<T> {
  private readonly store = new Map<string, T>();
  private readonly keyExtractor: KeyExtractor<T>;

  constructor(keyExtractor: KeyExtractor<T> = defaultKeyExtractor) {
    this.keyExtractor = keyExtractor;
  }

  async get(id: string): Promise<T | null> {
    const item = this.store.get(id);
    if (item === undefined) {
      return null;
    }
    // Deep clone to prevent accidental outside mutation
    return JSON.parse(JSON.stringify(item)) as T;
  }

  async getAll(): Promise<T[]> {
    const items = Array.from(this.store.values());
    return JSON.parse(JSON.stringify(items)) as T[];
  }

  async put(item: T): Promise<void> {
    const id = this.keyExtractor(item);
    this.store.set(id, JSON.parse(JSON.stringify(item)) as T);
  }

  async putMany(items: T[]): Promise<void> {
    for (const item of items) {
      await this.put(item);
    }
  }

  async delete(id: string): Promise<void> {
    this.store.delete(id);
  }

  async clear(): Promise<void> {
    this.store.clear();
  }
}

/**
 * Memory-backed StorageManager implementation.
 */
export class MemoryStorageManager implements StorageManager {
  private readonly collections = new Map<string, MemoryAdapter<unknown>>();
  private schemaVersion = 0;

  getCollection<T>(
    collectionName: AllStorageCollection,
    keyExtractor: KeyExtractor<T> = defaultKeyExtractor
  ): StorageAdapter<T> {
    if (!this.collections.has(collectionName)) {
      this.collections.set(
        collectionName,
        new MemoryAdapter<unknown>(keyExtractor as KeyExtractor<unknown>)
      );
    }
    return this.collections.get(collectionName) as unknown as StorageAdapter<T>;
  }

  async getSchemaVersion(): Promise<number> {
    return this.schemaVersion;
  }

  async setSchemaVersion(version: number): Promise<void> {
    this.schemaVersion = version;
  }

  async close(): Promise<void> {
    // No-op for in-memory store
  }

  async clearAll(): Promise<void> {
    for (const adapter of this.collections.values()) {
      await adapter.clear();
    }
    this.schemaVersion = 0;
  }
}
