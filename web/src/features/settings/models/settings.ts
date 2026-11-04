/**
 * Settings domain model and repository contract.
 *
 * This file is intentionally pure — it imports nothing from other feature layers.
 */
import type { ThemeMode } from '@core/theme';

/** Singleton settings entity. The key is always 'global'. */
export interface Settings {
  /** Fixed singleton key — always 'global'. */
  key: 'global';
  /** UI colour scheme preference. */
  theme: ThemeMode;
  /** Day the week starts on: 0 = Sunday, 1 = Monday. */
  weekStartsOn: 0 | 1;
  /** Whether local reminder notifications are enabled. */
  remindersEnabled: boolean;
}

/** Default settings applied on first launch. */
export const DEFAULT_SETTINGS: Settings = {
  key: 'global',
  theme: 'system',
  weekStartsOn: 1,
  remindersEnabled: true,
};

/** Repository contract — implemented in the data layer. */
export interface ISettingsRepository {
  /** Load the current settings. Returns defaults if none stored yet. */
  getSettings(): Promise<Settings>;
  /** Merge a partial update and persist; returns the updated settings. */
  saveSettings(patch: Partial<Omit<Settings, 'key'>>): Promise<Settings>;
}
