import { beforeEach, describe, expect, it } from 'vitest';
import { MemoryStorageManager } from '@core/storage/adapters/memoryAdapter';
import { SettingsRepository } from './settingsRepository';
import { DEFAULT_SETTINGS } from '../models/settings';

describe('SettingsRepository', () => {
  let storageManager: MemoryStorageManager;
  let repo: SettingsRepository;

  beforeEach(() => {
    storageManager = new MemoryStorageManager();
    repo = new SettingsRepository(storageManager);
  });

  it('returns default settings when storage is empty', async () => {
    const settings = await repo.getSettings();
    expect(settings).toEqual(DEFAULT_SETTINGS);
  });

  it('saves partial updates and returns merged settings', async () => {
    const updated = await repo.saveSettings({
      theme: 'dark',
      weekStartsOn: 0,
    });

    expect(updated.theme).toBe('dark');
    expect(updated.weekStartsOn).toBe(0);
    expect(updated.remindersEnabled).toBe(true);

    const reloaded = await repo.getSettings();
    expect(reloaded).toEqual(updated);
  });
});

