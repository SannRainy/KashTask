export type StorageErrorCode =
  | 'quota_exceeded'
  | 'database_blocked'
  | 'storage_unavailable'
  | 'version_error'
  | 'operation_failed';

export class StorageError extends Error {
  readonly code: StorageErrorCode;
  readonly originalError?: unknown;

  constructor(
    message: string,
    code: StorageErrorCode = 'operation_failed',
    originalError?: unknown
  ) {
    super(message);
    this.name = 'StorageError';
    this.code = code;
    this.originalError = originalError;

    // Maintain proper prototype chain in ES5/ES6 environments
    Object.setPrototypeOf(this, new.target.prototype);
  }

  /**
   * Wrap any unknown error into a normalized StorageError.
   */
  static from(
    error: unknown,
    fallbackMessage = 'Storage operation failed'
  ): StorageError {
    if (error instanceof StorageError) {
      return error;
    }

    if (error instanceof DOMException) {
      if (
        error.name === 'QuotaExceededError' ||
        error.code === 22 ||
        error.name === 'NS_ERROR_DOM_QUOTA_REACHED'
      ) {
        return new StorageError(
          'Storage quota exceeded. Please free up space or export your data.',
          'quota_exceeded',
          error
        );
      }

      if (error.name === 'VersionError') {
        return new StorageError(
          `Database version error: ${error.message}`,
          'version_error',
          error
        );
      }

      if (error.name === 'SecurityError') {
        return new StorageError(
          'Storage access is restricted (e.g. cookies or private mode disabled).',
          'storage_unavailable',
          error
        );
      }
    }

    const message = error instanceof Error ? error.message : String(error);

    if (/blocked/i.test(message)) {
      return new StorageError(
        'Database connection is blocked by another tab or process.',
        'database_blocked',
        error
      );
    }

    if (/quota/i.test(message)) {
      return new StorageError(
        'Storage quota exceeded.',
        'quota_exceeded',
        error
      );
    }

    return new StorageError(
      message.length > 0 ? message : fallbackMessage,
      'operation_failed',
      error
    );
  }
}
