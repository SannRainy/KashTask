/**
 * Data portability — pure functions for export and import of KashTask data.
 *
 * This module only contains pure logic (build / parse). Side effects (file
 * download, storage writes, store reloads) live in useDataPortability.ts.
 */
import { z } from 'zod';
import type { Clock } from '@core/clock';
import { systemClock } from '@core/clock';
import { TaskSchema } from '@features/tasks';
import { HabitSchema, HabitLogSchema } from '@features/habits';

// ---------------------------------------------------------------------------
// Settings schema (inline — avoids importing from data layer)
// ---------------------------------------------------------------------------
const SettingsExportSchema = z.object({
  key: z.literal('global'),
  theme: z.enum(['system', 'light', 'dark']),
  weekStartsOn: z.union([z.literal(0), z.literal(1)]),
  remindersEnabled: z.boolean(),
});

// ---------------------------------------------------------------------------
// Export file schema
// ---------------------------------------------------------------------------
export const SUPPORTED_SCHEMA_VERSION = 1 as const;

export const ExportFileSchema = z
  .object({
    app: z.literal('kashtask'),
    schemaVersion: z.literal(SUPPORTED_SCHEMA_VERSION),
    exportedAt: z.string().datetime({ offset: true }),
    tasks: z.array(TaskSchema),
    habits: z.array(HabitSchema),
    habitLogs: z.array(HabitLogSchema),
    settings: SettingsExportSchema,
  })
  .superRefine((data, ctx) => {
    const habitIds = new Set(data.habits.map((h) => h.id));
    data.habitLogs.forEach((log, i) => {
      if (!habitIds.has(log.habitId)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['habitLogs', i, 'habitId'],
          message: `habitLog references unknown habitId "${log.habitId}"`,
        });
      }
    });
  });

export type ExportFile = z.infer<typeof ExportFileSchema>;

// ---------------------------------------------------------------------------
// Pure: build export object from raw data
// ---------------------------------------------------------------------------
export function buildExportData(
  tasks: ExportFile['tasks'],
  habits: ExportFile['habits'],
  habitLogs: ExportFile['habitLogs'],
  settings: ExportFile['settings'],
  clock: Clock = systemClock
): ExportFile {
  return {
    app: 'kashtask',
    schemaVersion: SUPPORTED_SCHEMA_VERSION,
    exportedAt: clock().toISOString(),
    tasks,
    habits,
    habitLogs,
    settings,
  };
}

// ---------------------------------------------------------------------------
// Pure: validate import JSON string → ExportFile or error message
// ---------------------------------------------------------------------------
export type ParseResult =
  { ok: true; data: ExportFile } | { ok: false; error: string };

export function parseImportFile(jsonStr: string): ParseResult {
  let raw: unknown;
  try {
    raw = JSON.parse(jsonStr);
  } catch {
    return { ok: false, error: 'File is not valid JSON.' };
  }

  if (raw === null || typeof raw !== 'object') {
    return { ok: false, error: 'File must contain a JSON object.' };
  }

  const candidate = raw as Record<string, unknown>;

  // Fast-fail before full schema parse for clearer messages
  if (candidate.app !== 'kashtask') {
    return {
      ok: false,
      error: `Unrecognised file: expected app "kashtask", got "${String(candidate.app)}".`,
    };
  }
  if (candidate.schemaVersion !== SUPPORTED_SCHEMA_VERSION) {
    return {
      ok: false,
      error: `Unsupported schema version: ${String(candidate.schemaVersion)}. This build only supports version ${SUPPORTED_SCHEMA_VERSION}.`,
    };
  }

  const result = ExportFileSchema.safeParse(raw);
  if (!result.success) {
    const first = result.error.issues[0];
    const path = first.path.length > 0 ? ` (at ${first.path.join('.')})` : '';
    return {
      ok: false,
      error: `Import validation failed: ${first.message}${path}.`,
    };
  }

  return { ok: true, data: result.data };
}
