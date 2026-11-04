import { z } from 'zod';
import type { Clock } from '@core/clock';
import { systemClock, getNowISOString } from '@core/clock';
import { generateId } from '@core/id';

/**
 * Habit recurrence frequency definition.
 * - daily: runs every calendar day
 * - weekdays: runs on specific days of the week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
 */
export type HabitFrequency =
  { type: 'daily' } | { type: 'weekdays'; days: number[] };

/**
 * Zod validation schema for HabitFrequency.
 */
export const HabitFrequencySchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('daily'),
  }),
  z.object({
    type: z.literal('weekdays'),
    days: z
      .array(z.number().int().min(0).max(6))
      .min(1, 'Please select at least one day')
      .refine(
        (days) => new Set(days).size === days.length,
        'Days must be unique'
      ),
  }),
]);

/**
 * Supported habit color palette keys.
 */
export const HABIT_COLOR_KEYS = [
  'indigo',
  'emerald',
  'amber',
  'coral',
  'purple',
  'cyan',
] as const;

export type HabitColorKey = (typeof HABIT_COLOR_KEYS)[number];

export interface HabitColorDefinition {
  key: HabitColorKey;
  label: string;
  value: string; // CSS color or hex
  lightBg: string;
}

export const HABIT_COLORS: Record<HabitColorKey, HabitColorDefinition> = {
  indigo: {
    key: 'indigo',
    label: 'Indigo',
    value: '#6366f1',
    lightBg: '#eef2ff',
  },
  emerald: {
    key: 'emerald',
    label: 'Emerald',
    value: '#10b981',
    lightBg: '#ecfdf5',
  },
  amber: {
    key: 'amber',
    label: 'Amber',
    value: '#f59e0b',
    lightBg: '#fffbeb',
  },
  coral: {
    key: 'coral',
    label: 'Coral',
    value: '#f43f5e',
    lightBg: '#fff1f2',
  },
  purple: {
    key: 'purple',
    label: 'Purple',
    value: '#8b5cf6',
    lightBg: '#f5f3ff',
  },
  cyan: {
    key: 'cyan',
    label: 'Cyan',
    value: '#06b6d4',
    lightBg: '#ecfeff',
  },
};

/**
 * Habit entity representing a tracked routine.
 * Complies with docs/DOMAIN.md specifications.
 */
export interface Habit {
  /** Canonical 26-character Crockford Base32 ULID. */
  id: string;
  /** Habit name, 1–100 characters, trimmed. */
  name: string;
  /** Frequency pattern (daily or specific weekdays). */
  frequency: HabitFrequency;
  /** Optional local reminder time in 24h HH:mm format. */
  reminderTime?: string;
  /** Color theme token identifier. */
  colorKey: string;
  /** Creation timestamp in ISO 8601 UTC. */
  createdAt: string;
  /** Archive timestamp in ISO 8601 UTC if archived, undefined if active. */
  archivedAt?: string;
}

/**
 * Zod validation schema for Habit entity.
 */
export const HabitSchema = z.object({
  id: z.string().length(26, 'ID must be a 26-character ULID'),
  name: z
    .string()
    .trim()
    .min(1, 'Name is required')
    .max(100, 'Name cannot exceed 100 characters'),
  frequency: HabitFrequencySchema,
  reminderTime: z
    .string()
    .regex(
      /^(?:[01]\d|2[0-3]):[0-5]\d$/,
      'Reminder time must be in HH:mm 24-hour format'
    )
    .optional(),
  colorKey: z.string().min(1, 'Color key is required'),
  createdAt: z.string().datetime(),
  archivedAt: z.string().datetime().optional(),
});

/**
 * Input for creating a new Habit.
 */
export interface CreateHabitInput {
  name: string;
  frequency: HabitFrequency;
  reminderTime?: string;
  colorKey?: string;
}

/**
 * Zod schema for habit creation input.
 */
export const CreateHabitInputSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Name is required')
    .max(100, 'Name cannot exceed 100 characters'),
  frequency: HabitFrequencySchema,
  reminderTime: z
    .string()
    .regex(
      /^(?:[01]\d|2[0-3]):[0-5]\d$/,
      'Reminder time must be in HH:mm 24-hour format'
    )
    .optional()
    .or(z.literal(''))
    .transform((val) => (val === '' ? undefined : val)),
  colorKey: z.string().min(1).default('indigo'),
});

/**
 * Factory function creating a validated Habit entity.
 */
export function createHabitEntity(
  input: CreateHabitInput,
  clock: Clock = systemClock,
  idGenerator: () => string = generateId
): Habit {
  const validated = CreateHabitInputSchema.parse(input);
  const now = getNowISOString(clock);

  return {
    id: idGenerator(),
    name: validated.name.trim(),
    frequency: validated.frequency,
    reminderTime: validated.reminderTime || undefined,
    colorKey: validated.colorKey,
    createdAt: now,
    archivedAt: undefined,
  };
}

/**
 * HabitLog entity recording a single completion of a habit on a local calendar date.
 * Complies with docs/DOMAIN.md specifications.
 */
export interface HabitLog {
  /** Reference to Habit.id. */
  habitId: string;
  /** Completion calendar date in local format YYYY-MM-DD. */
  date: string;
}

/**
 * Zod validation schema for HabitLog entity.
 */
export const HabitLogSchema = z.object({
  habitId: z.string().length(26, 'Habit ID must be a 26-character ULID'),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
});

/**
 * Repository interface for Habit storage.
 */
export interface IHabitRepository {
  getAll(): Promise<Habit[]>;
  getById(id: string): Promise<Habit | null>;
  save(habit: Habit): Promise<void>;
  saveMany(habits: Habit[]): Promise<void>;
  delete(id: string): Promise<void>;
  clear(): Promise<void>;
}

/**
 * Repository interface for HabitLog storage.
 */
export interface IHabitLogRepository {
  getAll(): Promise<HabitLog[]>;
  getByHabitId(habitId: string): Promise<HabitLog[]>;
  get(habitId: string, date: string): Promise<HabitLog | null>;
  save(log: HabitLog): Promise<void>;
  delete(habitId: string, date: string): Promise<void>;
  clear(): Promise<void>;
}
