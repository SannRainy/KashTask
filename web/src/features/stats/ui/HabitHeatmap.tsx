import type { DayMetric } from '../models/stats';
import { getDayOfWeek } from '../logic/statsPeriodUtils';
import styles from './HabitHeatmap.module.css';

export interface HabitHeatmapProps {
  metrics: DayMetric[];
  startDate: string;
  weekStartsOn?: 0 | 1;
  title?: string;
}

export function HabitHeatmap({
  metrics,
  startDate,
  weekStartsOn = 1,
  title = 'Monthly Habit Consistency Heatmap',
}: HabitHeatmapProps) {
  const dayHeaders =
    weekStartsOn === 1
      ? ['M', 'T', 'W', 'T', 'F', 'S', 'S']
      : ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  // Offset before day 1 of month
  const firstDayOfWeek = getDayOfWeek(startDate);
  const leadingOffset = (firstDayOfWeek - weekStartsOn + 7) % 7;

  // Resolve level
  const getLevelClass = (metric: DayMetric) => {
    if (metric.habitsScheduled === 0 || metric.habitRate === 0) {
      return styles.level0;
    }
    if (metric.habitRate <= 25) return styles.level1;
    if (metric.habitRate <= 50) return styles.level2;
    if (metric.habitRate <= 75) return styles.level3;
    return styles.level4;
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>{title}</h3>
      </div>

      <div
        className={styles.calendarGrid}
        role="grid"
        aria-label={`${title}: Monthly calendar habit completion rates`}
      >
        {/* Day headers */}
        {dayHeaders.map((dh, i) => (
          <div
            key={`head-${dh}-${i}`}
            className={styles.dayHeader}
            aria-hidden="true"
          >
            {dh}
          </div>
        ))}

        {/* Leading empty cells */}
        {Array.from({ length: leadingOffset }).map((_, i) => (
          <div
            key={`empty-${i}`}
            className={styles.cellEmpty}
            aria-hidden="true"
          />
        ))}

        {/* Days of month */}
        {metrics.map((metric) => {
          const levelClass = getLevelClass(metric);
          const tooltip = `${metric.shortDateLabel}: ${metric.habitRate}% (${metric.habitsCompleted}/${metric.habitsScheduled} habits)`;

          return (
            <div
              key={metric.date}
              className={[styles.cell, levelClass].join(' ')}
              tabIndex={0}
              role="gridcell"
              aria-label={tooltip}
              title={tooltip}
            >
              <span className={styles.cellDayNum}>
                {metric.dayLabel.replace(/^0/, '')}
              </span>
            </div>
          );
        })}
      </div>

      {/* Heatmap Legend */}
      <div className={styles.footer} aria-hidden="true">
        <span>Less</span>
        <div className={styles.legendScale}>
          <span className={[styles.legendBox, styles.level0].join(' ')} />
          <span className={[styles.legendBox, styles.level1].join(' ')} />
          <span className={[styles.legendBox, styles.level2].join(' ')} />
          <span className={[styles.legendBox, styles.level3].join(' ')} />
          <span className={[styles.legendBox, styles.level4].join(' ')} />
        </div>
        <span>More</span>
      </div>

      {/* Accessible Table Alternative */}
      <table className={styles.srOnly}>
        <caption>{title} - Data Table Alternative</caption>
        <thead>
          <tr>
            <th scope="col">Date</th>
            <th scope="col">Habits Scheduled</th>
            <th scope="col">Habits Completed</th>
            <th scope="col">Completion Rate</th>
          </tr>
        </thead>
        <tbody>
          {metrics.map((m) => (
            <tr key={m.date}>
              <td>{m.date}</td>
              <td>{m.habitsScheduled}</td>
              <td>{m.habitsCompleted}</td>
              <td>{m.habitRate}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
