import { describe, expect, it } from 'vitest';
import type { Task } from '../models/task';
import {
  createTask,
  filterTasks,
  sortTasks,
  toggleDone,
  updateTask,
} from './taskOperations';

describe('Task Pure Domain Operations', () => {
  const t0 = new Date('2026-11-04T10:00:00.000Z');
  const t1 = new Date('2026-11-04T11:00:00.000Z');
  const t2 = new Date('2026-11-04T12:00:00.000Z');

  const baseTask: Task = {
    id: '01ARZ3NDEKTSV4RRFFQ69G5FA1',
    title: 'Base Task',
    urgent: true,
    important: false,
    status: 'todo',
    order: 1,
    createdAt: t0.toISOString(),
    updatedAt: t0.toISOString(),
    completedAt: undefined,
  };

  describe('createTask', () => {
    it('creates a task with provided options', () => {
      const task = createTask(
        { title: 'New Task', urgent: true, important: true },
        {
          clock: () => t0,
          idGenerator: () => '01ARZ3NDEKTSV4RRFFQ69G5FA2',
          order: 5,
        }
      );

      expect(task.id).toBe('01ARZ3NDEKTSV4RRFFQ69G5FA2');
      expect(task.title).toBe('New Task');
      expect(task.urgent).toBe(true);
      expect(task.important).toBe(true);
      expect(task.order).toBe(5);
      expect(task.createdAt).toBe(t0.toISOString());
    });
  });

  describe('updateTask', () => {
    it('updates fields and updates updatedAt timestamp', () => {
      const updated = updateTask(
        baseTask,
        { title: 'Updated Title' },
        () => t1
      );

      expect(updated.title).toBe('Updated Title');
      expect(updated.updatedAt).toBe(t1.toISOString());
      expect(updated.createdAt).toBe(baseTask.createdAt);
    });

    it('sets completedAt when transitioning from todo to done', () => {
      const doneTask = updateTask(baseTask, { status: 'done' }, () => t1);

      expect(doneTask.status).toBe('done');
      expect(doneTask.completedAt).toBe(t1.toISOString());
      expect(doneTask.updatedAt).toBe(t1.toISOString());
    });

    it('clears completedAt when transitioning from done to todo', () => {
      const doneTask = updateTask(baseTask, { status: 'done' }, () => t1);
      const reTodo = updateTask(doneTask, { status: 'todo' }, () => t2);

      expect(reTodo.status).toBe('todo');
      expect(reTodo.completedAt).toBeUndefined();
      expect(reTodo.updatedAt).toBe(t2.toISOString());
    });
  });

  describe('toggleDone', () => {
    it('toggles todo to done and back', () => {
      const toggled1 = toggleDone(baseTask, () => t1);
      expect(toggled1.status).toBe('done');
      expect(toggled1.completedAt).toBe(t1.toISOString());

      const toggled2 = toggleDone(toggled1, () => t2);
      expect(toggled2.status).toBe('todo');
      expect(toggled2.completedAt).toBeUndefined();
    });
  });

  describe('filterTasks', () => {
    const tasks: Task[] = [
      { ...baseTask, id: '1', status: 'todo', urgent: true, important: true }, // DO
      { ...baseTask, id: '2', status: 'done', urgent: false, important: true }, // SCHEDULE
      { ...baseTask, id: '3', status: 'todo', urgent: true, important: false }, // DELEGATE
      { ...baseTask, id: '4', status: 'done', urgent: false, important: false }, // ELIMINATE
    ];

    it('filters by status (all, active, done)', () => {
      expect(filterTasks(tasks, 'all')).toHaveLength(4);
      expect(filterTasks(tasks, 'active')).toHaveLength(2);
      expect(filterTasks(tasks, 'active').map((t) => t.id)).toEqual(['1', '3']);
      expect(filterTasks(tasks, 'done')).toHaveLength(2);
      expect(filterTasks(tasks, 'done').map((t) => t.id)).toEqual(['2', '4']);
    });

    it('filters by quadrant combined with status', () => {
      expect(filterTasks(tasks, 'all', 'DO')).toHaveLength(1);
      expect(filterTasks(tasks, 'all', 'DO')[0].id).toBe('1');

      expect(filterTasks(tasks, 'active', 'SCHEDULE')).toHaveLength(0);
      expect(filterTasks(tasks, 'done', 'SCHEDULE')).toHaveLength(1);
      expect(filterTasks(tasks, 'done', 'SCHEDULE')[0].id).toBe('2');
    });
  });

  describe('sortTasks', () => {
    const tasks: Task[] = [
      {
        ...baseTask,
        id: '1',
        title: 'Zebra',
        order: 3,
        dueDate: '2026-11-10',
        createdAt: '2026-11-01T00:00:00Z',
      },
      {
        ...baseTask,
        id: '2',
        title: 'Apple',
        order: 1,
        dueDate: undefined,
        createdAt: '2026-11-03T00:00:00Z',
      },
      {
        ...baseTask,
        id: '3',
        title: 'Mango',
        order: 2,
        dueDate: '2026-11-05',
        createdAt: '2026-11-02T00:00:00Z',
      },
    ];

    it('sorts by order ascending', () => {
      const sorted = sortTasks(tasks, 'order');
      expect(sorted.map((t) => t.id)).toEqual(['2', '3', '1']);
    });

    it('sorts by dueDate (with dates first in chronological order)', () => {
      const sorted = sortTasks(tasks, 'dueDate');
      expect(sorted.map((t) => t.id)).toEqual(['3', '1', '2']);
    });

    it('sorts by createdAt descending (newest first)', () => {
      const sorted = sortTasks(tasks, 'createdAt');
      expect(sorted.map((t) => t.id)).toEqual(['2', '3', '1']);
    });

    it('sorts by title alphabetically', () => {
      const sorted = sortTasks(tasks, 'title');
      expect(sorted.map((t) => t.id)).toEqual(['2', '3', '1']);
    });
  });
});
