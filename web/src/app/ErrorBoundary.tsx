/**
 * ErrorBoundary — catches render errors and shows a friendly fallback.
 */
import React from 'react';

interface State {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  State
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: unknown): State {
    const message =
      error instanceof Error ? error.message : 'An unexpected error occurred.';
    return { hasError: true, message };
  }

  componentDidCatch(error: unknown, info: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 'var(--space-6)',
            padding: 'var(--space-8)',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontSize: '3rem',
              lineHeight: 1,
            }}
            aria-hidden="true"
          >
            ⚠️
          </div>
          <div>
            <h1
              style={{
                fontSize: 'var(--font-size-xl)',
                fontWeight: 'var(--font-weight-bold)',
                color: 'var(--color-text-primary)',
                marginBottom: 'var(--space-2)',
              }}
            >
              Something went wrong
            </h1>
            <p
              style={{
                fontSize: 'var(--font-size-sm)',
                color: 'var(--color-text-secondary)',
                maxWidth: '32rem',
              }}
            >
              {this.state.message}
            </p>
          </div>
          <button
            type="button"
            onClick={() => window.location.reload()}
            style={{
              background: 'var(--color-accent-default)',
              color: 'var(--color-text-on-accent)',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              padding: 'var(--space-2) var(--space-6)',
              fontSize: 'var(--font-size-sm)',
              fontWeight: 'var(--font-weight-semibold)',
              cursor: 'pointer',
            }}
          >
            Reload page
          </button>
        </main>
      );
    }

    return this.props.children;
  }
}
