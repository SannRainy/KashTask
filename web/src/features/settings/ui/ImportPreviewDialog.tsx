/**
 * ImportPreviewDialog — shows counts and merge/replace choice before writing.
 */
import { useState } from 'react';
import { Dialog } from '@shared/ui/Dialog';
import { Button } from '@shared/ui/Button';
import type { ExportFile } from '../logic/dataPortability';
import type { ImportMode } from '../logic/useDataPortability';
import styles from './dialogs.module.css';

export interface ImportPreviewDialogProps {
  open: boolean;
  data: ExportFile | null;
  loading: boolean;
  onConfirm: (mode: ImportMode) => void;
  onClose: () => void;
}

export function ImportPreviewDialog({
  open,
  data,
  loading,
  onConfirm,
  onClose,
}: ImportPreviewDialogProps) {
  const [mode, setMode] = useState<ImportMode>('replace');

  if (!data) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Import Data Preview"
      maxWidth={520}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={() => onConfirm(mode)}
            disabled={loading}
          >
            {loading ? 'Importing…' : 'Import'}
          </Button>
        </>
      }
    >
      <p
        style={{
          fontSize: 'var(--font-size-sm)',
          color: 'var(--color-text-secondary)',
          marginBottom: 'var(--space-4)',
        }}
      >
        The file contains the following data. Choose how to handle existing
        records.
      </p>

      <div className={styles.previewGrid}>
        <div className={styles.previewCard}>
          <span className={styles.previewCount}>{data.tasks.length}</span>
          <span className={styles.previewLabel}>Tasks</span>
        </div>
        <div className={styles.previewCard}>
          <span className={styles.previewCount}>{data.habits.length}</span>
          <span className={styles.previewLabel}>Habits</span>
        </div>
        <div className={styles.previewCard}>
          <span className={styles.previewCount}>{data.habitLogs.length}</span>
          <span className={styles.previewLabel}>Habit Logs</span>
        </div>
        <div className={styles.previewCard}>
          <span className={styles.previewCount}>1</span>
          <span className={styles.previewLabel}>Settings</span>
        </div>
      </div>

      <div
        className={styles.modeGroup}
        role="radiogroup"
        aria-label="Import mode"
      >
        <label
          className={`${styles.modeOption} ${mode === 'replace' ? styles.selected : ''}`}
        >
          <input
            type="radio"
            name="import-mode"
            value="replace"
            checked={mode === 'replace'}
            onChange={() => setMode('replace')}
            className={styles.modeRadio}
          />
          <div>
            <div className={styles.modeTitle}>Replace all data</div>
            <div className={styles.modeDesc}>
              Erases all existing tasks, habits and logs, then imports the file.
            </div>
          </div>
        </label>

        <label
          className={`${styles.modeOption} ${mode === 'merge' ? styles.selected : ''}`}
        >
          <input
            type="radio"
            name="import-mode"
            value="merge"
            checked={mode === 'merge'}
            onChange={() => setMode('merge')}
            className={styles.modeRadio}
          />
          <div>
            <div className={styles.modeTitle}>Merge</div>
            <div className={styles.modeDesc}>
              Adds and updates records from the file; existing records not in
              the file are kept.
            </div>
          </div>
        </label>
      </div>
    </Dialog>
  );
}
