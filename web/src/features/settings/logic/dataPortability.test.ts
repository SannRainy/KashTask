/**
 * dataPortability.test.ts — unit tests for pure build / parse functions.
 */
import { describe, it, expect } from 'vitest';
import {
  buildExportData,
  parseImportFile,
  ExportFileSchema,
} from './dataPortability';
import type { ExportFile } from './dataPortability';

// ---------------------------------------------------------------------------
// Minimal fixtures
// ---------------------------------------------------------------------------
const NOW = '2026-01-15T10:00:00.000Z';
const fixedClock = () => new Date(NOW);

const task: ExportFile['tasks'][number] = {
  id: '01HWABCDEFGHIJKLMNOPQRSTUV',
  title: 'Write tests',
  urgent: true,
  important: true,
  status: 'todo',
  order: 1,
  createdAt: NOW,
  updatedAt: NOW,
};

const habit: ExportFile['habits'][number] = {
  id: '01HWABCDEFGHIJKLMNOPQRSTU0',
  name: 'Exercise',
  frequency: { type: 'daily' },
  colorKey: 'indigo',
  createdAt: NOW,
};

const habitLog: ExportFile['habitLogs'][number] = {
  habitId: '01HWABCDEFGHIJKLMNOPQRSTU0',
  date: '2026-01-15',
};

const settings: ExportFile['settings'] = {
  key: 'global',
  theme: 'system',
  weekStartsOn: 1,
  remindersEnabled: true,
};

// ---------------------------------------------------------------------------
// buildExportData
// ---------------------------------------------------------------------------
describe('buildExportData', () => {
  it('produces a valid ExportFile structure', () => {
    const result = buildExportData(
      [task],
      [habit],
      [habitLog],
      settings,
      fixedClock
    );
    expect(result.app).toBe('kashtask');
    expect(result.schemaVersion).toBe(1);
    expect(result.exportedAt).toBe(NOW);
    expect(result.tasks).toHaveLength(1);
    expect(result.habits).toHaveLength(1);
    expect(result.habitLogs).toHaveLength(1);
  });

  it('round-trip: build → serialize → parse yields identical data', () => {
    const built = buildExportData(
      [task],
      [habit],
      [habitLog],
      settings,
      fixedClock
    );
    const json = JSON.stringify(built);
    const parsed = parseImportFile(json);
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    // Deep equality (strip functions)
    expect(parsed.data).toEqual(built);
  });

  it('uses systemClock when no clock provided', () => {
    const before = Date.now();
    const result = buildExportData([], [], [], settings);
    const after = Date.now();
    const ts = new Date(result.exportedAt).getTime();
    expect(ts).toBeGreaterThanOrEqual(before);
    expect(ts).toBeLessThanOrEqual(after);
  });
});

// ---------------------------------------------------------------------------
// parseImportFile — rejection cases
// ---------------------------------------------------------------------------
describe('parseImportFile', () => {
  const validJson = () =>
    JSON.stringify(
      buildExportData([task], [habit], [habitLog], settings, fixedClock)
    );

  it('accepts a valid export JSON string', () => {
    const result = parseImportFile(validJson());
    expect(result.ok).toBe(true);
  });

  it('rejects malformed JSON', () => {
    const result = parseImportFile('{ not valid json');
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toMatch(/not valid JSON/i);
  });

  it('rejects non-object JSON (array)', () => {
    const result = parseImportFile('[1, 2, 3]');
    expect(result.ok).toBe(false);
  });

  it('rejects wrong app field', () => {
    const obj = JSON.parse(validJson());
    obj.app = 'other-app';
    const result = parseImportFile(JSON.stringify(obj));
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toMatch(/kashtask/i);
  });

  it('rejects unsupported schemaVersion', () => {
    const obj = JSON.parse(validJson());
    obj.schemaVersion = 99;
    const result = parseImportFile(JSON.stringify(obj));
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toMatch(/unsupported schema version/i);
  });

  it('rejects habitLog with unknown habitId', () => {
    const obj = JSON.parse(validJson()) as ExportFile;
    obj.habitLogs = [
      { habitId: '01ZZZZZZZZZZZZZZZZZZZZZZZZ', date: '2026-01-15' },
    ];
    obj.habits = []; // remove the referenced habit
    const result = parseImportFile(JSON.stringify(obj));
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toMatch(/unknown habitId/i);
  });

  it('rejects empty tasks title', () => {
    const obj = JSON.parse(validJson()) as ExportFile;
    obj.tasks = [{ ...task, title: '' }];
    const result = parseImportFile(JSON.stringify(obj));
    expect(result.ok).toBe(false);
  });

  it('rejects null values at top level', () => {
    const result = parseImportFile('null');
    expect(result.ok).toBe(false);
  });

  it('validates ExportFileSchema directly for empty arrays', () => {
    const built = buildExportData([], [], [], settings, fixedClock);
    const result = ExportFileSchema.safeParse(built);
    expect(result.success).toBe(true);
  });
});
