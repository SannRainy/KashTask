/**
 * AppShell — responsive layout wrapper.
 *
 * Midnight Indigo Aura & Rounded Sleek Layout with top right avatar and status controls.
 */
import React from 'react';
import { ThemeToggle } from '@shared/ui/ThemeToggle';
import { useTheme } from './providers/ThemeProvider';
import styles from './AppShell.module.css';

export interface NavItem {
  label: string;
  path: string;
  count?: number;
  icon: React.ReactNode;
}

interface AppShellProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  children: React.ReactNode;
}

function IconHome() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 10.5L12 3l9 7.5" />
      <path d="M5 9v11a1 1 0 001 1h12a1 1 0 001-1V9" />
      <path d="M9 21v-7h6v7" />
    </svg>
  );
}

function IconTasks() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="9 11 12 14 22 4" />
      <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
    </svg>
  );
}

function IconMatrix() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="7" height="7" rx="2" />
      <rect x="14" y="3" width="7" height="7" rx="2" />
      <rect x="3" y="14" width="7" height="7" rx="2" />
      <rect x="14" y="14" width="7" height="7" rx="2" />
    </svg>
  );
}

function IconHabits() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
    </svg>
  );
}

function IconStats() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  );
}

function IconSettings() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
    </svg>
  );
}

function IconBell() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      width="18"
      height="18"
      aria-hidden="true"
    >
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 01-3.46 0" />
    </svg>
  );
}

const PRIMARY_NAV: NavItem[] = [
  { label: 'Overview', path: '/', icon: <IconHome /> },
  { label: 'Tasks', path: '/tasks', icon: <IconTasks />, count: 9 },
  { label: 'Matrix', path: '/matrix', icon: <IconMatrix />, count: 9 },
  { label: 'Habits', path: '/habits', icon: <IconHabits />, count: 9 },
  { label: 'Stats', path: '/stats', icon: <IconStats />, count: 9 },
];

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
      {/* Decorative Aura Gradients in Top-Right & Bottom-Left */}
      <div className={styles.ambientGlowTopRight} aria-hidden="true" />
      <div className={styles.ambientGlowBottomLeft} aria-hidden="true" />

      {/* Desktop Inset Sidebar */}
      <aside className={styles.sidebar} aria-label="Main navigation">
        <div className={styles.sidebarHeader}>
          <a
            href="/"
            onClick={handleNav('/')}
            className={styles.brandLink}
            aria-label="KashTask home"
          >
            <div className={styles.brandLogoMark}>K</div>
            <div className={styles.brandTextGroup}>
              <span className={styles.logo}>KashTask</span>
              <span className={styles.brandTagline}>Productivity Suite</span>
            </div>
          </a>
        </div>

        <nav className={styles.sidebarNav}>
          <span className={styles.navSectionLabel}>Workspace</span>
          {PRIMARY_NAV.map((item) => (
            <a
              key={item.path}
              href={item.path}
              onClick={handleNav(item.path)}
              className={`${styles.navItem}${isActive(item.path) ? ` ${styles.active}` : ''}`}
              aria-current={isActive(item.path) ? 'page' : undefined}
            >
              <div className={styles.navItemContent}>
                <span className={styles.navIcon}>{item.icon}</span>
                <span>{item.label}</span>
              </div>
              {item.count !== undefined && (
                <span className={styles.countPill}>{item.count}</span>
              )}
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
              <div className={styles.navItemContent}>
                <span className={styles.navIcon}>
                  <IconStats />
                </span>
                <span>UI Kit</span>
              </div>
            </a>
          )}
          <a
            href="/settings"
            onClick={handleNav('/settings')}
            className={`${styles.navItem}${isActive('/settings') ? ` ${styles.active}` : ''}`}
            aria-current={isActive('/settings') ? 'page' : undefined}
          >
            <div className={styles.navItemContent}>
              <span className={styles.navIcon}>
                <IconSettings />
              </span>
              <span>Settings</span>
            </div>
          </a>
          <div className={styles.themeToggleWrapper}>
            <ThemeToggle
              mode={mode}
              resolvedTheme={resolvedTheme}
              onModeChange={setMode}
              showLabel
            />
          </div>
        </div>
      </aside>

      {/* Main content area */}
      <div className={styles.main}>
        {/* Desktop Top Header Bar with Avatar & Actions */}
        <div className={styles.mainTopBar} role="toolbar" aria-label="Quick actions">
          <div className={styles.topBarActions}>
            <ThemeToggle
              mode={mode}
              resolvedTheme={resolvedTheme}
              onModeChange={setMode}
            />
            <button
              type="button"
              className={styles.iconActionBtn}
              aria-label="Notifications"
            >
              <IconBell />
            </button>
            <div className={styles.avatarPill} title="Profile">
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(135deg, #a855f7, #6366f1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontWeight: 'bold',
                  fontSize: '14px',
                }}
              >
                KT
              </div>
            </div>
          </div>
        </div>

        {/* Mobile top bar */}
        <header className={styles.topBar}>
          <a
            href="/"
            onClick={handleNav('/')}
            className={styles.topBarBrand}
            aria-label="KashTask Home"
          >
            <div className={styles.brandLogoMarkSmall}>K</div>
            <span className={styles.topBarLogo}>KashTask</span>
          </a>
          <div className={styles.topBarActions}>
            <ThemeToggle
              mode={mode}
              resolvedTheme={resolvedTheme}
              onModeChange={setMode}
            />
            <a
              href="/settings"
              onClick={handleNav('/settings')}
              aria-label="Settings"
              className={styles.iconActionBtn}
            >
              <IconSettings />
            </a>
          </div>
        </header>

        {/* Page content wrapper */}
        <div className={styles.mainContentMobile}>{children}</div>

        {/* Mobile floating bottom nav bar */}
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
                <span>{item.label}</span>
              </a>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
}
