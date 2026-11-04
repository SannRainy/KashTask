import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { App } from './App';

describe('App Component', () => {
  it('renders application title and description', () => {
    render(<App />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'KashTask'
    );
    expect(
      screen.getByText(/Offline-first productivity suite/i)
    ).toBeInTheDocument();
  });

  it('renders system architecture status section', () => {
    render(<App />);

    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /System Architecture Status/i,
      })
    ).toBeInTheDocument();
  });
});
