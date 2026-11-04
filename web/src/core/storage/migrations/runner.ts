import { StorageManager } from '../types';
import { StorageError } from '../error';
import { Migration, MigrationContext } from './types';

export interface MigrationResult {
  previousVersion: number;
  finalVersion: number;
  executed: Migration[];
}

/**
 * Executes sequential, versioned migrations against any StorageManager instance.
 */
export class MigrationRunner {
  private readonly manager: StorageManager;
  private readonly migrations: Migration[];

  constructor(manager: StorageManager, migrations: Migration[] = []) {
    this.manager = manager;
    // Ensure migrations are sorted in ascending version order
    this.migrations = [...migrations].sort((a, b) => a.version - b.version);
    this.validateMigrationDefinitions();
  }

  private validateMigrationDefinitions(): void {
    const seenVersions = new Set<number>();
    for (const m of this.migrations) {
      if (!Number.isInteger(m.version) || m.version <= 0) {
        throw new StorageError(
          `Invalid migration version ${m.version}. Versions must be positive integers.`,
          'version_error'
        );
      }
      if (seenVersions.has(m.version)) {
        throw new StorageError(
          `Duplicate migration version detected: ${m.version} (${m.name})`,
          'version_error'
        );
      }
      seenVersions.add(m.version);
    }
  }

  async getCurrentVersion(): Promise<number> {
    return await this.manager.getSchemaVersion();
  }

  /**
   * Run all pending migrations up to an optional target version.
   */
  async runMigrations(targetVersion?: number): Promise<MigrationResult> {
    const previousVersion = await this.getCurrentVersion();
    const maxAvailableVersion =
      this.migrations.length > 0
        ? this.migrations[this.migrations.length - 1].version
        : 0;

    const effectiveTarget =
      targetVersion !== undefined ? targetVersion : maxAvailableVersion;

    if (effectiveTarget < previousVersion) {
      throw new StorageError(
        `Target version (${effectiveTarget}) cannot be lower than current database version (${previousVersion}). Down migrations are not supported in production offline stores.`,
        'version_error'
      );
    }

    const pendingMigrations = this.migrations.filter(
      (m) => m.version > previousVersion && m.version <= effectiveTarget
    );

    const executed: Migration[] = [];

    for (const migration of pendingMigrations) {
      const context: MigrationContext = {
        manager: this.manager,
        currentVersion: await this.manager.getSchemaVersion(),
        targetVersion: migration.version,
      };

      try {
        await migration.up(context);
        await this.manager.setSchemaVersion(migration.version);
        executed.push(migration);
      } catch (error) {
        const failedVersion = migration.version;
        throw StorageError.from(
          error,
          `Migration failed at version ${failedVersion} (${migration.name}): ${
            error instanceof Error ? error.message : String(error)
          }`
        );
      }
    }

    const finalVersion = await this.getCurrentVersion();

    return {
      previousVersion,
      finalVersion,
      executed,
    };
  }
}

