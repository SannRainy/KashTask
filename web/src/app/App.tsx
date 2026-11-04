import React, { useEffect, useState } from 'react';
import { ThemeProvider, useTheme } from './providers/ThemeProvider';
import { ThemeToggle } from '@shared/ui/ThemeToggle';
import { ToastProvider } from '@shared/ui/Toast';
import { createStorageManager } from '@core/storage';
import { TaskRepository, initTaskStore, TasksPage } from '@features/tasks';
import { MatrixPage } from '@features/matrix';
import './reset.css';
import '../core/theme/tokens.css';

// Lazy-load dev components page (only bundled in dev mode)
const DevComponentsPage = import.meta.env.DEV
  ? React.lazy(() =>
      import('./dev/ComponentsPage').then((m) => ({
        default: m.ComponentsPage,
      }))
    )
  : null;

function AppContent() {
  const { mode, resolvedTheme, setMode } = useTheme();
  const [currentPath, setCurrentPath] = useState(() =>
    typeof window !== 'undefined' ? window.location.pathname : '/'
  );

  useEffect(() => {
    // Bootstrap offline storage and hydrate task store
    createStorageManager()
      .then(({ manager }) => {
        const repo = new TaskRepository(manager);
        return initTaskStore(repo);
      })
      .catch((err) => {
        console.error('Failed to initialize storage:', err);
      });

    // Listen to browser popstate for back/forward navigation
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string, e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    window.history.pushState({}, '', path);
    setCurrentPath(path);
  };

  const isDevRoute = import.meta.env.DEV && currentPath === '/dev/components';
  const isTasksRoute = currentPath === '/tasks';
  const isMatrixRoute = currentPath === '/matrix';

  return (
    <div
      style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}
    >
      {/* Top Application Bar */}
      <nav
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 'var(--space-3) var(--space-6)',
          borderBottom: '1px solid var(--color-border-subtle)',
          backgroundColor: 'var(--color-bg-elevated)',
          position: 'sticky',
          top: 0,
          zIndex: 'var(--z-sticky)',
        }}
        aria-label="Main Navigation"
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-6)',
          }}
        >
          <a
            href="/"
            onClick={(e) => navigate('/', e)}
            style={{
              fontSize: 'var(--font-size-lg)',
              fontWeight: 'var(--font-weight-bold)',
              textDecoration: 'none',
              color: 'var(--color-text-primary)',
              letterSpacing: '-0.02em',
            }}
          >
            KashTask
          </a>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-4)',
            }}
          >
            <a
              href="/"
              onClick={(e) => navigate('/', e)}
              style={{
                fontSize: 'var(--font-size-sm)',
                fontWeight: currentPath === '/' ? 600 : 400,
                color:
                  currentPath === '/'
                    ? 'var(--color-accent-default)'
                    : 'var(--color-text-secondary)',
                textDecoration: 'none',
              }}
            >
              Overview
            </a>

            <a
              href="/tasks"
              onClick={(e) => navigate('/tasks', e)}
              style={{
                fontSize: 'var(--font-size-sm)',
                fontWeight: isTasksRoute ? 600 : 400,
                color: isTasksRoute
                  ? 'var(--color-accent-default)'
                  : 'var(--color-text-secondary)',
                textDecoration: 'none',
              }}
            >
              Tasks
            </a>

            <a
              href="/matrix"
              onClick={(e) => navigate('/matrix', e)}
              style={{
                fontSize: 'var(--font-size-sm)',
                fontWeight: isMatrixRoute ? 600 : 400,
                color: isMatrixRoute
                  ? 'var(--color-accent-default)'
                  : 'var(--color-text-secondary)',
                textDecoration: 'none',
              }}
            >
              Matrix
            </a>

            {import.meta.env.DEV && (
              <a
                href="/dev/components"
                onClick={(e) => navigate('/dev/components', e)}
                style={{
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: isDevRoute ? 600 : 400,
                  color: isDevRoute
                    ? 'var(--color-accent-default)'
                    : 'var(--color-text-muted)',
                  textDecoration: 'none',
                }}
              >
                UI Kit
              </a>
            )}
          </div>
        </div>

        <ThemeToggle
          mode={mode}
          resolvedTheme={resolvedTheme}
          onModeChange={setMode}
          showLabel
        />
      </nav>

      {/* Main Content View */}
      {isDevRoute && DevComponentsPage ? (
        <React.Suspense
          fallback={<div style={{ padding: 'var(--space-8)' }}>Loading…</div>}
        >
          <DevComponentsPage />
        </React.Suspense>
      ) : isTasksRoute ? (
        <TasksPage />
      ) : isMatrixRoute ? (
        <MatrixPage />
      ) : (
        <main
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'var(--space-8)',
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
              Offline-first productivity suite integrating To-Do Lists,
              Eisenhower Matrix, and Habit Tracking.
            </p>
            <div
              style={{
                display: 'flex',
                gap: 'var(--space-3)',
                justifyContent: 'center',
              }}
            >
              <button
                type="button"
                onClick={(e) => navigate('/tasks', e)}
                style={{
                  backgroundColor: 'var(--color-bg-secondary)',
                  color: 'var(--color-text-primary)',
                  border: '1px solid var(--color-border-default)',
                  borderRadius: 'var(--radius-md)',
                  padding: 'var(--space-2) var(--space-5)',
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: 'var(--font-weight-semibold)',
                  cursor: 'pointer',
                }}
              >
                Open Tasks →
              </button>

              <button
                type="button"
                onClick={(e) => navigate('/matrix', e)}
                style={{
                  backgroundColor: 'var(--color-accent-default)',
                  color: 'var(--color-text-on-accent)',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  padding: 'var(--space-2) var(--space-5)',
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: 'var(--font-weight-semibold)',
                  cursor: 'pointer',
                }}
              >
                Open Matrix Board →
              </button>
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
              <li>Feature Tasks with 4 layers and local persistence ready</li>
              <li>Feature Matrix with 2x2 board and drag-and-drop ready</li>
              <li>Vite + React 18 + TypeScript strict active</li>
            </ul>
          </section>
        </main>
      )}
    </div>
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
