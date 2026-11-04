import { ulid, isValid, monotonicFactory } from 'ulid';

/**
 * Generate a canonical 26-character Crockford Base32 ULID.
 * Lexicographically sortable by creation time.
 */
export function generateId(seedTime?: number): string {
  return ulid(seedTime);
}

/**
 * Validate whether a string is a valid canonical 26-character ULID.
 */
export function isValidId(id: string): boolean {
  if (typeof id !== 'string' || id.length !== 26) {
    return false;
  }
  return isValid(id);
}

/**
 * Create a monotonic ULID generator function that ensures strictly increasing
 * IDs even when generated within the exact same millisecond.
 */
export function createMonotonicIdGenerator(): () => string {
  return monotonicFactory();
}

