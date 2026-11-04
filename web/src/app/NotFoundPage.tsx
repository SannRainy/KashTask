/**
 * NotFoundPage — 404 fallback for unrecognised routes.
 */
interface NotFoundPageProps {
  onNavigate: (path: string) => void;
}

export function NotFoundPage({ onNavigate }: NotFoundPageProps) {
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
          fontSize: '4rem',
          lineHeight: 1,
          fontWeight: 'var(--font-weight-bold)',
          color: 'var(--color-text-muted)',
        }}
        aria-hidden="true"
      >
        404
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
          Page not found
        </h1>
        <p
          style={{
            fontSize: 'var(--font-size-sm)',
            color: 'var(--color-text-secondary)',
          }}
        >
          The page you're looking for doesn't exist.
        </p>
      </div>
      <button
        type="button"
        onClick={() => onNavigate('/')}
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
        Go to Overview
      </button>
    </main>
  );
}
