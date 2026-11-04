/**
 * useKeyboardShortcuts — global keyboard shortcut handler for the app shell.
 *
 * Shortcuts:
 *   n           → trigger new task
 *   g then t    → navigate to /tasks
 *   g then m    → navigate to /matrix
 *   g then h    → navigate to /habits
 *   g then s    → navigate to /stats
 *   ?           → open keyboard help dialog
 *
 * Guards: shortcuts are skipped when focus is on an interactive text element.
 */
import { useEffect, useRef } from 'react';
import { useTaskStore } from '@features/tasks';

const TEXT_TARGETS = new Set(['INPUT', 'TEXTAREA', 'SELECT']);

function isFocusedOnText(): boolean {
  const el = document.activeElement;
  if (!el) return false;
  if (TEXT_TARGETS.has(el.tagName)) return true;
  if (el.getAttribute('contenteditable') === 'true') return true;
  return false;
}

interface UseKeyboardShortcutsOptions {
  onNavigate: (path: string) => void;
  onHelpOpen: () => void;
}

export function useKeyboardShortcuts({
  onNavigate,
  onHelpOpen,
}: UseKeyboardShortcutsOptions): void {
  const gModeRef = useRef(false);
  const gTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const clearGMode = () => {
      gModeRef.current = false;
      if (gTimerRef.current) {
        clearTimeout(gTimerRef.current);
        gTimerRef.current = null;
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip when modifier keys are held (browser shortcuts)
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      // Skip when focused in a text input
      if (isFocusedOnText()) return;

      const key = e.key;

      // ── g-mode navigation ─────────────────────────────────────────────
      if (gModeRef.current) {
        clearGMode();
        const routes: Record<string, string> = {
          t: '/tasks',
          m: '/matrix',
          h: '/habits',
          s: '/stats',
        };
        if (routes[key]) {
          e.preventDefault();
          onNavigate(routes[key]);
        }
        return;
      }

      // ── Single-key shortcuts ───────────────────────────────────────────
      switch (key) {
        case 'g': {
          e.preventDefault();
          gModeRef.current = true;
          // Auto-cancel g-mode after 1.5 s
          gTimerRef.current = setTimeout(clearGMode, 1500);
          break;
        }
        case 'n': {
          e.preventDefault();
          // Signal the task store to open new-task dialog via a custom event
          // (avoids prop drilling through the shell)
          useTaskStore.getState().setFilter('all');
          window.dispatchEvent(new CustomEvent('kashtask:new-task'));
          break;
        }
        case '?': {
          e.preventDefault();
          onHelpOpen();
          break;
        }
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearGMode();
    };
  }, [onNavigate, onHelpOpen]);
}
