import { Migration } from './types';

/**
 * Migration 1: Initialize baseline default settings record if absent.
 */
export const migrationV1InitialSchema: Migration = {
  version: 1,
  name: 'v1_initial_schema',
  description: 'Initializes default application settings baseline',
  async up({ manager }) {
    const settingsAdapter = manager.getCollection<{
      key: string;
      theme: 'system' | 'light' | 'dark';
      weekStartsOn: 0 | 1;
      remindersEnabled: boolean;
    }>('settings');

    const existing = await settingsAdapter.get('global');
    if (!existing) {
      await settingsAdapter.put({
        key: 'global',
        theme: 'system',
        weekStartsOn: 1,
        remindersEnabled: true,
      });
    }
  },
};

/**
 * Migration 2 (Sample / Verification Migration):
 * Demonstrates a non-breaking versioned migration updating settings schema with a new preference field.
 */
export const migrationV2SampleAddCompactView: Migration = {
  version: 2,
  name: 'v2_sample_add_compact_view',
  description:
    'Demonstrates non-breaking schema evolution by adding compactView preference',
  async up({ manager }) {
    const settingsAdapter = manager.getCollection<{
      key: string;
      theme: 'system' | 'light' | 'dark';
      weekStartsOn: 0 | 1;
      remindersEnabled: boolean;
      compactView?: boolean;
    }>('settings');

    const existing = await settingsAdapter.get('global');
    if (existing && existing.compactView === undefined) {
      await settingsAdapter.put({
        ...existing,
        compactView: false,
      });
    }
  },
};

/**
 * Canonical list of all registered production migrations.
 */
export const canonicalMigrations: Migration[] = [migrationV1InitialSchema];
