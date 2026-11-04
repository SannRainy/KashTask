/**
 * ComponentsPage — dev-only catalogue of all shared/ui components.
 * Only available in development mode (import.meta.env.DEV).
 * Route: /dev/components
 */
import { useState } from 'react';
import { Button } from '@shared/ui/Button';
import { IconButton } from '@shared/ui/IconButton';
import { Checkbox } from '@shared/ui/Checkbox';
import { Input } from '@shared/ui/Input';
import { Dialog } from '@shared/ui/Dialog';
import { ToastProvider, useToast } from '@shared/ui/Toast';
import { EmptyState } from '@shared/ui/EmptyState';
import { ThemeToggle } from '@shared/ui/ThemeToggle';
import { useTheme } from '../providers/ThemeProvider';
import styles from './ComponentsPage.module.css';

// ─── Toast demo (requires ToastProvider) ─────────────────────────────────────

function ToastDemo() {
  const { addToast } = useToast();
  return (
    <div className={styles.row}>
      <Button
        size="sm"
        variant="primary"
        onClick={() => addToast('Info notification', 'info')}
      >
        Info toast
      </Button>
      <Button
        size="sm"
        variant="secondary"
        onClick={() => addToast('Task saved!', 'success')}
      >
        Success toast
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => addToast('Something went wrong', 'error')}
      >
        Error toast
      </Button>
      <Button
        size="sm"
        variant="danger"
        onClick={() => addToast('Low storage space', 'warning')}
      >
        Warning toast
      </Button>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export function ComponentsPage() {
  const { mode, resolvedTheme, setMode } = useTheme();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [checkA, setCheckA] = useState(false);
  const [checkB, setCheckB] = useState(true);
  const [inputValue, setInputValue] = useState('');

  return (
    <ToastProvider>
      <div className={styles.page}>
        {/* ── Header ── */}
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Component Catalogue</h1>
          </div>
          <div className={styles.row}>
            <span className={styles.badge}>DEV ONLY</span>
            <ThemeToggle
              mode={mode}
              resolvedTheme={resolvedTheme}
              onModeChange={setMode}
              showLabel
            />
          </div>
        </div>

        <div className={styles.sections}>
          {/* ── Buttons ── */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Button</h2>
            <div className={styles.card}>
              <div className={styles.row}>
                <Button variant="primary">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="danger">Danger</Button>
              </div>
              <div className={styles.row}>
                <Button size="sm">Small</Button>
                <Button size="md">Medium</Button>
                <Button size="lg">Large</Button>
              </div>
              <div className={styles.row}>
                <Button loading>Loading…</Button>
                <Button disabled>Disabled</Button>
              </div>
            </div>
          </section>

          {/* ── IconButton ── */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>IconButton</h2>
            <div className={styles.card}>
              <div className={styles.row}>
                {(['sm', 'md', 'lg'] as const).map((size) => (
                  <IconButton
                    key={size}
                    size={size}
                    aria-label={`Icon button ${size}`}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M12 5v14M5 12h14"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  </IconButton>
                ))}
              </div>
            </div>
          </section>

          {/* ── Checkbox ── */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Checkbox</h2>
            <div className={styles.card}>
              <div className={styles.row}>
                <Checkbox
                  label="Unchecked"
                  checked={checkA}
                  onChange={(e) => setCheckA(e.target.checked)}
                />
                <Checkbox
                  label="Checked"
                  checked={checkB}
                  onChange={(e) => setCheckB(e.target.checked)}
                />
                <Checkbox label="Disabled unchecked" disabled />
                <Checkbox label="Disabled checked" disabled checked readOnly />
              </div>
            </div>
          </section>

          {/* ── Input ── */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Input</h2>
            <div className={styles.card}>
              <Input
                label="Task title"
                placeholder="Enter task…"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                helperText="Up to 120 characters."
              />
              <Input
                label="Due date"
                type="date"
                error="Due date cannot be in the past"
              />
              <Input label="Disabled" disabled placeholder="Cannot edit" />
            </div>
          </section>

          {/* ── Dialog ── */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Dialog</h2>
            <div className={styles.card}>
              <div className={styles.row}>
                <Button onClick={() => setDialogOpen(true)}>Open Dialog</Button>
              </div>
              <Dialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                title="Confirm action"
                footer={
                  <>
                    <Button
                      variant="secondary"
                      onClick={() => setDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      onClick={() => setDialogOpen(false)}
                    >
                      Confirm
                    </Button>
                  </>
                }
              >
                <p
                  style={{
                    color: 'var(--color-text-secondary)',
                    fontSize: 'var(--font-size-sm)',
                  }}
                >
                  This dialog has a focus trap — Tab cycles through focusable
                  elements inside it. Press Escape or click the backdrop to
                  close.
                </p>
              </Dialog>
            </div>
          </section>

          {/* ── Toast ── */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Toast</h2>
            <div className={styles.card}>
              <ToastDemo />
            </div>
          </section>

          {/* ── EmptyState ── */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>EmptyState</h2>
            <div className={styles.card}>
              <EmptyState
                icon="📋"
                title="No tasks yet"
                description="Create your first task to get started with the Eisenhower Matrix."
                action={<Button size="sm">Add Task</Button>}
              />
            </div>
          </section>

          {/* ── Quadrant colours ── */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Quadrant Colours</h2>
            <div className={styles.quadrantGrid}>
              <div className={`${styles.quadrantCell} ${styles.quadrantDo}`}>
                DO — Urgent + Important
              </div>
              <div
                className={`${styles.quadrantCell} ${styles.quadrantSchedule}`}
              >
                SCHEDULE — Important only
              </div>
              <div
                className={`${styles.quadrantCell} ${styles.quadrantDelegate}`}
              >
                DELEGATE — Urgent only
              </div>
              <div
                className={`${styles.quadrantCell} ${styles.quadrantEliminate}`}
              >
                ELIMINATE — Neither
              </div>
            </div>
          </section>
        </div>
      </div>
    </ToastProvider>
  );
}
