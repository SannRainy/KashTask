/**
 * useSettings — logic layer.
 *
 * Zustand store that owns Settings state and coordinates with the repository.
 * The UI layer imports this hook; the data layer is wired via initSettings().
 */
import { create } from 'zustand';
import type { ThemeMode } from '@core/theme';
import type { ISettingsRepository, Settings } from '../models/settings';
import { DEFAULT_SETTINGS } from '../models/settings';

interface SettingsState {
  settings: Settings;
  /** Whether the initial load has completed. */
  loaded: boolean;
  /** Set the full settings object (used after initial load). */
  _setSettings: (settings: Settings) => void;
  /** Update theme preference and persist via repository. */
  setTheme: (theme: ThemeMode) => Promise<void>;
  /** Update weekStartsOn and persist via repository. */
  setWeekStartsOn: (day: 0 | 1) => Promise<void>;
  /** Update remindersEnabled and persist via repository. */
  setRemindersEnabled: (enabled: boolean) => Promise<void>;
}

/** Module-level repository reference — set by initSettings(). */
let _repo: ISettingsRepository | null = null;

export const useSettingsStore = create<SettingsState>()((set) => ({
  settings: { ...DEFAULT_SETTINGS },
  loaded: false,

  _setSettings(settings) {
    set({ settings, loaded: true });
  },

  async setTheme(theme) {
    const repo = _repo;
    if (!repo) return;
    const updated = await repo.saveSettings({ theme });
    set({ settings: updated });
  },

  async setWeekStartsOn(weekStartsOn) {
    const repo = _repo;
    if (!repo) return;
    const updated = await repo.saveSettings({ weekStartsOn });
    set({ settings: updated });
  },

  async setRemindersEnabled(remindersEnabled) {
    const repo = _repo;
    if (!repo) return;
    const updated = await repo.saveSettings({ remindersEnabled });
    set({ settings: updated });
  },
}));

/**
 * Initialise the settings store with a repository.
 * Must be called once during app bootstrap (before any component reads settings).
 */
export async function initSettings(repo: ISettingsRepository): Promise<void> {
  _repo = repo;
  const settings = await repo.getSettings();
  useSettingsStore.getState()._setSettings(settings);
}

/**
 * Convenience hook — returns the settings slice components care about most.
 */
export function useSettings() {
  const { settings, loaded, setTheme, setWeekStartsOn, setRemindersEnabled } =
    useSettingsStore();
  return {
    settings,
    loaded,
    theme: settings.theme,
    weekStartsOn: settings.weekStartsOn,
    remindersEnabled: settings.remindersEnabled,
    setTheme,
    setWeekStartsOn,
    setRemindersEnabled,
  };
}
