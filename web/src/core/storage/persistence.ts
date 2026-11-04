/**
 * Check if the current browser environment supports the StorageManager API.
 */
function hasStorageManager(): boolean {
  return (
    typeof navigator !== 'undefined' &&
    typeof navigator.storage !== 'undefined' &&
    typeof navigator.storage.persist === 'function'
  );
}

/**
 * Requests that the browser grant persistent storage to prevent automatic eviction
 * of KashTask offline data under storage pressure.
 *
 * @returns Promise<boolean> - True if persistence was granted or already active, false otherwise.
 */
export async function requestPersistentStorage(): Promise<boolean> {
  if (!hasStorageManager()) {
    return false;
  }

  try {
    const isAlreadyPersisted = await navigator.storage.persisted();
    if (isAlreadyPersisted) {
      return true;
    }
    return await navigator.storage.persist();
  } catch {
    // If an error occurs (e.g. permission prompt rejected or sandboxed iframe), fail gracefully
    return false;
  }
}

/**
 * Queries whether the storage for this origin is already marked as persistent.
 */
export async function isStoragePersisted(): Promise<boolean> {
  if (
    !hasStorageManager() ||
    typeof navigator.storage.persisted !== 'function'
  ) {
    return false;
  }

  try {
    return await navigator.storage.persisted();
  } catch {
    return false;
  }
}
