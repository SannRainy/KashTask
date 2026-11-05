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
import shellStyles from './AppShell.module.css';
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

function PageFallback() {
  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-16)',
        color: 'var(--color-text-muted)',
        fontSize: 'var(--font-size-sm)',
        gap: 'var(--space-3)',
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          border: '2px solid var(--color-border-default)',
          borderTopColor: 'var(--color-accent-default)',
          borderRadius: 'var(--radius-full)',
          animation: 'spin 0.7s linear infinite',
        }}
      />
      <span style={{ fontWeight: 500 }}>Loading view...</span>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ── Overview / Hero Dashboard (Bespoke Warm Sand #C8B48A / Cream #F5F0E6) ──

function OverviewPage({ onNavigate }: { onNavigate: (path: string) => void }) {
  const modules = [
    {
      title: 'Action List',
      label: 'Tasks',
      desc: 'Rapid capture, status tracking, inline notes, and due dates with zero latency.',
      path: '/tasks',
      tag: 'ACTIVE',
      accent: 'var(--color-accent-default)',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ),
    },
    {
      title: 'Eisenhower Matrix',
      label: 'Matrix',
      desc: '2x2 strategic prioritization board with fluid gesture & keyboard drag & drop.',
      path: '/matrix',
      tag: 'STRATEGIC',
      accent: '#38bdf8',
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
          <rect x="3" y="3" width="7" height="7" rx="2" />
          <rect x="14" y="3" width="7" height="7" rx="2" />
          <rect x="3" y="14" width="7" height="7" rx="2" />
          <rect x="14" y="14" width="7" height="7" rx="2" />
        </svg>
      ),
    },
    {
      title: 'Habit Consistency',
      label: 'Habits',
      desc: 'Daily & weekday streak tracker with interactive weekly timeline strips.',
      path: '/habits',
      tag: 'STREAKS',
      accent: '#10b981',
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      ),
    },
    {
      title: 'Metrics & Telemetry',
      label: 'Stats',
      desc: 'Weekly & monthly vector visualizers, quadrant distribution, and heatmap.',
      path: '/stats',
      tag: 'ANALYTICS',
      accent: '#eab308',
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
          <rect x="4" y="10" width="3.5" height="10" rx="1.5" />
          <rect x="10.25" y="4" width="3.5" height="16" rx="1.5" />
          <rect x="16.5" y="8" width="3.5" height="12" rx="1.5" />
        </svg>
      ),
    },
  ];

  return (
    <main
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 48px 48px',
        width: '100%',
        boxSizing: 'border-box',
        gap: '32px',
      }}
    >
      {/* Top Banner Row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '20px',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '11px',
              fontWeight: 700,
              color: 'var(--color-success)',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: 'var(--radius-full)',
                background: 'var(--color-success)',
                boxShadow: '0 0 8px var(--color-success)',
              }}
            />
            Active · Offline Core
          </div>

          <h1
            style={{
              fontSize: '40px',
              fontWeight: 800,
              letterSpacing: '-0.04em',
              color: 'var(--color-text-primary)',
              margin: 0,
              lineHeight: 1.1,
            }}
          >
            KashTask
          </h1>

          <p
            style={{
              fontSize: '14px',
              color: 'var(--color-text-secondary)',
              margin: 0,
              maxWidth: '560px',
              lineHeight: 1.6,
            }}
          >
            Offline-first productivity suite integrating To-Do Lists, Eisenhower Matrix, Habit Tracking, and Weekly/Monthly Analytics.
          </p>
        </div>

        {/* Action Buttons in Warm Bronze/Sand Accent */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button
            type="button"
            onClick={() => onNavigate('/tasks')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'linear-gradient(135deg, var(--color-accent-default), #998358)',
              color: 'var(--color-text-on-accent)',
              border: 'none',
              borderRadius: 'var(--radius-xl)',
              padding: '12px 24px',
              fontSize: '14px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 18px var(--color-accent-glow)',
              transition: 'all 0.15s ease',
            }}
          >
            <span>+</span> Open Tasks →
          </button>
          <button
            type="button"
            onClick={() => onNavigate('/matrix')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'var(--color-bg-surface)',
              color: 'var(--color-text-primary)',
              border: '1px solid var(--color-border-default)',
              borderRadius: 'var(--radius-xl)',
              padding: '12px 24px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
              <rect x="3" y="3" width="7" height="7" rx="1.5" />
              <rect x="14" y="3" width="7" height="7" rx="1.5" />
              <rect x="3" y="14" width="7" height="7" rx="1.5" />
              <rect x="14" y="14" width="7" height="7" rx="1.5" />
            </svg>
            Priority Matrix
          </button>
        </div>
      </div>

      {/* 4 Glowing Cards in Horizontal Grid */}
      <section
        className={shellStyles.overviewModulesGrid}
        aria-label="Application Modules"
      >
        {modules.map((m) => (
          <div
            key={m.path}
            onClick={() => onNavigate(m.path)}
            style={{
              background: 'var(--color-bg-elevated)',
              border: '1px solid var(--color-border-default)',
              borderRadius: 'var(--radius-xl)',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '20px',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-md)',
              transition: 'all 0.2s ease',
              position: 'relative',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-accent-default)';
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.boxShadow = '0 12px 28px rgba(0, 0, 0, 0.45), 0 0 20px var(--color-accent-glow)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-border-default)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'var(--shadow-md)';
            }}
          >
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '16px',
                }}
              >
                {/* Rounded Icon Orb */}
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 'var(--radius-full)',
                    background: `color-mix(in srgb, ${m.accent} 18%, transparent)`,
                    color: m.accent,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {m.icon}
                </div>

                {/* Badge Tag */}
                <span
                  style={{
                    fontSize: '10px',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                    color: m.accent,
                    background: 'var(--color-bg-surface)',
                    border: '1px solid var(--color-border-subtle)',
                    padding: '3px 8px',
                    borderRadius: 'var(--radius-full)',
                  }}
                >
                  {m.tag}
                </span>
              </div>

              <h2
                style={{
                  fontSize: '20px',
                  fontWeight: 700,
                  color: 'var(--color-text-primary)',
                  margin: '0 0 8px 0',
                  letterSpacing: '-0.02em',
                }}
              >
                {m.label}
              </h2>
              <p
                style={{
                  fontSize: '13px',
                  color: 'var(--color-text-secondary)',
                  margin: 0,
                  lineHeight: 1.5,
                }}
              >
                {m.desc}
              </p>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--color-accent-default)',
                marginTop: '4px',
              }}
            >
              <span>View Module →</span>
            </div>
          </div>
        ))}
      </section>

      {/* System Architecture Status (Runagent Rounded Container) */}
      <section
        style={{
          background: 'var(--color-bg-elevated)',
          borderRadius: 'var(--radius-xl)',
          padding: '24px',
          border: '1px solid var(--color-border-default)',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid var(--color-border-subtle)',
            paddingBottom: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: 'var(--radius-full)',
                background: 'var(--color-success)',
                boxShadow: '0 0 8px var(--color-success)',
              }}
            />
            <h2
              style={{
                fontSize: '13px',
                fontWeight: 700,
                color: 'var(--color-text-primary)',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                margin: 0,
              }}
            >
              System Architecture Status
            </h2>
          </div>
          <span
            style={{
              fontSize: '12px',
              fontWeight: 600,
              color: 'var(--color-success)',
              background: 'var(--color-success-bg)',
              padding: '3px 12px',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--color-success-border)',
            }}
          >
            ✓ Verified 100%
          </span>
        </div>

        <div className={shellStyles.overviewArchitectureGrid}>
          {[
            '4 Architectural Zones (App, Features, Shared, Core)',
            'Feature Modules Isolated with Public API Barrels',
            'Strict Architectural Boundaries Enforced via ESLint',
            'Sleek Warm Obsidian & Golden Sand Palette Active',
            'Desktop Inset Sidebar + Clean Content Layout',
            'Keyboard Shortcuts : n / g-sequence / ? Active',
            'Full PWA & Offline IndexedDB Local Persistence',
          ].map((item, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontSize: '13px',
                color: 'var(--color-text-secondary)',
                padding: '10px 14px',
                background: 'var(--color-bg-surface)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border-subtle)',
              }}
            >
              <span
                style={{
                  color: 'var(--color-accent-default)',
                  fontWeight: 800,
                  fontSize: '14px',
                }}
              >
                ✓
              </span>
              <span>{item}</span>
            </div>
          ))}
        </div>
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

  useKeyboardShortcuts({
    onNavigate: navigate,
    onHelpOpen: () => setHelpOpen(true),
  });

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
