/**
 * KeyboardHelpDialog — lists all global keyboard shortcuts.
 */
import React from 'react';
import { Dialog } from '@shared/ui/Dialog';

interface KeyboardHelpDialogProps {
  open: boolean;
  onClose: () => void;
}

const SHORTCUTS: { keys: string[]; description: string }[] = [
  { keys: ['n'], description: 'New task' },
  { keys: ['g', 't'], description: 'Go to Tasks' },
  { keys: ['g', 'm'], description: 'Go to Matrix' },
  { keys: ['g', 'h'], description: 'Go to Habits' },
  { keys: ['g', 's'], description: 'Go to Stats' },
  { keys: ['?'], description: 'Show this help' },
  { keys: ['Esc'], description: 'Close dialogs' },
];

export function KeyboardHelpDialog({ open, onClose }: KeyboardHelpDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Keyboard Shortcuts"
      maxWidth={400}
    >
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: 'var(--font-size-sm)',
        }}
      >
        <thead>
          <tr>
            <th
              style={{
                textAlign: 'left',
                paddingBottom: 'var(--space-2)',
                color: 'var(--color-text-muted)',
                fontWeight: 'var(--font-weight-medium)',
                fontSize: 'var(--font-size-xs)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                borderBottom: '1px solid var(--color-border-subtle)',
              }}
            >
              Key
            </th>
            <th
              style={{
                textAlign: 'left',
                paddingBottom: 'var(--space-2)',
                color: 'var(--color-text-muted)',
                fontWeight: 'var(--font-weight-medium)',
                fontSize: 'var(--font-size-xs)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                borderBottom: '1px solid var(--color-border-subtle)',
              }}
            >
              Action
            </th>
          </tr>
        </thead>
        <tbody>
          {SHORTCUTS.map((s) => (
            <tr
              key={s.keys.join('+')}
              style={{ borderBottom: '1px solid var(--color-border-subtle)' }}
            >
              <td
                style={{
                  padding: 'var(--space-3) var(--space-2) var(--space-3) 0',
                }}
              >
                <span
                  style={{
                    display: 'inline-flex',
                    gap: 'var(--space-1)',
                    alignItems: 'center',
                  }}
                >
                  {s.keys.map((k, i) => (
                    <React.Fragment key={i}>
                      <kbd
                        style={{
                          display: 'inline-block',
                          padding: '1px 6px',
                          background: 'var(--color-bg-secondary)',
                          border: '1px solid var(--color-border-default)',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: 'var(--font-size-xs)',
                          fontFamily: 'var(--font-mono, monospace)',
                          color: 'var(--color-text-primary)',
                          lineHeight: 1.6,
                        }}
                      >
                        {k}
                      </kbd>
                      {i < s.keys.length - 1 && (
                        <span
                          style={{
                            color: 'var(--color-text-muted)',
                            fontSize: 'var(--font-size-xs)',
                          }}
                        >
                          then
                        </span>
                      )}
                    </React.Fragment>
                  ))}
                </span>
              </td>
              <td
                style={{
                  padding: 'var(--space-3) 0',
                  color: 'var(--color-text-secondary)',
                }}
              >
                {s.description}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Dialog>
  );
}
