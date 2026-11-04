/**
 * useDataPortability — logic layer hook for export / import side effects.
 *
 * Reads from Zustand stores, calls pure build/parse functions, then writes
 * back to storage and re-hydrates stores.
 *
 * The UI layer imports this hook; the data layer is accessed only via the
 * repository-based store init functions (initTaskStore, initHabitStore, initSettings).
 */
import { useCallback } from 'react';
import { useTaskStore, initTaskStore, TaskRepository } from '@features/tasks';
import {
  useHabitStore,
  initHabitStore,
  HabitRepository,
  HabitLogRepository,
} from '@features/habits';
import {
  useSettingsStore,
  initSettings,
  SettingsRepository,
} from '@features/settings';
import { createStorageManager } from '@core/storage';
import { buildExportData, parseImportFile } from './dataPortability';
import type { ExportFile, ParseResult } from './dataPortability';

// ---------------------------------------------------------------------------
// Export
// ---------------------------------------------------------------------------

/** Triggers a JSON file download with all current KashTask data. */
export function useExportData() {
  return useCallback(async (): Promise<
    { ok: true } | { ok: false; error: string }
  > => {
    try {
      const tasks = useTaskStore.getState().tasks;
      const habits = useHabitStore.getState().habits;
      const logs = useHabitStore.getState().logs;
      const settings = useSettingsStore.getState().settings;

      const exportData = buildExportData(tasks, habits, logs, settings);
      const json = JSON.stringify(exportData, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      const dateStr = new Date().toISOString().slice(0, 10);
      a.download = `kashtask-export-${dateStr}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      return { ok: true };
    } catch (err) {
      return {
        ok: false,
        error: err instanceof Error ? err.message : 'Export failed.',
      };
    }
  }, []);
}

// ---------------------------------------------------------------------------
// Parse preview (validate without writing)
// ---------------------------------------------------------------------------

/** Read a File object and return validated export data for preview. */
export async function readImportFile(file: File): Promise<ParseResult> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result;
      if (typeof text !== 'string') {
        resolve({ ok: false, error: 'Could not read file.' });
        return;
      }
      resolve(parseImportFile(text));
    };
    reader.onerror = () => resolve({ ok: false, error: 'File read error.' });
    reader.readAsText(file);
  });
}

// ---------------------------------------------------------------------------
// Import
// ---------------------------------------------------------------------------

export type ImportMode = 'replace' | 'merge';

/**
 * Write validated export data to storage and re-hydrate all stores.
 * - replace: clears all existing data first.
 * - merge: adds/updates records; existing records not in the file are kept.
 */
export async function applyImport(
  data: ExportFile,
  mode: ImportMode
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const { manager } = await createStorageManager();

    if (mode === 'replace') {
      await manager.clearAll();
    }

    const taskCol = manager.getCollection<ExportFile['tasks'][number]>('tasks');
    const habitCol =
      manager.getCollection<ExportFile['habits'][number]>('habits');
    const logCol =
      manager.getCollection<ExportFile['habitLogs'][number]>('habitLogs');
    const settingsCol =
      manager.getCollection<ExportFile['settings']>('settings');

    await Promise.all([
      taskCol.putMany(data.tasks),
      habitCol.putMany(data.habits),
      logCol.putMany(data.habitLogs),
      settingsCol.put(data.settings),
    ]);

    // Re-hydrate all stores with fresh data
    const taskRepo = new TaskRepository(manager);
    const habitRepo = new HabitRepository(manager);
    const logRepo = new HabitLogRepository(manager);
    const settingsRepo = new SettingsRepository(manager);

    await Promise.all([
      initTaskStore(taskRepo),
      initHabitStore(habitRepo, logRepo),
      initSettings(settingsRepo),
    ]);

    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Import failed.',
    };
  }
}

// ---------------------------------------------------------------------------
// Delete all data
// ---------------------------------------------------------------------------

/** Clears all collections and resets all stores to their empty defaults. */
export async function deleteAllData(): Promise<
  { ok: true } | { ok: false; error: string }
> {
  try {
    const { manager } = await createStorageManager();
    await manager.clearAll();

    const taskRepo = new TaskRepository(manager);
    const habitRepo = new HabitRepository(manager);
    const logRepo = new HabitLogRepository(manager);
    const settingsRepo = new SettingsRepository(manager);

    await Promise.all([
      initTaskStore(taskRepo),
      initHabitStore(habitRepo, logRepo),
      initSettings(settingsRepo),
    ]);

    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Delete failed.',
    };
  }
}
