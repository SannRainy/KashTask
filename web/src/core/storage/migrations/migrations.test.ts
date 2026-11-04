import { describe, it, expect, beforeEach } from 'vitest';
import { MemoryStorageManager } from '../adapters/memoryAdapter';
import { MigrationRunner } from './runner';
import { Migration } from './types';
import {
  migrationV1InitialSchema,
  migrationV2SampleAddCompactView,
} from './registry';
import { StorageError } from '../error';

describe('core/storage/migrations', () => {
  let manager: MemoryStorageManager;

  beforeEach(() => {
    manager = new MemoryStorageManager();
  });

  it('starts at schemaVersion 0 on empty storage', async () => {
    const runner = new MigrationRunner(manager, [migrationV1InitialSchema]);
    expect(await runner.getCurrentVersion()).toBe(0);
  });

  it('runs initial migration and seeds default settings at schemaVersion 1', async () => {
    const runner = new MigrationRunner(manager, [migrationV1InitialSchema]);
    const result = await runner.runMigrations();

    expect(result.previousVersion).toBe(0);
    expect(result.finalVersion).toBe(1);
    expect(result.executed).toHaveLength(1);
    expect(result.executed[0].name).toBe('v1_initial_schema');

    const settingsAdapter = manager.getCollection<{
      key: string;
      theme: string;
      weekStartsOn: number;
      remindersEnabled: boolean;
    }>('settings');

    const settings = await settingsAdapter.get('global');
    expect(settings).toEqual({
      key: 'global',
      theme: 'system',
      weekStartsOn: 1,
      remindersEnabled: true,
    });
  });

  it('runs sequential migrations incrementally (v1 -> v2)', async () => {
    const migrations: Migration[] = [
      migrationV1InitialSchema,
      migrationV2SampleAddCompactView,
    ];

    const runner = new MigrationRunner(manager, migrations);
    const result = await runner.runMigrations();

    expect(result.previousVersion).toBe(0);
    expect(result.finalVersion).toBe(2);
    expect(result.executed).toHaveLength(2);

    const settingsAdapter = manager.getCollection<{
      key: string;
      theme: string;
      compactView: boolean;
    }>('settings');

    const updated = await settingsAdapter.get('global');
    expect(updated?.compactView).toBe(false);
  });

  it('is idempotent when re-running migrations on up-to-date storage', async () => {
    const runner = new MigrationRunner(manager, [
      migrationV1InitialSchema,
      migrationV2SampleAddCompactView,
    ]);

    await runner.runMigrations();

    // Re-run
    const secondResult = await runner.runMigrations();
    expect(secondResult.previousVersion).toBe(2);
    expect(secondResult.finalVersion).toBe(2);
    expect(secondResult.executed).toHaveLength(0);
  });

  it('respects targetVersion parameter to run partial migrations', async () => {
    const runner = new MigrationRunner(manager, [
      migrationV1InitialSchema,
      migrationV2SampleAddCompactView,
    ]);

    // Run only up to v1
    const resultV1 = await runner.runMigrations(1);
    expect(resultV1.finalVersion).toBe(1);
    expect(resultV1.executed).toHaveLength(1);

    // Later run to v2
    const resultV2 = await runner.runMigrations(2);
    expect(resultV2.previousVersion).toBe(1);
    expect(resultV2.finalVersion).toBe(2);
    expect(resultV2.executed).toHaveLength(1);
    expect(resultV2.executed[0].name).toBe('v2_sample_add_compact_view');
  });

  it('throws StorageError on targetVersion lower than current database version', async () => {
    await manager.setSchemaVersion(2);
    const runner = new MigrationRunner(manager, [
      migrationV1InitialSchema,
      migrationV2SampleAddCompactView,
    ]);

    await expect(runner.runMigrations(1)).rejects.toThrow(StorageError);
  });

  it('fails gracefully and halts execution if an intermediate migration throws', async () => {
    const faultyMigration: Migration = {
      version: 2,
      name: 'faulty_step',
      async up() {
        throw new Error('Disk write simulation error');
      },
    };

    const thirdMigration: Migration = {
      version: 3,
      name: 'third_step',
      async up() {
        // Should not be reached
      },
    };

    const runner = new MigrationRunner(manager, [
      migrationV1InitialSchema,
      faultyMigration,
      thirdMigration,
    ]);

    await expect(runner.runMigrations()).rejects.toThrow(StorageError);

    // Version must stay at 1 (the last successful migration)
    expect(await manager.getSchemaVersion()).toBe(1);
  });
});
