import React from 'react';
import { ThemeProvider, useTheme } from './providers/ThemeProvider';
import { ThemeToggle } from '@shared/ui/ThemeToggle';
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
  const isDevRoute =
    import.meta.env.DEV && window.location.pathname === '/dev/components';

  if (isDevRoute && DevComponentsPage) {
    return (
      <React.Suspense fallback={<div>Loading…</div>}>
        <DevComponentsPage />
      </React.Suspense>
    );
  }

  return (
    <main
      style={{
        display: 'flex',
        minHeight: '100vh',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-8)',
        textAlign: 'center',
        gap: 'var(--space-6)',
      }}
    >
      {/* Theme toggle in top-right corner */}
      <div
        style={{
          position: 'fixed',
          top: 'var(--space-4)',
          right: 'var(--space-4)',
        }}
      >
        <ThemeToggle
          mode={mode}
          resolvedTheme={resolvedTheme}
          onModeChange={setMode}
          showLabel
        />
      </div>

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
            marginBottom: 'var(--space-8)',
          }}
        >
          Offline-first productivity suite integrating To-Do Lists, Eisenhower
          Matrix, and Habit Tracking.
        </p>
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
          <li>Vite + React 18 + TypeScript strict active</li>
        </ul>
        {import.meta.env.DEV && (
          <p
            style={{
              marginTop: 'var(--space-4)',
              fontSize: 'var(--font-size-xs)',
              color: 'var(--color-text-muted)',
            }}
          >
            Dev: visit{' '}
            <a
              href="/dev/components"
              style={{ color: 'var(--color-accent-default)' }}
            >
              /dev/components
            </a>{' '}
            for the component catalogue.
          </p>
        )}
      </section>
    </main>
  );
}

export function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
