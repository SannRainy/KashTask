import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { useTaskStore } from '@features/tasks';
import { useHabitStore } from '@features/habits';
import type { Task } from '@features/tasks';
import type { Habit, HabitLog } from '@features/habits';
import { StatsPage } from './StatsPage';

describe('Stats UI Integration', () => {
  beforeEach(() => {
    useTaskStore.setState({ tasks: [], filter: 'all', quadrant: 'all' });
    useHabitStore.setState({ habits: [], logs: [] });
  });

  it('renders empty state when there is no task or habit data', () => {
    render(<StatsPage />);
    expect(screen.getByText('No activity recorded yet')).toBeInTheDocument();
  });

  it('renders summary cards, SVG bar chart, and quadrant distribution matching data', () => {
    const mockTasks: Task[] = [
      {
        id: '01HARC4K1M9K7Z2P7N00W8J4Q1',
        title: 'Task Q1',
        urgent: true,
        important: true,
        status: 'done',
        order: 1,
        createdAt: '2026-11-04T07:00:00.000Z',
        updatedAt: '2026-11-04T08:00:00.000Z',
        completedAt: new Date().toISOString(), // completed today
      },
      {
        id: '01HARC4K1M9K7Z2P7N00W8J4Q2',
        title: 'Task Q2',
        urgent: false,
        important: true,
        status: 'done',
        order: 2,
        createdAt: '2026-11-04T07:00:00.000Z',
        updatedAt: '2026-11-04T09:00:00.000Z',
        completedAt: new Date().toISOString(), // completed today
      },
    ];

    const mockHabits: Habit[] = [
      {
        id: '01HARC5B0Q8A4T5V9B11C2D301',
        name: 'Morning Routine',
        frequency: { type: 'daily' },
        colorKey: 'indigo',
        createdAt: '2026-11-01T00:00:00.000Z',
      },
    ];

    const todayDateStr = new Date().toISOString().slice(0, 10);
    const mockLogs: HabitLog[] = [
      { habitId: '01HARC5B0Q8A4T5V9B11C2D301', date: todayDateStr },
    ];

    useTaskStore.setState({ tasks: mockTasks });
    useHabitStore.setState({ habits: mockHabits, logs: mockLogs });

    render(<StatsPage />);

    // Header exists
    expect(screen.getByText('Productivity Statistics')).toBeInTheDocument();

    // Summary cards exist
    const tasksCompletedCard = screen.getByTestId('summary-tasks-completed');
    expect(tasksCompletedCard).toHaveTextContent('2');

    const habitRateCard = screen.getByTestId('summary-habit-rate');
    expect(habitRateCard).toBeInTheDocument();

    // SVG Bar Chart exists with accessible role
    const svgChart = screen.getByRole('img', {
      name: /Daily Activity.*tasks completed/i,
    });
    expect(svgChart).toBeInTheDocument();

    // Accessible hidden table alternative exists
    expect(
      screen.getByText(/Daily Activity.*- Data Table Alternative/i)
    ).toBeInTheDocument();

    // Quadrant Breakdown exists
    expect(
      screen.getByLabelText(/Eisenhower Matrix Task Distribution/i)
    ).toBeInTheDocument();
  });

  it('switches between Week and Month mode and renders Monthly Heatmap', () => {
    useTaskStore.setState({
      tasks: [
        {
          id: '01HARC4K1M9K7Z2P7N00W8J4Q1',
          title: 'Task 1',
          urgent: true,
          important: true,
          status: 'done',
          order: 1,
          createdAt: '2026-11-04T07:00:00.000Z',
          updatedAt: '2026-11-04T08:00:00.000Z',
          completedAt: new Date().toISOString(),
        },
      ],
    });

    render(<StatsPage />);

    // Initially in Week mode: Heatmap is NOT rendered
    expect(
      screen.queryByLabelText(/Monthly calendar habit completion rates/i)
    ).toBeNull();

    // Switch to Month mode
    const monthRadio = screen.getByRole('radio', { name: 'Month' });
    fireEvent.click(monthRadio);

    // Now Heatmap should be rendered
    expect(
      screen.getByLabelText(/Monthly calendar habit completion rates/i)
    ).toBeInTheDocument();
  });
});
