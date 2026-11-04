import React, { useEffect, useState } from 'react';
import { ThemeProvider } from './providers/ThemeProvider';
import { ToastProvider } from '@shared/ui/Toast';
import { createStorageManager } from '@core/storage';
import { TaskRepository, initTaskStore } from '@features/tasks';
import {
  HabitRepository,
  HabitLogRepository,
  initHabitStore,
} from '@features/habits';
import { SettingsRepository, initSettings } from '@features/settings';
import { AppShell } from './AppShell';
import { ErrorBoundary } from './ErrorBoundary';
import { NotFoundPage } from './NotFoundPage';
import { KeyboardHelpDialog } from './KeyboardHelpDialog';
import { UpdatePrompt } from './UpdatePrompt';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import './reset.css';
import '../core/theme/tokens.css';

// ── Lazy page imports ────────────────────────────────────────────────────────

const TasksPage = React.lazy(() =>
  import('@features/tasks').then((m) => ({ default: m.TasksPage }))
);

const MatrixPage = React.lazy(() =>
  import('@features/matrix').then((m) => ({ default: m.MatrixPage }))
);

const HabitsPage = React.lazy(() =>
  import('@features/habits').then((m) => ({ default: m.HabitsPage }))
);

const StatsPage = React.lazy(() =>
  import('@features/stats').then((m) => ({ default: m.StatsPage }))
);

const SettingsPage = React.lazy(() =>
  import('@features/settings').then((m) => ({ default: m.SettingsPage }))
);

const DevComponentsPage = import.meta.env.DEV
  ? React.lazy(() =>
      import('./dev/ComponentsPage').then((m) => ({
        default: m.ComponentsPage,
      }))
    )
  : null;

// ── Lazy fallback ────────────────────────────────────────────────────────────

function PageFallback() {
  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-8)',
        color: 'var(--color-text-muted)',
        fontSize: 'var(--font-size-sm)',
      }}
    >
      Loading…
    </div>
  );
}

// ── Overview / Home page (inline — stays fast) ───────────────────────────────

function OverviewPage({ onNavigate }: { onNavigate: (path: string) => void }) {
  const cards = [
    { label: 'Tasks', path: '/tasks', accent: false },
    { label: 'Matrix', path: '/matrix', accent: true },
    { label: 'Habits', path: '/habits', accent: false },
    { label: 'Stats', path: '/stats', accent: false },
  ];

  return (
    <main
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-8) var(--space-4)',
        textAlign: 'center',
        gap: 'var(--space-6)',
      }}
    >
      <header>
        <h1
          style={{
            fontSize: 'var(--font-size-3xl)',
            fontWeight: 'var(--font-weight-bold)',
            marginBottom: 'var(--space-3)',
            letterSpacing: '-0.025em',
            color: 'var(--color-text-primary)',
          }}
        >
          KashTask
        </h1>
        <p
          style={{
            fontSize: 'var(--font-size-lg)',
            color: 'var(--color-text-secondary)',
            maxWidth: '36rem',
            marginBottom: 'var(--space-6)',
          }}
        >
          Offline-first productivity suite integrating To-Do Lists, Eisenhower
          Matrix, Habit Tracking, and Weekly/Monthly Analytics.
        </p>
        <div
          style={{
            display: 'flex',
            gap: 'var(--space-3)',
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          {cards.map((c) => (
            <button
              key={c.path}
              type="button"
              onClick={() => onNavigate(c.path)}
              style={{
                backgroundColor: c.accent
                  ? 'var(--color-accent-default)'
                  : 'var(--color-bg-secondary)',
                color: c.accent
                  ? 'var(--color-text-on-accent)'
                  : 'var(--color-text-primary)',
                border: c.accent
                  ? 'none'
                  : '1px solid var(--color-border-default)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--space-2) var(--space-5)',
                fontSize: 'var(--font-size-sm)',
                fontWeight: 'var(--font-weight-semibold)',
                cursor: 'pointer',
              }}
            >
              {c.label} →
            </button>
          ))}
        </div>
      </header>

      <section
        style={{
          backgroundColor: 'var(--color-bg-elevated)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-6)',
          border: '1px solid var(--color-border-default)',
          boxShadow: 'var(--shadow-md)',
          maxWidth: '32rem',
          width: '100%',
          textAlign: 'left',
        }}
      >
        <h2
          style={{
            fontSize: 'var(--font-size-base)',
            fontWeight: 'var(--font-weight-semibold)',
            color: 'var(--color-accent-default)',
            marginBottom: 'var(--space-3)',
          }}
        >
          System Architecture Status
        </h2>
        <ul
          style={{
            listStylePosition: 'inside',
            color: 'var(--color-text-secondary)',
            fontSize: 'var(--font-size-sm)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-2)',
          }}
        >
          <li>
            4 Architectural Zones configured (App, Features, Shared, Core)
          </li>
          <li>Feature modules isolated with Public API barrels</li>
          <li>Strict architectural boundaries enforced via ESLint</li>
          <li>Design tokens + dark/light theme active</li>
          <li>Responsive shell: sidebar desktop / bottom nav mobile</li>
          <li>Keyboard shortcuts: n / g-sequence / ?</li>
          <li>Export &amp; Import JSON data portability</li>
        </ul>
      </section>
    </main>
  );
}

