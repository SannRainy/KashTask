/**
 * UpdatePrompt — shows a banner when a new service worker version is available.
 *
 * Uses the virtual module provided by vite-plugin-pwa to access
 * the registration result without directly coupling to the SW lifecycle.
 */
import { useEffect, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

export function UpdatePrompt() {
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(registration) {
      // Poll for updates every hour
      if (registration) {
        setInterval(
          () => {
            registration.update().catch(console.warn);
          },
          60 * 60 * 1000
        );
      }
    },
    onRegisterError(error) {
      console.warn('Service Worker registration error:', error);
    },
  });

  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (needRefresh) setDismissed(false);
  }, [needRefresh]);

  if (!needRefresh || dismissed) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed',
        bottom: 'calc(env(safe-area-inset-bottom, 0px) + 80px)',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-3)',
        background: 'var(--color-bg-elevated)',
        border: '1px solid var(--color-border-default)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-lg)',
        padding: 'var(--space-3) var(--space-5)',
        fontSize: 'var(--font-size-sm)',
        color: 'var(--color-text-primary)',
        whiteSpace: 'nowrap',
      }}
    >
      <span>🔄 Update available</span>
      <button
        type="button"
        onClick={() => updateServiceWorker(true)}
        style={{
          background: 'var(--color-accent-default)',
          color: 'var(--color-text-on-accent)',
          border: 'none',
          borderRadius: 'var(--radius-md)',
          padding: 'var(--space-1) var(--space-3)',
          fontSize: 'var(--font-size-xs)',
          fontWeight: 'var(--font-weight-semibold)',
          cursor: 'pointer',
        }}
      >
        Reload
      </button>
      <button
        type="button"
        aria-label="Dismiss update notification"
        onClick={() => setDismissed(true)}
        style={{
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--color-text-muted)',
          fontSize: 'var(--font-size-base)',
          padding: 'var(--space-1)',
          lineHeight: 1,
        }}
      >
        ✕
      </button>
    </div>
  );
}
