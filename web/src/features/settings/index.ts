// settings feature — public API barrel
// Only symbols exported here are accessible from outside this feature.

export type { Settings, ISettingsRepository } from './models/settings';
export { DEFAULT_SETTINGS } from './models/settings';
export { SettingsRepository } from './data/settingsRepository';
export {
  useSettings,
  useSettingsStore,
  initSettings,
} from './logic/useSettings';
