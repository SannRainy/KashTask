import { StorageManager } from '../types';

export interface MigrationContext {
  manager: StorageManager;
  currentVersion: number;
  targetVersion: number;
}

export interface Migration {
  version: number;
  name: string;
  description?: string;
  up: (context: MigrationContext) => Promise<void>;
}

