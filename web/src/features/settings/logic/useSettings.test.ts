import { beforeEach, describe, expect, it } from 'vitest';
import type { ISettingsRepository, Settings } from '../models/settings';
import { DEFAULT_SETTINGS } from '../models/settings';
import { initSettings, useSettingsStore } from './useSettings';

class MockSettingsRepository implements ISettingsRepository {
  private current: Settings = { ...DEFAULT_SETTINGS };

  async getSettings(): Promise<Settings> {
    return { ...this.current };
  }

  async saveSettings(patch: Partial<Omit<Settings, 'key'>>): Promise<Settings> {
    this.current = { ...this.current, ...patch };
    return { ...this.current };
  }
}

describe('useSettings logic', () => {
  let repo: MockSettingsRepository;

  beforeEach(async () => {
    repo = new MockSettingsRepository();
    await initSettings(repo);
  });

  it('initialises store with default settings', () => {
    const state = useSettingsStore.getState();
    expect(state.loaded).toBe(true);
    expect(state.settings.theme).toBe('system');
    expect(state.settings.weekStartsOn).toBe(1);
  });

  it('updates theme in store and persists via repository', async () => {
    await useSettingsStore.getState().setTheme('dark');
    expect(useSettingsStore.getState().settings.theme).toBe('dark');

    const persisted = await repo.getSettings();
    expect(persisted.theme).toBe('dark');
  });

  it('updates weekStartsOn and persists via repository', async () => {
    await useSettingsStore.getState().setWeekStartsOn(0);
    expect(useSettingsStore.getState().settings.weekStartsOn).toBe(0);

    const persisted = await repo.getSettings();
    expect(persisted.weekStartsOn).toBe(0);
  });
});
