import { useState } from 'react';
import type { DayMetric } from '../models/stats';
import styles from './BarChart.module.css';

export interface BarChartProps {
  metrics: DayMetric[];
  title?: string;
}

export function BarChart({
  metrics,
  title = 'Daily Activity Overview',
}: BarChartProps) {
  const [metricMode, setMetricMode] = useState<'tasks' | 'habits'>('tasks');

  // Chart dimensions
  const svgWidth = 600;
  const svgHeight = 220;
  const padLeft = 40;
  const padRight = 16;
  const padTop = 24;
  const padBottom = 32;

  const chartWidth = svgWidth - padLeft - padRight;
  const chartHeight = svgHeight - padTop - padBottom;

  // Max value calculation
  const maxTasks = Math.max(4, ...metrics.map((m) => m.tasksCompleted));
  const maxVal = metricMode === 'tasks' ? maxTasks : 100;

  const count = metrics.length;
  const slotWidth = chartWidth / Math.max(1, count);
  const barWidth = Math.max(6, Math.min(32, slotWidth * 0.65));

  // Y-axis grid ticks (4 intervals)
  const ticks = [0, 0.25, 0.5, 0.75, 1];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>{title}</h3>

        <div
          className={styles.viewSelector}
          role="radiogroup"
          aria-label="Chart Metric Selection"
        >
          <button
            type="button"
            role="radio"
            aria-checked={metricMode === 'tasks'}
            className={[
              styles.viewBtn,
              metricMode === 'tasks' ? styles.viewBtnActive : '',
            ].join(' ')}
            onClick={() => setMetricMode('tasks')}
          >
            Tasks Completed
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={metricMode === 'habits'}
            className={[
              styles.viewBtn,
              metricMode === 'habits' ? styles.viewBtnActive : '',
            ].join(' ')}
            onClick={() => setMetricMode('habits')}
          >
            Habit Consistency (%)
          </button>
        </div>
      </div>

      <div className={styles.chartWrapper}>
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className={styles.svg}
          role="img"
          aria-label={`${title}: Showing ${metricMode === 'tasks' ? 'tasks completed' : 'habit completion percentage'} per day`}
        >
          {/* Y-Axis Horizontal Gridlines & Tick Labels */}
          {ticks.map((ratio) => {
            const y = padTop + chartHeight - ratio * chartHeight;
            const tickVal =
              metricMode === 'tasks'
                ? Math.round(ratio * maxVal)
                : `${Math.round(ratio * 100)}%`;

            return (
              <g key={ratio}>
                <line
                  x1={padLeft}
                  y1={y}
                  x2={svgWidth - padRight}
                  y2={y}
                  className={styles.gridLine}
                />
                <text
                  x={padLeft - 6}
                  y={y + 4}
                  textAnchor="end"
                  className={styles.axisText}
                >
                  {tickVal}
                </text>
              </g>
            );
          })}

          {/* Bars */}
          {metrics.map((metric, idx) => {
            const val =
              metricMode === 'tasks' ? metric.tasksCompleted : metric.habitRate;

            const barHeight = maxVal > 0 ? (val / maxVal) * chartHeight : 0;
            const x = padLeft + idx * slotWidth + (slotWidth - barWidth) / 2;
            const y = padTop + chartHeight - barHeight;

            // X-axis label display: for month (30 days), only show every 3rd-5th day or 1st, 5th, 10th
            const showXLabel =
              count <= 14 ||
              idx === 0 ||
              (idx + 1) % 5 === 0 ||
              idx === count - 1;

            return (
              <g
                key={metric.date}
                role="graphics-symbol"
                tabIndex={0}
                aria-label={`${metric.shortDateLabel}: ${val}${metricMode === 'habits' ? '%' : ' tasks'}`}
              >
                <title>
                  {metric.shortDateLabel}: {val}
                  {metricMode === 'habits'
                    ? `% (${metric.habitsCompleted}/${metric.habitsScheduled})`
                    : ' completed'}
                </title>

                {/* Base bar */}
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={Math.max(2, barHeight)}
                  rx={3}
                  className={[
                    styles.bar,
                    metricMode === 'habits' ? styles.barHabit : '',
                  ].join(' ')}
                />

                {/* Value text above bar (if week mode and value > 0) */}
                {count <= 7 && val > 0 && (
                  <text
                    x={x + barWidth / 2}
                    y={Math.max(14, y - 4)}
                    className={styles.barValueText}
                  >
                    {metricMode === 'habits' ? `${val}%` : val}
                  </text>
                )}

                {/* X-axis day label */}
                {showXLabel && (
                  <text
                    x={x + barWidth / 2}
                    y={svgHeight - 10}
                    textAnchor="middle"
                    className={styles.axisText}
                  >
                    {metric.dayLabel}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Visually-Hidden Accessible Table Alternative */}
      <table className={styles.srOnly}>
        <caption>{title} - Data Table Alternative</caption>
        <thead>
          <tr>
            <th scope="col">Date</th>
            <th scope="col">Day</th>
            <th scope="col">Tasks Completed</th>
            <th scope="col">Habits Scheduled</th>
            <th scope="col">Habits Completed</th>
            <th scope="col">Habit Completion Rate</th>
          </tr>
        </thead>
        <tbody>
          {metrics.map((m) => (
            <tr key={m.date}>
              <td>{m.date}</td>
              <td>{m.dayLabel}</td>
              <td>{m.tasksCompleted}</td>
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
