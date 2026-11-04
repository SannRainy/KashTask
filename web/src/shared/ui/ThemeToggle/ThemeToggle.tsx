/**
 * ThemeToggle — cycles through light → dark → system modes.
 *
 * Uses useTheme() from app/providers/ThemeProvider which is passed in via
 * a callback prop to avoid shared importing app layer from shared layer.
 */
import styles from './ThemeToggle.module.css';
import type { ThemeMode, ResolvedTheme } from '@core/theme';

export interface ThemeToggleProps {
  /** Current mode. */
  mode: ThemeMode;
  /** Current resolved theme (for rendering the right icon). */
  resolvedTheme: ResolvedTheme;
  /** Callback to change the mode. */
  onModeChange: (mode: ThemeMode) => void;
  /** Whether to show a text label. Default: false. */
  showLabel?: boolean;
  className?: string;
}

function SunIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SystemIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="2"
        y="3"
        width="20"
        height="14"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M8 21h8M12 17v4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

const CYCLE: ThemeMode[] = ['light', 'dark', 'system'];

const LABELS: Record<ThemeMode, string> = {
  light: 'Light',
  dark: 'Dark',
  system: 'System',
};

export function ThemeToggle({
  mode,
  resolvedTheme,
  onModeChange,
  showLabel = false,
  className,
}: ThemeToggleProps) {
  const handleClick = () => {
    const idx = CYCLE.indexOf(mode);
    const next = CYCLE[(idx + 1) % CYCLE.length];
    onModeChange(next);
  };

  const Icon =
    mode === 'dark' ? MoonIcon : mode === 'light' ? SunIcon : SystemIcon;

  const titleText =
    mode === 'system'
      ? `Theme: System (${resolvedTheme})`
      : `Theme: ${LABELS[mode]}`;

  return (
    <button
      type="button"
      className={[styles.toggle, className ?? ''].filter(Boolean).join(' ')}
      onClick={handleClick}
      aria-label={`${titleText}. Click to change.`}
      title={titleText}
    >
      <span className={styles.icon}>
        <Icon />
      </span>
      {showLabel && <span>{LABELS[mode]}</span>}
    </button>
  );
}
