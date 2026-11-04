import { describe, it, expect } from 'vitest';
import {
  Clock,
  systemClock,
  toLocalDateString,
  toISOStringUTC,
  getTodayDateString,
  getNowISOString,
} from './index';

describe('core/clock', () => {
  it('systemClock returns a valid Date instance close to current time', () => {
    const now = systemClock();
    expect(now).toBeInstanceOf(Date);
    expect(Math.abs(Date.now() - now.getTime())).toBeLessThan(1000);
  });

  it('toLocalDateString formats date to YYYY-MM-DD correctly', () => {
    const fixedDate = new Date(2026, 10, 4, 15, 30, 0); // Note: month 10 is November (0-indexed)
    expect(toLocalDateString(fixedDate)).toBe('2026-11-04');
  });

  it('toISOStringUTC formats date to standard ISO 8601 UTC string', () => {
    const fixedDate = new Date('2026-11-04T10:00:00.000Z');
    expect(toISOStringUTC(fixedDate)).toBe('2026-11-04T10:00:00.000Z');
  });

  it('accepts custom injected clock for deterministic date strings', () => {
    const mockClock: Clock = () => new Date('2026-12-31T23:59:59.000Z');
    expect(getNowISOString(mockClock)).toBe('2026-12-31T23:59:59.000Z');
  });

  it('getTodayDateString uses injected clock', () => {
    const mockClock: Clock = () => new Date(2027, 0, 1, 9, 0, 0); // 2027-01-01
    expect(getTodayDateString(mockClock)).toBe('2027-01-01');
  });
});

