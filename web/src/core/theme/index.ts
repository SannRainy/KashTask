/**
 * core/theme — public API for theme types and constants.
 *
 * The actual CSS design tokens live in tokens.css.
 * This module only exports TypeScript-level contracts.
 */

/** All supported theme mode selections. */
export type ThemeMode = 'system' | 'light' | 'dark';

/** Resolved (concrete) theme — never 'system'. */
export type ResolvedTheme = 'light' | 'dark';

/** localStorage key used to persist the user's theme preference. */
export const THEME_STORAGE_KEY = 'kashtask:theme' as const;

/** Attribute set on <html> to activate the correct CSS theme. */
export const THEME_DATA_ATTR = 'data-theme' as const;

/**
 * Resolves a ThemeMode to a concrete ResolvedTheme by checking the
 * system preference via a provided media query matcher.
 *
 * @param mode - The user's chosen mode (system | light | dark).
 * @param prefersDark - Whether the OS prefers dark colour scheme.
 * @returns 'light' or 'dark'.
 */
export function resolveTheme(
  mode: ThemeMode,
  prefersDark: boolean
): ResolvedTheme {
  if (mode === 'dark') return 'dark';
  if (mode === 'light') return 'light';
  return prefersDark ? 'dark' : 'light';
}
