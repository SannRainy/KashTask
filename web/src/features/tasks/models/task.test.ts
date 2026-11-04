import { describe, expect, it } from 'vitest';
import { deriveQuadrant, createTaskEntity, TaskSchema } from './task';

describe('Task Models & Domain Rules', () => {
  describe('deriveQuadrant', () => {
    it('correctly maps all 4 combinations', () => {
      // Q1: Urgent + Important => DO
      expect(deriveQuadrant(true, true)).toBe('DO');
      expect(deriveQuadrant({ urgent: true, important: true })).toBe('DO');

      // Q2: Not Urgent + Important => SCHEDULE
      expect(deriveQuadrant(false, true)).toBe('SCHEDULE');
      expect(deriveQuadrant({ urgent: false, important: true })).toBe(
        'SCHEDULE'
      );

      // Q3: Urgent + Not Important => DELEGATE
      expect(deriveQuadrant(true, false)).toBe('DELEGATE');
      expect(deriveQuadrant({ urgent: true, important: false })).toBe(
        'DELEGATE'
      );

      // Q4: Neither => ELIMINATE
      expect(deriveQuadrant(false, false)).toBe('ELIMINATE');
      expect(deriveQuadrant({ urgent: false, important: false })).toBe(
        'ELIMINATE'
      );
    });
  });

  describe('createTaskEntity', () => {
    const fixedTime = new Date('2026-11-04T12:00:00.000Z');
    const mockClock = () => fixedTime;
    const mockId = () => '01ARZ3NDEKTSV4RRFFQ69G5FAV';

    it('creates a valid Task entity with default values', () => {
      const task = createTaskEntity(
        { title: 'Write tests' },
        mockClock,
        mockId
      );

      expect(task).toEqual({
        id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
        title: 'Write tests',
        notes: undefined,
        urgent: false,
        important: false,
        status: 'todo',
        dueDate: undefined,
        order: expect.any(Number),
        createdAt: '2026-11-04T12:00:00.000Z',
        updatedAt: '2026-11-04T12:00:00.000Z',
        completedAt: undefined,
      });

      expect(TaskSchema.safeParse(task).success).toBe(true);
    });

    it('trims whitespace from title and notes', () => {
      const task = createTaskEntity(
        {
          title: '   Clean Room   ',
          notes: '   Detail notes   ',
          urgent: true,
          important: false,
        },
        mockClock,
        mockId
      );

      expect(task.title).toBe('Clean Room');
      expect(task.notes).toBe('Detail notes');
      expect(task.urgent).toBe(true);
      expect(task.important).toBe(false);
    });

    it('rejects empty title or title exceeding 120 chars', () => {
      expect(() => createTaskEntity({ title: '' })).toThrow();
      expect(() => createTaskEntity({ title: '   ' })).toThrow();
      expect(() => createTaskEntity({ title: 'a'.repeat(121) })).toThrow();
    });
  });
});
