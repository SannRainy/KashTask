/**
 * AppShell — responsive layout wrapper.
 *
 * Desktop (≥768px): clean floating refined sidebar with nav + settings.
 * Mobile (<768px):  sticky top bar + floating modern pill bottom nav.
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

function IconHome() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
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
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9 6h11M9 12h11M9 18h11" />
      <path d="M4 6l1 1 2-2M4 12l1 1 2-2M4 18l1 1 2-2" />
    </svg>
  );
}

function IconMatrix() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="8" height="8" rx="2" />
      <rect x="13" y="3" width="8" height="8" rx="2" />
      <rect x="3" y="13" width="8" height="8" rx="2" />
      <rect x="13" y="13" width="8" height="8" rx="2" />
    </svg>
  );
}

function IconHabits() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" />
      <circle cx="12" cy="12" r="4" />
    </svg>
  );
}

function IconStats() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M18 20V10M12 20V4M6 20v-6" />
      <path d="M3 20h18" />
    </svg>
  );
}

function IconSettings() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
    </svg>
  );
}

const PRIMARY_NAV: NavItem[] = [
  { label: 'Overview', path: '/', icon: <IconHome />, shortcut: 'Esc' },
  { label: 'Tasks', path: '/tasks', icon: <IconTasks />, shortcut: 'g t' },
  { label: 'Matrix', path: '/matrix', icon: <IconMatrix />, shortcut: 'g m' },
  { label: 'Habits', path: '/habits', icon: <IconHabits />, shortcut: 'g h' },
  { label: 'Stats', path: '/stats', icon: <IconStats />, shortcut: 'g s' },
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
      {/* Subtle modern ambient artistic background layer */}
      <div className={styles.ambientBackdrop} aria-hidden="true" />

      {/* Desktop Sidebar */}
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
              {item.shortcut && (
                <span className={styles.shortcutBadge}>{item.shortcut}</span>
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
              className={styles.mobileSettingsBtn}
            >
              <span className={styles.mobileSettingsIcon}>
                <IconSettings />
              </span>
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
