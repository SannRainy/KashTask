import { describe, expect, it } from 'vitest';
import type { Task } from '@features/tasks';
import { deriveQuadrant } from '@features/tasks';
import { moveTask } from './moveTask';

describe('moveTask pure domain function', () => {
  const fixedTime = new Date('2026-11-04T15:00:00.000Z');
  const mockClock = () => fixedTime;

  const makeTask = (
    id: string,
    urgent: boolean,
    important: boolean,
    order: number,
    status: 'todo' | 'done' = 'todo',
    completedAt?: string
  ): Task => ({
    id,
    title: `Task ${id}`,
    urgent,
    important,
    order,
    status,
    completedAt,
    createdAt: '2026-11-04T10:00:00.000Z',
    updatedAt: '2026-11-04T10:00:00.000Z',
  });

  it('reorders tasks within the same quadrant', () => {
    // DO quadrant: T1 (order: 100), T2 (order: 200), T3 (order: 300)
    const t1 = makeTask('1', true, true, 100);
    const t2 = makeTask('2', true, true, 200);
    const t3 = makeTask('3', true, true, 300);
    const tasks = [t1, t2, t3];

    // Move T1 between T2 and T3 (index: 1 in remaining list [T2, T3])
    const result = moveTask(tasks, '1', 'DO', 1, mockClock);
    const moved = result.find((t) => t.id === '1')!;

    expect(moved.urgent).toBe(true);
    expect(moved.important).toBe(true);
    expect(moved.order).toBe(250); // Midpoint of 200 and 300
    expect(moved.updatedAt).toBe(fixedTime.toISOString());

    // Move T3 to top of DO (index: 0)
    const result2 = moveTask(tasks, '3', 'DO', 0, mockClock);
    const moved2 = result2.find((t) => t.id === '3')!;
    expect(moved2.order).toBe(50); // 100 / 2
  });

  it('moves task between different quadrants and updates urgent/important flags', () => {
    // T1 is in DO, T2 and T3 are in SCHEDULE
    const t1 = makeTask('1', true, true, 100); // DO
    const t2 = makeTask('2', false, true, 200); // SCHEDULE
    const t3 = makeTask('3', false, true, 400); // SCHEDULE
    const tasks = [t1, t2, t3];

    // Move T1 into SCHEDULE at index 1 (between T2 and T3)
    const result = moveTask(tasks, '1', 'SCHEDULE', 1, mockClock);
    const moved = result.find((t) => t.id === '1')!;

    // Flags must match SCHEDULE: urgent=false, important=true
    expect(moved.urgent).toBe(false);
    expect(moved.important).toBe(true);
    expect(deriveQuadrant(moved)).toBe('SCHEDULE');
    expect(moved.order).toBe(300); // Midpoint of 200 and 400
    expect(moved.updatedAt).toBe(fixedTime.toISOString());
  });

  it('moves task to an empty quadrant', () => {
    // T1 in DO. DELEGATE has 0 tasks.
    const t1 = makeTask('1', true, true, 100);
    const tasks = [t1];

    const result = moveTask(tasks, '1', 'DELEGATE', 0, mockClock);
    const moved = result.find((t) => t.id === '1')!;

    expect(moved.urgent).toBe(true);
    expect(moved.important).toBe(false);
    expect(deriveQuadrant(moved)).toBe('DELEGATE');
    expect(moved.order).toBe(1000);
  });

  it('preserves status and completedAt for completed tasks', () => {
    const completedTimestamp = '2026-11-04T12:00:00.000Z';
    // T1 is completed in ELIMINATE
    const t1 = makeTask('1', false, false, 100, 'done', completedTimestamp);
    const tasks = [t1];

    // Move completed task to DO
    const result = moveTask(tasks, '1', 'DO', 0, mockClock);
    const moved = result.find((t) => t.id === '1')!;

    // Quadrant flags updated
    expect(moved.urgent).toBe(true);
    expect(moved.important).toBe(true);
    expect(deriveQuadrant(moved)).toBe('DO');

    // Completed status and completedAt remain intact
    expect(moved.status).toBe('done');
    expect(moved.completedAt).toBe(completedTimestamp);
    expect(moved.updatedAt).toBe(fixedTime.toISOString());
  });
});
