import React, { useCallback, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import styles from './Dialog.module.css';

const FOCUSABLE_SELECTORS = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

export interface DialogProps {
  /** Whether the dialog is open. */
  open: boolean;
  /** Callback when the dialog should be closed (ESC or backdrop click). */
  onClose: () => void;
  /** Dialog title displayed in the header. */
  title: string;
  /** Optional footer content (e.g. action buttons). */
  footer?: React.ReactNode;
  children: React.ReactNode;
  /** Maximum width override (default 480px). */
  maxWidth?: string | number;
}

export function Dialog({
  open,
  onClose,
  title,
  footer,
  children,
  maxWidth,
}: DialogProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Focus trap
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key !== 'Tab') return;

      const panel = panelRef.current;
      if (!panel) return;

      const focusable = Array.from(
        panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS)
      ).filter((el) => !el.closest('[inert]'));

      if (focusable.length === 0) {
        e.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    },
    [open, onClose]
  );

  useEffect(() => {
    if (!open) return;

    document.addEventListener('keydown', handleKeyDown);

    // Move focus into the dialog
    const panel = panelRef.current;
    if (panel) {
      const firstFocusable =
        panel.querySelector<HTMLElement>(FOCUSABLE_SELECTORS);
      firstFocusable?.focus();
    }

    // Prevent body scroll
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, handleKeyDown]);

  if (!open) return null;

  return ReactDOM.createPortal(
    <div
      className={styles.backdrop}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="presentation"
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        className={styles.panel}
        style={maxWidth ? { maxWidth } : undefined}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.header}>
          <h2 id="dialog-title" className={styles.title}>
            {title}
          </h2>
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close dialog"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M12 4L4 12M4 4L12 12"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
        <div className={styles.body}>{children}</div>
        {footer && <div className={styles.footer}>{footer}</div>}
      </div>
    </div>,
    document.body
  );
}