// ── Router ───────────────────────────────────────────────────────────────────

function AppContent() {
  const [currentPath, setCurrentPath] = useState(() =>
    typeof window !== 'undefined' ? window.location.pathname : '/'
  );
  const [helpOpen, setHelpOpen] = useState(false);

  // Bootstrap storage and hydrate all stores
  useEffect(() => {
    createStorageManager()
      .then(({ manager }) => {
        const taskRepo = new TaskRepository(manager);
        const habitRepo = new HabitRepository(manager);
        const logRepo = new HabitLogRepository(manager);
        const settingsRepo = new SettingsRepository(manager);

        return Promise.all([
          initTaskStore(taskRepo),
          initHabitStore(habitRepo, logRepo),
          initSettings(settingsRepo),
        ]);
      })
      .catch((err) => {
        console.error('Failed to initialize storage:', err);
      });

    const handlePopState = () => setCurrentPath(window.location.pathname);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
  };

  // Global keyboard shortcuts
  useKeyboardShortcuts({
    onNavigate: navigate,
    onHelpOpen: () => setHelpOpen(true),
  });

  // Determine which page to render
  const renderPage = () => {
    if (
      import.meta.env.DEV &&
      currentPath === '/dev/components' &&
      DevComponentsPage
    ) {
      return (
        <React.Suspense fallback={<PageFallback />}>
          <DevComponentsPage />
        </React.Suspense>
      );
    }

    switch (currentPath) {
      case '/':
        return <OverviewPage onNavigate={navigate} />;
      case '/tasks':
        return (
          <React.Suspense fallback={<PageFallback />}>
            <TasksPage />
          </React.Suspense>
        );
      case '/matrix':
        return (
          <React.Suspense fallback={<PageFallback />}>
            <MatrixPage />
          </React.Suspense>
        );
      case '/habits':
        return (
          <React.Suspense fallback={<PageFallback />}>
            <HabitsPage />
          </React.Suspense>
        );
      case '/stats':
        return (
          <React.Suspense fallback={<PageFallback />}>
            <StatsPage />
          </React.Suspense>
        );
      case '/settings':
        return (
          <React.Suspense fallback={<PageFallback />}>
            <SettingsPage />
          </React.Suspense>
        );
      default:
        return <NotFoundPage onNavigate={navigate} />;
    }
  };

  return (
    <AppShell currentPath={currentPath} onNavigate={navigate}>
      <ErrorBoundary>{renderPage()}</ErrorBoundary>
      <KeyboardHelpDialog open={helpOpen} onClose={() => setHelpOpen(false)} />
      <UpdatePrompt />
    </AppShell>
  );
}

export function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
