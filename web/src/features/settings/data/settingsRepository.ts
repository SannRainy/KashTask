/**
 * SettingsRepository — data layer implementation.
 *
 * Only this layer is allowed to touch core storage directly.
 * Receives a StorageManager via constructor injection.
 */
import type { StorageManager } from '@core/storage';
import type { ISettingsRepository, Settings } from '../models/settings';
import { DEFAULT_SETTINGS } from '../models/settings';

export class SettingsRepository implements ISettingsRepository {
  private readonly collection;

  constructor(storageManager: StorageManager) {
    this.collection = storageManager.getCollection<Settings>('settings');
  }

  async getSettings(): Promise<Settings> {
    const stored = await this.collection.get('global');
    if (!stored) return { ...DEFAULT_SETTINGS };
    // Merge with defaults to handle schema additions across versions
    return { ...DEFAULT_SETTINGS, ...stored };
  }

  async saveSettings(patch: Partial<Omit<Settings, 'key'>>): Promise<Settings> {
    const current = await this.getSettings();
    const updated: Settings = { ...current, ...patch };
    await this.collection.put(updated);
    return updated;
  }
}
