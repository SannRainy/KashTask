import type { Clock } from '@core/clock';
import { systemClock, getNowISOString } from '@core/clock';
import type { Task, Quadrant } from '@features/tasks';
import { deriveQuadrant } from '@features/tasks';

/**
 * Target quadrant flags mapping.
 */
export const QUADRANT_FLAGS: Record<
  Quadrant,
  { urgent: boolean; important: boolean }
> = {
  DO: { urgent: true, important: true },
  SCHEDULE: { urgent: false, important: true },
  DELEGATE: { urgent: true, important: false },
  ELIMINATE: { urgent: false, important: false },
};

/**
 * Pure function: moves a task to a target quadrant and position (index).
 * Updates urgent/important flags according to the destination quadrant,
 * computes the new order using fractional indexing, and updates the timestamp.
 * Preserves the task's completion status (including completedAt if done).
 */
export function moveTask(
  tasks: Task[],
  taskId: string,
  targetQuadrant: Quadrant,
  targetIndex: number,
  clock: Clock = systemClock
): Task[] {
  const task = tasks.find((t) => t.id === taskId);
  if (!task) return tasks;

  const targetFlags = QUADRANT_FLAGS[targetQuadrant];

  // Other tasks in target quadrant, sorted by order ascending
  const targetQuadrantTasks = tasks
    .filter((t) => t.id !== taskId && deriveQuadrant(t) === targetQuadrant)
    .sort((a, b) => a.order - b.order);

  // Clamp target index
  const index = Math.max(0, Math.min(targetIndex, targetQuadrantTasks.length));

  let newOrder: number;

  if (targetQuadrantTasks.length === 0) {
    // Empty quadrant
    newOrder = 1000;
  } else if (index === 0) {
    // Top of quadrant
    const firstOrder = targetQuadrantTasks[0].order;
    newOrder = firstOrder > 1 ? firstOrder / 2 : firstOrder - 1000;
  } else if (index >= targetQuadrantTasks.length) {
    // Bottom of quadrant
    const lastOrder = targetQuadrantTasks[targetQuadrantTasks.length - 1].order;
    newOrder = lastOrder + 1000;
  } else {
    // Between two tasks: fractional midpoint
    const prevOrder = targetQuadrantTasks[index - 1].order;
    const nextOrder = targetQuadrantTasks[index].order;

    if (prevOrder < nextOrder) {
      newOrder = (prevOrder + nextOrder) / 2;
    } else {
      newOrder = prevOrder + 0.5;
    }
  }

  const updatedTask: Task = {
    ...task,
    urgent: targetFlags.urgent,
    important: targetFlags.important,
    order: newOrder,
    updatedAt: getNowISOString(clock),
  };

  return tasks.map((t) => (t.id === taskId ? updatedTask : t));
}
