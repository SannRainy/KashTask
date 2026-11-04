import type { Clock } from '@core/clock';
import { systemClock, getNowISOString } from '@core/clock';
import { generateId } from '@core/id';
import type {
  CreateTaskInput,
  Quadrant,
  Task,
  TaskStatus,
} from '../models/task';
import { createTaskEntity, deriveQuadrant } from '../models/task';

/**
 * Filter mode for task listing.
 */
export type TaskFilter = 'all' | 'active' | 'done';

/**
 * Sorting criteria for tasks.
 */
export type TaskSortOption = 'order' | 'dueDate' | 'createdAt' | 'title';

/**
 * Pure function: creates a new Task entity.
 */
export function createTask(
  input: CreateTaskInput,
  options?: {
    clock?: Clock;
    idGenerator?: () => string;
    order?: number;
  }
): Task {
  return createTaskEntity(
    {
      ...input,
      order: options?.order ?? input.order,
    },
    options?.clock ?? systemClock,
    options?.idGenerator ?? generateId
  );
}

/**
 * Pure function: updates a Task with a partial patch.
 * Correctly manages updatedAt and completedAt based on status transition.
 */
export function updateTask(
  task: Task,
  patch: Partial<Omit<Task, 'id' | 'createdAt'>>,
  clock: Clock = systemClock
): Task {
  const now = getNowISOString(clock);
  let status: TaskStatus = patch.status ?? task.status;
  let completedAt: string | undefined = task.completedAt;

  if (patch.status !== undefined && patch.status !== task.status) {
    status = patch.status;
    if (status === 'done') {
      completedAt = now;
    } else {
      completedAt = undefined;
    }
  }

  return {
    ...task,
    ...patch,
    status,
    completedAt,
    updatedAt: now,
  };
}

/**
 * Pure function: toggles completion status ('todo' <-> 'done').
 */
export function toggleDone(task: Task, clock: Clock = systemClock): Task {
  const nextStatus: TaskStatus = task.status === 'done' ? 'todo' : 'done';
  return updateTask(task, { status: nextStatus }, clock);
}

/**
 * Pure function: filters an array of tasks by status and optional quadrant.
 */
export function filterTasks(
  tasks: Task[],
  filter: TaskFilter = 'all',
  quadrant: Quadrant | 'all' = 'all'
): Task[] {
  return tasks.filter((task) => {
    // Status filter
    if (filter === 'active' && task.status !== 'todo') return false;
    if (filter === 'done' && task.status !== 'done') return false;

    // Quadrant filter
    if (quadrant !== 'all') {
      const q = deriveQuadrant(task);
      if (q !== quadrant) return false;
    }

    return true;
  });
}

/**
 * Pure function: sorts tasks immutably based on the requested option.
 */
export function sortTasks(
  tasks: Task[],
  sortBy: TaskSortOption = 'order'
): Task[] {
  const copy = [...tasks];

  switch (sortBy) {
    case 'order':
      return copy.sort((a, b) => a.order - b.order);

    case 'dueDate':
      return copy.sort((a, b) => {
        // Items with due dates come first
        if (a.dueDate && !b.dueDate) return -1;
        if (!a.dueDate && b.dueDate) return 1;
        if (a.dueDate && b.dueDate) {
          const cmp = a.dueDate.localeCompare(b.dueDate);
          if (cmp !== 0) return cmp;
        }
        return a.order - b.order;
      });

    case 'createdAt':
      return copy.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

    case 'title':
      return copy.sort((a, b) =>
        a.title.localeCompare(b.title, undefined, { sensitivity: 'base' })
      );

    default:
      return copy;
  }
}

