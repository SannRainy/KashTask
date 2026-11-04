/**
 * AppShell — responsive layout wrapper.
 *
 * Desktop (≥768px): sticky sidebar with nav + settings link.
 * Mobile (<768px):  sticky top bar + fixed bottom navigation.
 */
import React from 'react';
import { ThemeToggle } from '@shared/ui/ThemeToggle';
import { useTheme } from './providers/ThemeProvider';
import styles from './AppShell.module.css';

export interface NavItem {
  label: string;
  path: string;
  shortcut?: string;
  icon: React.ReactNode;
}

interface AppShellProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  children: React.ReactNode;
}

// ── SVG Icons ──────────────────────────────────────────────────────────────

function IconHome() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 12L12 3l9 9" />
      <path d="M9 21V12h6v9" />
      <rect x="3" y="12" width="18" height="9" rx="1" opacity="0" />
    </svg>
  );
}

function IconTasks() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
      <rect x="9" y="3" width="6" height="4" rx="1" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

function IconMatrix() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="8" height="8" rx="1" />
      <rect x="13" y="3" width="8" height="8" rx="1" />
      <rect x="3" y="13" width="8" height="8" rx="1" />
      <rect x="13" y="13" width="8" height="8" rx="1" />
    </svg>
  );
}

function IconHabits() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
      <path d="M12 6v6l4 2" />
    </svg>
  );
}

function IconStats() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M18 20V10M12 20V4M6 20v-6" />
    </svg>
  );
}

function IconSettings() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
    </svg>
  );
}

// ── Nav items config ────────────────────────────────────────────────────────

const PRIMARY_NAV: NavItem[] = [
  { label: 'Overview', path: '/', icon: <IconHome />, shortcut: undefined },
  { label: 'Tasks', path: '/tasks', icon: <IconTasks />, shortcut: 'g t' },
  { label: 'Matrix', path: '/matrix', icon: <IconMatrix />, shortcut: 'g m' },
  { label: 'Habits', path: '/habits', icon: <IconHabits />, shortcut: 'g h' },
  { label: 'Stats', path: '/stats', icon: <IconStats />, shortcut: 'g s' },
];

// ── Component ───────────────────────────────────────────────────────────────

export function AppShell({ currentPath, onNavigate, children }: AppShellProps) {
  const { mode, resolvedTheme, setMode } = useTheme();

  const isActive = (path: string) =>
    path === '/' ? currentPath === '/' : currentPath.startsWith(path);

  const handleNav = (path: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    onNavigate(path);
  };

  return (
    <div className={styles.shell}>
      {/* Desktop Sidebar */}
      <aside className={styles.sidebar} aria-label="Main navigation">
        <div className={styles.sidebarHeader}>
          <a
            href="/"
            onClick={handleNav('/')}
            className={styles.logo}
            aria-label="KashTask home"
          >
            KashTask
          </a>
        </div>

        <nav className={styles.sidebarNav}>
          {PRIMARY_NAV.map((item) => (
            <a
              key={item.path}
              href={item.path}
              onClick={handleNav(item.path)}
              className={`${styles.navItem}${isActive(item.path) ? ` ${styles.active}` : ''}`}
              aria-current={isActive(item.path) ? 'page' : undefined}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              {item.label}
            </a>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          {import.meta.env.DEV && (
            <a
              href="/dev/components"
              onClick={handleNav('/dev/components')}
              className={`${styles.navItem}${currentPath === '/dev/components' ? ` ${styles.active}` : ''}`}
              aria-current={
                currentPath === '/dev/components' ? 'page' : undefined
              }
            >
              <span className={styles.navIcon}>
                <IconStats />
              </span>
              UI Kit
            </a>
          )}
          <a
            href="/settings"
            onClick={handleNav('/settings')}
            className={`${styles.navItem}${isActive('/settings') ? ` ${styles.active}` : ''}`}
            aria-current={isActive('/settings') ? 'page' : undefined}
          >
            <span className={styles.navIcon}>
              <IconSettings />
            </span>
            Settings
          </a>
          <div
            style={{
              paddingLeft: 'var(--space-1)',
              paddingTop: 'var(--space-2)',
            }}
          >
            <ThemeToggle
              mode={mode}
              resolvedTheme={resolvedTheme}
              onModeChange={setMode}
            />
          </div>
        </div>
      </aside>

      {/* Main area */}
      <div className={styles.main}>
        {/* Mobile top bar */}
        <header className={styles.topBar}>
          <a href="/" onClick={handleNav('/')} className={styles.topBarLogo}>
            KashTask
          </a>
          <div
            style={{
              display: 'flex',
              gap: 'var(--space-2)',
              alignItems: 'center',
            }}
          >
            <ThemeToggle
              mode={mode}
              resolvedTheme={resolvedTheme}
              onModeChange={setMode}
            />
            <a
              href="/settings"
              onClick={handleNav('/settings')}
              aria-label="Settings"
              style={{
                display: 'flex',
                color: 'var(--color-text-secondary)',
                padding: 'var(--space-1)',
              }}
            >
              <span style={{ width: 20, height: 20 }}>
                <IconSettings />
              </span>
            </a>
          </div>
        </header>

        {/* Page content */}
        <div className={styles.mainContentMobile}>{children}</div>

        {/* Mobile bottom nav */}
        <nav className={styles.bottomNav} aria-label="Mobile navigation">
          <div className={styles.bottomNavInner}>
            {PRIMARY_NAV.map((item) => (
              <a
                key={item.path}
                href={item.path}
                onClick={handleNav(item.path)}
                className={`${styles.bottomNavItem}${isActive(item.path) ? ` ${styles.active}` : ''}`}
                aria-current={isActive(item.path) ? 'page' : undefined}
                aria-label={item.label}
              >
                <span className={styles.bottomNavIcon}>{item.icon}</span>
                {item.label}
              </a>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
}
