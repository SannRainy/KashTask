/**
 * Canonical collections supported by KashTask offline storage.
 */
export type StorageCollection = 'tasks' | 'habits' | 'habitLogs' | 'settings';

/**
 * All allowed collection names including internal metadata store.
 */
export type AllStorageCollection = StorageCollection | '_meta';

/**
 * Function that extracts a unique string identifier from an entity item.
 */
export type KeyExtractor<T> = (item: T) => string;

/**
 * Default key extractor resolving .id or composite keys for KashTask entities.
 */
export function defaultKeyExtractor<T>(item: T): string {
  if (item && typeof item === 'object') {
    const candidate = item as Record<string, unknown>;
    if (typeof candidate.id === 'string' && candidate.id.length > 0) {
      return candidate.id;
    }
    // Composite key for habitLog (habitId:date)
    if (
      typeof candidate.habitId === 'string' &&
      typeof candidate.date === 'string'
    ) {
      return `${candidate.habitId}:${candidate.date}`;
    }
    // Fixed key for settings or singleton entities
    if (typeof candidate.key === 'string') {
      return candidate.key;
    }
  }
  return 'global';
}

/**
 * Generic contract for collection-level offline storage.
 */
export interface StorageAdapter<T> {
  /**
   * Retrieve an item by its unique identifier. Returns null if not found.
   */
  get(id: string): Promise<T | null>;

  /**
   * Retrieve all items stored in this collection.
   */
  getAll(): Promise<T[]>;

  /**
   * Insert or update an item in the collection.
   */
  put(item: T): Promise<void>;

  /**
   * Batch insert or update multiple items.
   */
  putMany(items: T[]): Promise<void>;

  /**
   * Delete an item by its unique identifier.
   */
  delete(id: string): Promise<void>;

  /**
   * Delete all items within this collection.
   */
  clear(): Promise<void>;
}

/**
 * Multi-collection storage container interface providing access to collection adapters.
 */
export interface StorageManager {
  /**
   * Get a strongly typed StorageAdapter for a given collection.
   */
  getCollection<T>(
    collectionName: AllStorageCollection,
    keyExtractor?: KeyExtractor<T>
  ): StorageAdapter<T>;

  /**
   * Get the current schema version stored in the database.
   */
  getSchemaVersion(): Promise<number>;

  /**
   * Set the schema version stored in the database.
   */
  setSchemaVersion(version: number): Promise<void>;

  /**
   * Close database connections / clean up resources.
   */
  close(): Promise<void>;

  /**
   * Clear all collections across the entire database.
   */
  clearAll(): Promise<void>;
}
