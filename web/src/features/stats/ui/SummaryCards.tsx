import type { PeriodStats } from '../models/stats';
import styles from './SummaryCards.module.css';

export interface SummaryCardsProps {
  stats: PeriodStats;
}

export function SummaryCards({ stats }: SummaryCardsProps) {
  // Determine top quadrant
  const qDist = stats.quadrantDistribution;
  let topQuadrant = 'None';
  let topPercentage = 0;

  if (qDist.total > 0) {
    const quadrants: Array<'DO' | 'SCHEDULE' | 'DELEGATE' | 'ELIMINATE'> = [
      'DO',
      'SCHEDULE',
      'DELEGATE',
      'ELIMINATE',
    ];
    let maxCount = -1;
    for (const q of quadrants) {
      if (qDist[q] > maxCount) {
        maxCount = qDist[q];
        topQuadrant = q;
        topPercentage = qDist.percentages[q];
      }
    }
  }

  return (
    <div className={styles.grid} aria-label="Summary Statistics Cards">
      {/* 1. Tasks Completed */}
      <div className={styles.card}>
        <h3 className={styles.title}>Tasks Completed</h3>
        <p
          className={[styles.value, styles.accentValue].join(' ')}
          data-testid="summary-tasks-completed"
        >
          {stats.totalTasksCompleted}
        </p>
        <p className={styles.subtext}>in this {stats.periodType}</p>
      </div>

      {/* 2. Habit Completion Rate */}
      <div className={styles.card}>
        <h3 className={styles.title}>Habit Consistency</h3>
        <p
          className={[styles.value, styles.accentValue].join(' ')}
          data-testid="summary-habit-rate"
        >
          {stats.overallHabitRate}%
        </p>
        <p className={styles.subtext}>
          {stats.totalHabitsCompleted} of {stats.totalHabitsScheduled} scheduled
        </p>
      </div>

      {/* 3. Best Streak */}
      <div className={styles.card}>
        <h3 className={styles.title}>Best Streak</h3>
        <p className={styles.value} data-testid="summary-best-streak">
          {stats.bestStreak ? `🔥 ${stats.bestStreak.streak} d` : '—'}
        </p>
        <p className={styles.subtext}>
          {stats.bestStreak ? stats.bestStreak.habitName : 'No active streak'}
        </p>
      </div>

      {/* 4. Top Quadrant */}
      <div className={styles.card}>
        <h3 className={styles.title}>Focus Quadrant</h3>
        <p className={styles.value} data-testid="summary-top-quadrant">
          {topQuadrant}
        </p>
        <p className={styles.subtext}>
          {qDist.total > 0 ? `${topPercentage}% of tasks` : 'No tasks recorded'}
        </p>
      </div>
    </div>
  );
}
