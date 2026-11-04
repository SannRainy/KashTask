import type { QuadrantDistribution } from '../models/stats';
import styles from './QuadrantBreakdown.module.css';

export interface QuadrantBreakdownProps {
  distribution: QuadrantDistribution;
}

const QUADRANT_CONFIG = [
  {
    key: 'DO',
    label: 'Do First',
    sub: 'Urgent & Important',
    badgeClass: styles.badgeDo,
    fillClass: styles.fillDo,
  },
  {
    key: 'SCHEDULE',
    label: 'Schedule',
    sub: 'Important, Not Urgent',
    badgeClass: styles.badgeSchedule,
    fillClass: styles.fillSchedule,
  },
  {
    key: 'DELEGATE',
    label: 'Delegate',
    sub: 'Urgent, Not Important',
    badgeClass: styles.badgeDelegate,
    fillClass: styles.fillDelegate,
  },
  {
    key: 'ELIMINATE',
    label: 'Don’t Do',
    sub: 'Neither',
    badgeClass: styles.badgeEliminate,
    fillClass: styles.fillEliminate,
  },
] as const;

export function QuadrantBreakdown({ distribution }: QuadrantBreakdownProps) {
  return (
    <div
      className={styles.container}
      aria-label="Eisenhower Matrix Task Distribution"
    >
      <h3 className={styles.title}>Task Quadrant Distribution</h3>

      <div className={styles.rows}>
        {QUADRANT_CONFIG.map(({ key, label, sub, badgeClass, fillClass }) => {
          const count = distribution[key];
          const pct = distribution.percentages[key];

          return (
            <div key={key} className={styles.row}>
              <div className={styles.rowHeader}>
                <span className={styles.quadrantName}>
                  <span className={[styles.badge, badgeClass].join(' ')}>
                    {key}
                  </span>
                  {label}{' '}
                  <span style={{ color: 'var(--color-text-muted)' }}>
                    ({sub})
                  </span>
                </span>
                <span className={styles.countText}>
                  {count} ({pct}%)
                </span>
              </div>

              <div
                className={styles.progressBarTrack}
                role="progressbar"
                aria-valuenow={pct}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${label}: ${pct}%`}
              >
                <div
                  className={[styles.progressBarFill, fillClass].join(' ')}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
