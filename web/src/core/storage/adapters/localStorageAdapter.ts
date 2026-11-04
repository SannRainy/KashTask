import {
  StorageAdapter,
  StorageManager,
  AllStorageCollection,
  KeyExtractor,
  defaultKeyExtractor,
} from '../types';
import { StorageError } from '../error';

export interface LocalStorageAdapterOptions {
  prefix?: string;
  storage?: Storage;
}

/**
 * Creates an in-memory W3C Storage-compatible implementation when localStorage is restricted or absent.
 */
export function createMemoryStorage(): Storage {
  const map = new Map<string, string>();

  return {
    get length(): number {
      return map.size;
    },
    clear(): void {
      map.clear();
    },
    getItem(key: string): string | null {
      return map.has(key) ? map.get(key)! : null;
    },
    key(index: number): string | null {
      const keys = Array.from(map.keys());
      return keys[index] ?? null;
    },
    removeItem(key: string): void {
      map.delete(key);
    },
    setItem(key: string, value: string): void {
      map.set(key, String(value));
    },
  };
}

function resolveStorage(options: LocalStorageAdapterOptions): Storage {
  if (options.storage && typeof options.storage.getItem === 'function') {
    return options.storage;
  }

  if (
    typeof window !== 'undefined' &&
    window.localStorage &&
    typeof window.localStorage.getItem === 'function'
  ) {
    return window.localStorage;
  }

  if (
    typeof localStorage !== 'undefined' &&
    typeof localStorage.getItem === 'function'
  ) {
    return localStorage;
  }

  return createMemoryStorage();
}

/**
 * Storage adapter backed by browser window.localStorage as a resilient fallback.
 */
export class LocalStorageAdapter<T> implements StorageAdapter<T> {
  private readonly collectionName: string;
  private readonly prefix: string;
  private readonly keyExtractor: KeyExtractor<T>;
  private readonly storage: Storage;

  constructor(
    collectionName: string,
    keyExtractor: KeyExtractor<T> = defaultKeyExtractor,
    options: LocalStorageAdapterOptions = {}
  ) {
    this.collectionName = collectionName;
    this.keyExtractor = keyExtractor;
    this.prefix = options.prefix ?? 'kashtask';
    this.storage = resolveStorage(options);
  }

  private getItemKey(id: string): string {
    return `${this.prefix}:${this.collectionName}:${id}`;
  }

  private getIndexKey(): string {
    return `${this.prefix}:${this.collectionName}:__keys__`;
  }

  private getKeys(): Set<string> {
    try {
      const raw = this.storage.getItem(this.getIndexKey());
      if (!raw) {
        return new Set();
      }
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? new Set(parsed) : new Set();
    } catch {
      return new Set();
    }
  }

  private saveKeys(keys: Set<string>): void {
    try {
      this.storage.setItem(
        this.getIndexKey(),
        JSON.stringify(Array.from(keys))
      );
    } catch (error) {
      throw StorageError.from(error, 'Failed to update localStorage key index');
    }
  }

  async get(id: string): Promise<T | null> {
    try {
      const raw = this.storage.getItem(this.getItemKey(id));
      if (raw === null) {
        return null;
      }
      return JSON.parse(raw) as T;
    } catch (error) {
      throw StorageError.from(
        error,
        `Failed to get item "${id}" from ${this.collectionName}`
      );
    }
  }

  async getAll(): Promise<T[]> {
    try {
      const keys = this.getKeys();
      const items: T[] = [];
      for (const id of keys) {
        const raw = this.storage.getItem(this.getItemKey(id));
        if (raw !== null) {
          try {
            items.push(JSON.parse(raw) as T);
          } catch {
            // Ignore malformed individual entries
          }
        }
      }
      return items;
    } catch (error) {
      throw StorageError.from(
        error,
        `Failed to retrieve all items from ${this.collectionName}`
      );
    }
  }

  async put(item: T): Promise<void> {
    const id = this.keyExtractor(item);
    const itemKey = this.getItemKey(id);

    try {
      this.storage.setItem(itemKey, JSON.stringify(item));
      const keys = this.getKeys();
      if (!keys.has(id)) {
        keys.add(id);
        this.saveKeys(keys);
      }
    } catch (error) {
      throw StorageError.from(
        error,
        `Failed to write item "${id}" to ${this.collectionName}`
      );
    }
  }

  async putMany(items: T[]): Promise<void> {
    for (const item of items) {
      await this.put(item);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      this.storage.removeItem(this.getItemKey(id));
      const keys = this.getKeys();
      if (keys.has(id)) {
        keys.delete(id);
        this.saveKeys(keys);
      }
    } catch (error) {
      throw StorageError.from(
        error,
        `Failed to delete item "${id}" from ${this.collectionName}`
      );
    }
  }

  async clear(): Promise<void> {
    try {
      const keys = this.getKeys();
      for (const id of keys) {
        this.storage.removeItem(this.getItemKey(id));
      }
      this.storage.removeItem(this.getIndexKey());
    } catch (error) {
      throw StorageError.from(
        error,
        `Failed to clear collection ${this.collectionName}`
      );
    }
  }
}

/**
 * LocalStorage-backed StorageManager implementation.
 */
export class LocalStorageManager implements StorageManager {
  private readonly options: LocalStorageAdapterOptions;
  private readonly collections = new Map<
    string,
    LocalStorageAdapter<unknown>
  >();

  constructor(options: LocalStorageAdapterOptions = {}) {
    this.options = {
      ...options,
      storage: resolveStorage(options),
    };
  }

  getCollection<T>(
    collectionName: AllStorageCollection,
    keyExtractor: KeyExtractor<T> = defaultKeyExtractor
  ): StorageAdapter<T> {
    if (!this.collections.has(collectionName)) {
      this.collections.set(
        collectionName,
        new LocalStorageAdapter<unknown>(
          collectionName,
          keyExtractor as KeyExtractor<unknown>,
          this.options
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
    // No-op for localStorage
  }

  async clearAll(): Promise<void> {
    for (const adapter of this.collections.values()) {
      await adapter.clear();
    }
  }
}
