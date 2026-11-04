/**
 * ThemeProvider — app layer.
 *
 * Manages theme mode (system | light | dark), persists to localStorage,
 * applies data-theme attribute on <html>, updates <meta name="theme-color">,
 * and responds to OS preference changes when mode is 'system'.
 *
 * The anti-flash inline script in index.html sets data-theme synchronously
 * before the first React render, so there is never a flash of the wrong theme.
 */
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  type ThemeMode,
  type ResolvedTheme,
  resolveTheme,
  THEME_STORAGE_KEY,
  THEME_DATA_ATTR,
} from '@core/theme';

// ─── Context ─────────────────────────────────────────────────────────────────

export interface ThemeContextValue {
  /** The user's chosen mode (may be 'system'). */
  mode: ThemeMode;
  /** The concrete resolved theme applied to the DOM. */
  resolvedTheme: ResolvedTheme;
  /** Set a new mode and persist it. */
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used inside <ThemeProvider>');
  }
  return ctx;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function readStoredMode(): ThemeMode {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === 'light' || stored === 'dark' || stored === 'system') {
      return stored;
    }
  } catch {
    /* storage unavailable */
  }
  return 'system';
}

function writeStoredMode(mode: ThemeMode): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, mode);
  } catch {
    /* storage unavailable */
  }
}

function getPrefersDark(): boolean {
  try {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  } catch {
    return false;
  }
}

function applyTheme(resolved: ResolvedTheme): void {
  document.documentElement.setAttribute(THEME_DATA_ATTR, resolved);

  // Update the browser chrome / PWA theme colour
  const metaEl = document.querySelector<HTMLMetaElement>(
    'meta[name="theme-color"]'
  );
  if (metaEl) {
    // Read the CSS variable value as set by tokens.css for the active theme
    const themeColor =
      getComputedStyle(document.documentElement)
        .getPropertyValue('--theme-color')
        .trim() || (resolved === 'dark' ? '#0f172a' : '#f8fafc');
    metaEl.content = themeColor;
  }
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [mode, setModeState] = useState<ThemeMode>(readStoredMode);
  const [prefersDark, setPrefersDark] = useState<boolean>(getPrefersDark);

  // Derived: concrete theme applied to DOM
  const resolvedTheme = useMemo(
    () => resolveTheme(mode, prefersDark),
    [mode, prefersDark]
  );

  // Apply data-theme attribute whenever resolvedTheme changes
  useEffect(() => {
    applyTheme(resolvedTheme);
  }, [resolvedTheme]);

  // Listen to OS preference changes when mode is 'system'
  useEffect(() => {
    let mql: MediaQueryList | null = null;
    try {
      mql = window.matchMedia('(prefers-color-scheme: dark)');
    } catch {
      return;
    }

    const handler = (e: MediaQueryListEvent) => {
      setPrefersDark(e.matches);
    };

    mql.addEventListener('change', handler);
    return () => mql?.removeEventListener('change', handler);
  }, []);

  const setMode = useCallback((newMode: ThemeMode) => {
    writeStoredMode(newMode);
    setModeState(newMode);
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({ mode, resolvedTheme, setMode }),
    [mode, resolvedTheme, setMode]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}
