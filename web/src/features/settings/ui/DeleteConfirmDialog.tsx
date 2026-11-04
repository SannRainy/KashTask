/**
 * DeleteConfirmDialog — requires the user to type "DELETE" before wiping all data.
 */
import { useState } from 'react';
import { Dialog } from '@shared/ui/Dialog';
import { Button } from '@shared/ui/Button';
import { Input } from '@shared/ui/Input';
import styles from './dialogs.module.css';

export interface DeleteConfirmDialogProps {
  open: boolean;
  loading: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

const CONFIRM_WORD = 'DELETE';

export function DeleteConfirmDialog({
  open,
  loading,
  onConfirm,
  onClose,
}: DeleteConfirmDialogProps) {
  const [value, setValue] = useState('');
  const canConfirm = value === CONFIRM_WORD;

  const handleClose = () => {
    setValue('');
    onClose();
  };

  const handleConfirm = () => {
    if (!canConfirm) return;
    onConfirm();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      title="Delete All Data"
      maxWidth={440}
      footer={
        <>
          <Button variant="ghost" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleConfirm}
            disabled={!canConfirm || loading}
            style={{
              background: 'var(--color-quadrant-eliminate, #ef4444)',
              borderColor: 'transparent',
            }}
          >
            {loading ? 'Deleting…' : 'Delete Everything'}
          </Button>
        </>
      }
    >
      <div className={styles.confirmWarning}>
        ⚠️ This action cannot be undone. All tasks, habits, habit logs, and
        settings will be permanently erased from this device.
      </div>

      <div className={styles.confirmInput}>
        <Input
          label={`Type "${CONFIRM_WORD}" to confirm`}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={CONFIRM_WORD}
          autoComplete="off"
          spellCheck={false}
        />
      </div>
    </Dialog>
  );
}
