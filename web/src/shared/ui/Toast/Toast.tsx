/**
 * Toast — self-contained notification with auto-dismiss and manual close.
 *
 * Also exports ToastContainer for rendering a stack of toasts,
 * and useToast hook for imperative toast creation.
 */
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import ReactDOM from 'react-dom';
import styles from './Toast.module.css';

// ─── Types ────────────────────────────────────────────────────────────────────

export type ToastVariant = 'info' | 'success' | 'error' | 'warning';

export interface ToastItem {
  id: string;
  message: React.ReactNode;
  variant: ToastVariant;
  /** Auto-dismiss delay in ms. 0 = no auto-dismiss. Default: 4000. */
  duration?: number;
}

// ─── Icons ───────────────────────────────────────────────────────────────────

function ToastIcon({ variant }: { variant: ToastVariant }) {
  const paths: Record<ToastVariant, React.ReactNode> = {
    info: (
      <path
        d="M12 16v-4m0-4h.01M22 12c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2s10 4.477 10 10z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    ),
    success: (
      <path
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
    error: (
      <path
        d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
    warning: (
      <path
        d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  };

  return (
    <svg
      className={styles.icon}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      {paths[variant]}
    </svg>
  );
}

// ─── Single Toast item ────────────────────────────────────────────────────────

export interface ToastProps {
  item: ToastItem;
  onDismiss: (id: string) => void;
}

export function Toast({ item, onDismiss }: ToastProps) {
  const { id, message, variant, duration = 4000 } = item;
  const dismiss = useCallback(() => onDismiss(id), [id, onDismiss]);

  // Auto-dismiss timer
  useEffect(() => {
    if (duration <= 0) return;
    const timer = setTimeout(dismiss, duration);
    return () => clearTimeout(timer);
  }, [dismiss, duration]);

  return (
    <div
      role="alert"
      aria-live="polite"
      className={[styles.toast, styles[variant]].join(' ')}
    >
      <ToastIcon variant={variant} />
      <span className={styles.message}>{message}</span>
      <button
        type="button"
        className={styles.dismissButton}
        onClick={dismiss}
        aria-label="Dismiss notification"
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M9 3L3 9M3 3L9 9"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </div>
  );
}

// ─── Context + Provider ───────────────────────────────────────────────────────

interface ToastContextValue {
  addToast: (
    message: React.ReactNode,
    variant?: ToastVariant,
    duration?: number
  ) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const counterRef = useRef(0);

  const addToast = useCallback(
    (
      message: React.ReactNode,
      variant: ToastVariant = 'info',
      duration = 4000
    ) => {
      const id = `toast-${++counterRef.current}`;
      setToasts((prev) => [...prev, { id, message, variant, duration }]);
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      {ReactDOM.createPortal(
        <div className={styles.container} aria-label="Notifications">
          {toasts.map((item) => (
            <Toast key={item.id} item={item} onDismiss={removeToast} />
          ))}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used inside <ToastProvider>');
  }
  return ctx;
}

// Re-export a no-op for environments without a provider (dev convenience)
export function useToastSafe(): ToastContextValue {
  return (
    useContext(ToastContext) ?? {
      addToast: () => undefined,
      removeToast: () => undefined,
    }
  );
}
