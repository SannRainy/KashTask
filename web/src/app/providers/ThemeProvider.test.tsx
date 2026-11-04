/**
 * ThemeProvider tests — verify mode switching, persistence, and system sync.
 */
import { render, screen, act, fireEvent } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ThemeProvider, useTheme } from './ThemeProvider';

// ─── Helper component ─────────────────────────────────────────────────────────

function ThemeConsumer() {
  const { mode, resolvedTheme, setMode } = useTheme();
  return (
    <div>
      <span data-testid="mode">{mode}</span>
      <span data-testid="resolved">{resolvedTheme}</span>
      <button onClick={() => setMode('dark')}>set dark</button>
      <button onClick={() => setMode('light')}>set light</button>
      <button onClick={() => setMode('system')}>set system</button>
    </div>
  );
}

function renderProvider() {
  return render(
    <ThemeProvider>
      <ThemeConsumer />
    </ThemeProvider>
  );
}

// ─── Setup ───────────────────────────────────────────────────────────────────

let mockPrefersDark = false;
let mqListeners: Array<(e: MediaQueryListEvent) => void> = [];

beforeEach(() => {
  mockPrefersDark = false;
  mqListeners = [];
  localStorage.clear();

  // Mock matchMedia
  vi.spyOn(window, 'matchMedia').mockImplementation((query: string) => ({
    matches: query === '(prefers-color-scheme: dark)' ? mockPrefersDark : false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: (
      _: string,
      handler: EventListenerOrEventListenerObject
    ) => {
      if (typeof handler === 'function')
        mqListeners.push(handler as (e: MediaQueryListEvent) => void);
    },
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
});

afterEach(() => {
  vi.restoreAllMocks();
  document.documentElement.removeAttribute('data-theme');
  localStorage.clear();
});

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('ThemeProvider', () => {
  it('defaults to system mode and resolves to light when OS is light', () => {
    mockPrefersDark = false;
    renderProvider();

    expect(screen.getByTestId('mode').textContent).toBe('system');
    expect(screen.getByTestId('resolved').textContent).toBe('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('defaults to system mode and resolves to dark when OS is dark', () => {
    mockPrefersDark = true;
    renderProvider();

    expect(screen.getByTestId('mode').textContent).toBe('system');
    expect(screen.getByTestId('resolved').textContent).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('switches to dark mode and applies data-theme="dark"', () => {
    renderProvider();

    fireEvent.click(screen.getByText('set dark'));

    expect(screen.getByTestId('mode').textContent).toBe('dark');
    expect(screen.getByTestId('resolved').textContent).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('switches to light mode and applies data-theme="light"', () => {
    renderProvider();

    fireEvent.click(screen.getByText('set light'));

    expect(screen.getByTestId('mode').textContent).toBe('light');
    expect(screen.getByTestId('resolved').textContent).toBe('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('persists mode to localStorage when changed', () => {
    renderProvider();

    fireEvent.click(screen.getByText('set dark'));

    expect(localStorage.getItem('kashtask:theme')).toBe('dark');
  });

  it('reads persisted mode from localStorage on mount', () => {
    localStorage.setItem('kashtask:theme', 'dark');

    renderProvider();

    expect(screen.getByTestId('mode').textContent).toBe('dark');
    expect(screen.getByTestId('resolved').textContent).toBe('dark');
  });

  it('updates resolved theme when OS preference changes in system mode', () => {
    mockPrefersDark = false;
    renderProvider();

    // Initially light
    expect(screen.getByTestId('resolved').textContent).toBe('light');

    // Simulate OS switching to dark
    act(() => {
      mqListeners.forEach((handler) =>
        handler({ matches: true } as MediaQueryListEvent)
      );
    });

    expect(screen.getByTestId('resolved').textContent).toBe('dark');
  });

  it('does NOT update resolved theme on OS change when mode is locked to light', () => {
    mockPrefersDark = false;
    renderProvider();

    fireEvent.click(screen.getByText('set light'));

    // Simulate OS switching to dark
    act(() => {
      mqListeners.forEach((handler) =>
        handler({ matches: true } as MediaQueryListEvent)
      );
    });

    // Mode is explicitly 'light' — resolved should stay 'light'
    expect(screen.getByTestId('resolved').textContent).toBe('light');
  });
});
