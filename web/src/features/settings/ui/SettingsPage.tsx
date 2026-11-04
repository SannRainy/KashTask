/**
 * SettingsPage — settings UI featuring appearance and data management sections.
 *
 * Layer: ui — imports from logic only (no data layer imports).
 */
import React, { useRef, useState } from 'react';
import { Button } from '@shared/ui/Button';
import { useToastSafe } from '@shared/ui/Toast';

import { useSettings } from '../logic/useSettings';
import {
  useExportData,
  readImportFile,
  applyImport,
  deleteAllData,
} from '../logic/useDataPortability';
import type { ExportFile } from '../logic/dataPortability';
import type { ImportMode } from '../logic/useDataPortability';
import { ImportPreviewDialog } from './ImportPreviewDialog';
import { DeleteConfirmDialog } from './DeleteConfirmDialog';
import styles from './SettingsPage.module.css';

export function SettingsPage() {
  const { theme, weekStartsOn, setTheme, setWeekStartsOn } = useSettings();
  const exportData = useExportData();
  const toast = useToastSafe();

  // Import state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importData, setImportData] = useState<ExportFile | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  // Delete state
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // -------------------------------------------------------------------------
  // Export
  // -------------------------------------------------------------------------
  const handleExport = async () => {
    const result = await exportData();
    if (result.ok) {
      toast.addToast('Data exported successfully.', 'success');
    } else {
      toast.addToast(result.error, 'error');
    }
  };

  // -------------------------------------------------------------------------
  // Import
  // -------------------------------------------------------------------------
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!e.target.files) return;
    // Reset input so the same file can be re-selected
    e.target.value = '';
    if (!file) return;

    setImportError(null);
    const result = await readImportFile(file);
    if (!result.ok) {
      setImportError(result.error);
      toast.addToast(result.error, 'error', 8000);
      return;
    }

    setImportData(result.data);
    setImportOpen(true);
  };

  const handleImportConfirm = async (mode: ImportMode) => {
    if (!importData) return;
    setImportLoading(true);
    const result = await applyImport(importData, mode);
    setImportLoading(false);

    if (result.ok) {
      setImportOpen(false);
      setImportData(null);
      toast.addToast('Data imported successfully.', 'success');
    } else {
      toast.addToast(result.error, 'error', 8000);
    }
  };

  const handleImportClose = () => {
    setImportOpen(false);
    setImportData(null);
  };

  // -------------------------------------------------------------------------
  // Delete all
  // -------------------------------------------------------------------------
  const handleDeleteConfirm = async () => {
    setDeleteLoading(true);
    const result = await deleteAllData();
    setDeleteLoading(false);

    if (result.ok) {
      setDeleteOpen(false);
      toast.addToast('All data deleted.', 'success');
    } else {
      toast.addToast(result.error, 'error');
    }
  };

  return (
    <main className={styles.page}>
      <h1 className={styles.pageTitle}>Settings</h1>

      {/* ------------------------------------------------------------------ */}
      {/* Appearance                                                           */}
      {/* ------------------------------------------------------------------ */}
      <section className={styles.section} aria-labelledby="section-appearance">
        <h2 className={styles.sectionTitle} id="section-appearance">
          Appearance
        </h2>

        <div className={styles.row}>
          <div className={styles.rowLabel}>
            <span className={styles.rowLabelText}>Theme</span>
            <span className={styles.rowLabelDescription}>
              Choose light, dark, or follow your system preference.
            </span>
          </div>
          <div
            className={styles.segmentGroup}
            role="group"
            aria-label="Theme mode"
          >
            {(['system', 'light', 'dark'] as const).map((m) => (
              <button
                key={m}
                type="button"
                className={`${styles.segmentBtn}${theme === m ? ` ${styles.active}` : ''}`}
                aria-pressed={theme === m}
                onClick={() => setTheme(m)}
              >
                {m.charAt(0).toUpperCase() + m.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.row}>
          <div className={styles.rowLabel}>
            <span className={styles.rowLabelText}>Week starts on</span>
            <span className={styles.rowLabelDescription}>
              Affects the stats and matrix week view.
            </span>
          </div>
          <div
            className={styles.segmentGroup}
            role="group"
            aria-label="Week start day"
          >
            <button
              type="button"
              className={`${styles.segmentBtn}${weekStartsOn === 1 ? ` ${styles.active}` : ''}`}
              aria-pressed={weekStartsOn === 1}
              onClick={() => setWeekStartsOn(1)}
            >
              Monday
            </button>
            <button
              type="button"
              className={`${styles.segmentBtn}${weekStartsOn === 0 ? ` ${styles.active}` : ''}`}
              aria-pressed={weekStartsOn === 0}
              onClick={() => setWeekStartsOn(0)}
            >
              Sunday
            </button>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Data Management                                                      */}
      {/* ------------------------------------------------------------------ */}
      <section className={styles.section} aria-labelledby="section-data">
        <h2 className={styles.sectionTitle} id="section-data">
          Data Management
        </h2>

        {/* Export */}
        <div className={styles.dataRow}>
          <span className={styles.dataRowTitle}>Export data</span>
          <span className={styles.dataRowDesc}>
            Download all your tasks, habits, habit logs, and settings as a JSON
            file.
          </span>
          <Button variant="secondary" size="sm" onClick={handleExport}>
            Export JSON
          </Button>
        </div>

        {/* Import */}
        <div className={styles.dataRow}>
          <span className={styles.dataRowTitle}>Import data</span>
          <span className={styles.dataRowDesc}>
            Restore from a KashTask export file. You can preview the data before
            committing.
          </span>
          {importError && (
            <p
              role="alert"
              style={{
                fontSize: 'var(--font-size-xs)',
                color: 'var(--color-quadrant-eliminate, #ef4444)',
                marginBottom: 'var(--space-1)',
              }}
            >
              {importError}
            </p>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            className={styles.hiddenInput}
            aria-hidden="true"
            onChange={handleFileChange}
          />
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setImportError(null);
              fileInputRef.current?.click();
            }}
          >
            Import JSON…
          </Button>
        </div>

        {/* Danger zone */}
        <div className={styles.dangerZone}>
          <p className={styles.dangerTitle}>Danger Zone</p>
          <p className={styles.dangerDesc}>
            Permanently delete all tasks, habits, habit logs, and settings from
            this device. This cannot be undone.
          </p>
          <Button
            variant="danger"
            size="sm"
            onClick={() => setDeleteOpen(true)}
          >
            Delete All Data
          </Button>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Dialogs                                                              */}
      {/* ------------------------------------------------------------------ */}
      <ImportPreviewDialog
        open={importOpen}
        data={importData}
        loading={importLoading}
        onConfirm={handleImportConfirm}
        onClose={handleImportClose}
      />

      <DeleteConfirmDialog
        open={deleteOpen}
        loading={deleteLoading}
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeleteOpen(false)}
      />
    </main>
  );
}
