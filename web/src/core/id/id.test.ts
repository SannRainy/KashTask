import { describe, it, expect } from 'vitest';
import { generateId, isValidId, createMonotonicIdGenerator } from './index';

describe('core/id', () => {
  it('generates a 26-character valid ULID', () => {
    const id = generateId();
    expect(id).toHaveLength(26);
    expect(isValidId(id)).toBe(true);
  });

  it('correctly invalidates malformed strings', () => {
    expect(isValidId('')).toBe(false);
    expect(isValidId('short-id')).toBe(false);
    expect(isValidId('012345678901234567890123456')).toBe(false); // 27 chars
    expect(isValidId('invalid_chars_here_$$$$$$$$')).toBe(false);
  });

  it('generates monotonically increasing IDs when generated rapidly', () => {
    const monotonic = createMonotonicIdGenerator();
    const id1 = monotonic();
    const id2 = monotonic();
    const id3 = monotonic();

    expect(id1 < id2).toBe(true);
    expect(id2 < id3).toBe(true);
  });

  it('respects seed timestamp when generating id', () => {
    const fixedTime = 1700000000000;
    const idA = generateId(fixedTime);
    const idB = generateId(fixedTime + 100000);

    expect(idA < idB).toBe(true);
  });
});

