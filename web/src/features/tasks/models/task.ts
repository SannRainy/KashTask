import { z } from 'zod';
import type { Clock } from '@core/clock';
import { systemClock, getNowISOString } from '@core/clock';
import { generateId } from '@core/id';

/**
 * Task completion status.
 */
export type TaskStatus = 'todo' | 'done';

/**
 * Eisenhower Matrix quadrants.
 */
export type Quadrant = 'DO' | 'SCHEDULE' | 'DELEGATE' | 'ELIMINATE';

/**
 * Task entity representing a single work item in KashTask.
 * Complies with docs/DOMAIN.md specifications.
 */
export interface Task {
  /** Canonical 26-character Crockford Base32 ULID. */
  id: string;
  /** Task title, 1–120 characters, trimmed. */
  title: string;
  /** Detailed notes or description. */
  notes?: string;
  /** Urgent flag. */
  urgent: boolean;
  /** Important flag. */
  important: boolean;
  /** Completion status. */
  status: TaskStatus;
  /** Due date formatted as YYYY-MM-DD. */
  dueDate?: string;
  /** Ordering index for manual visual sorting. */
  order: number;
  /** Creation timestamp in ISO 8601 UTC. */
  createdAt: string;
  /** Last update timestamp in ISO 8601 UTC. */
  updatedAt: string;
  /** Completion timestamp in ISO 8601 UTC if done, undefined if todo. */
  completedAt?: string;
}

/**
 * Zod validation schema for a complete Task entity.
 */
export const TaskSchema = z.object({
  id: z.string().length(26, 'ID must be a 26-character ULID'),
  title: z
    .string()
    .trim()
    .min(1, 'Title is required')
    .max(120, 'Title cannot exceed 120 characters'),
  notes: z.string().optional(),
  urgent: z.boolean(),
  important: z.boolean(),
  status: z.enum(['todo', 'done']),
  dueDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Due date must be in YYYY-MM-DD format')
    .optional(),
  order: z.number(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  completedAt: z.string().datetime().optional(),
});

/**
 * Input for creating a new Task.
 */
export interface CreateTaskInput {
  title: string;
  notes?: string;
  urgent?: boolean;
  important?: boolean;
  dueDate?: string;
  order?: number;
}

/**
 * Zod schema for task creation input.
 */
export const CreateTaskInputSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Title is required')
    .max(120, 'Title cannot exceed 120 characters'),
  notes: z.string().optional(),
  urgent: z.boolean().default(false),
  important: z.boolean().default(false),
  dueDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Due date must be in YYYY-MM-DD format')
    .optional(),
  order: z.number().optional(),
});

/**
 * Pure function deriving the Eisenhower Quadrant from urgent & important flags.
 *
 * urgent + important   => DO (Q1)
 * !urgent + important  => SCHEDULE (Q2)
 * urgent + !important  => DELEGATE (Q3)
 * !urgent + !important => ELIMINATE (Q4)
 */
export function deriveQuadrant(
  urgentOrTask: boolean | Pick<Task, 'urgent' | 'important'>,
  important?: boolean
): Quadrant {
  let isUrgent: boolean;
  let isImportant: boolean;

  if (typeof urgentOrTask === 'object' && urgentOrTask !== null) {
    isUrgent = Boolean(urgentOrTask.urgent);
    isImportant = Boolean(urgentOrTask.important);
  } else {
    isUrgent = Boolean(urgentOrTask);
    isImportant = Boolean(important);
  }

  if (isUrgent && isImportant) return 'DO';
  if (!isUrgent && isImportant) return 'SCHEDULE';
  if (isUrgent && !isImportant) return 'DELEGATE';
  return 'ELIMINATE';
}

/**
 * Factory function creating a validated Task entity.
 */
export function createTaskEntity(
  input: CreateTaskInput,
  clock: Clock = systemClock,
  idGenerator: () => string = generateId
): Task {
  const validated = CreateTaskInputSchema.parse(input);
  const now = getNowISOString(clock);

  return {
    id: idGenerator(),
    title: validated.title.trim(),
    notes: validated.notes?.trim() || undefined,
    urgent: validated.urgent,
    important: validated.important,
    status: 'todo',
    dueDate: validated.dueDate,
    order: validated.order ?? Date.now(),
    createdAt: now,
    updatedAt: now,
    completedAt: undefined,
  };
}

/**
 * Repository interface contract for task persistence.
 */
export interface ITaskRepository {
  getAll(): Promise<Task[]>;
  getById(id: string): Promise<Task | null>;
  save(task: Task): Promise<void>;
  saveMany(tasks: Task[]): Promise<void>;
  delete(id: string): Promise<void>;
  clear(): Promise<void>;
}
