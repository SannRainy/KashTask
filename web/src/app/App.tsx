import React from 'react';
import './reset.css';

export const App: React.FC = () => {
  return (
    <main
      style={{
        display: 'flex',
        minHeight: '100vh',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        textAlign: 'center',
      }}
    >
      <header>
        <h1
          style={{
            fontSize: '2.5rem',
            fontWeight: 700,
            marginBottom: '0.75rem',
            letterSpacing: '-0.025em',
          }}
        >
          KashTask
        </h1>
        <p
          style={{
            fontSize: '1.125rem',
            color: '#94a3b8',
            maxWidth: '36rem',
            marginBottom: '2rem',
          }}
        >
          Offline-first productivity suite integrating To-Do Lists, Eisenhower
          Matrix, and Habit Tracking.
        </p>
      </header>

      <section
        style={{
          backgroundColor: '#1e293b',
          borderRadius: '0.75rem',
          padding: '1.5rem',
          border: '1px solid #334155',
          maxWidth: '32rem',
          width: '100%',
          textAlign: 'left',
        }}
      >
        <h2
          style={{
            fontSize: '1rem',
            fontWeight: 600,
            color: '#38bdf8',
            marginBottom: '0.5rem',
          }}
        >
          System Architecture Status
        </h2>
        <ul
          style={{
            listStylePosition: 'inside',
            color: '#cbd5e1',
            fontSize: '0.875rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.375rem',
          }}
        >
          <li>
            4 Architectural Zones configured (App, Features, Shared, Core)
          </li>
          <li>Feature modules isolated with Public API barrels</li>
          <li>Strict architectural boundaries enforced via ESLint</li>
          <li>Vite + React 18 + TypeScript strict active</li>
        </ul>
      </section>
    </main>
  );
};

export default App;
