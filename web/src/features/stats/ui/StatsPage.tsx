import { useState } from 'react';
import { useTasks } from '@features/tasks';
import { useHabits } from '@features/habits';
import { useSettings } from '@features/settings';
import { getTodayDateString } from '@core/clock';
import { EmptyState } from '@shared/ui/EmptyState';
import type { PeriodType } from '../models/stats';
import { navigatePeriod } from '../logic/statsPeriodUtils';
import { selectPeriodStats } from '../logic/statsSelectors';
import { PeriodSelector } from './PeriodSelector';
import { SummaryCards } from './SummaryCards';
import { BarChart } from './BarChart';
import { HabitHeatmap } from './HabitHeatmap';
import { QuadrantBreakdown } from './QuadrantBreakdown';
import styles from './StatsPage.module.css';

export function StatsPage() {
  const { allTasks } = useTasks();
  const { habits, logs } = useHabits();
  const { weekStartsOn } = useSettings();

  const [periodType, setPeriodType] = useState<PeriodType>('week');
  const [referenceDate, setReferenceDate] = useState<string>(() =>
    getTodayDateString()
  );

  const stats = selectPeriodStats({
    tasks: allTasks,
    habits,
    logs,
    periodType,
    referenceDate,
    weekStartsOn,
  });

  const handlePrev = () => {
    setReferenceDate((prev) => navigatePeriod(prev, periodType, 'prev'));
  };

  const handleNext = () => {
    setReferenceDate((prev) => navigatePeriod(prev, periodType, 'next'));
  };

  const handleCurrent = () => {
    setReferenceDate(getTodayDateString());
  };

  const hasData = allTasks.length > 0 || habits.length > 0;

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Productivity Statistics</h1>
        <p className={styles.subtitle}>
          Weekly and monthly insights into your task completion, habits, and
          matrix balance.
        </p>
      </header>

      {!hasData ? (
        <EmptyState
          icon="📊"
          title="No activity recorded yet"
          description="Create tasks and build daily habits to see charts, consistency rates, and productivity streaks here."
        />
      ) : (
        <>
          {/* Period Selector & Navigation */}
          <PeriodSelector
            periodType={periodType}
            label={stats.range.label}
            onPeriodTypeChange={setPeriodType}
            onPrev={handlePrev}
            onNext={handleNext}
            onCurrent={handleCurrent}
          />

          {/* Key Metrics Summary Cards */}
          <SummaryCards stats={stats} />

          {/* Interactive Bar Chart */}
          <div className={styles.chartsGrid}>
            <BarChart
              metrics={stats.dailyMetrics}
              title={
                periodType === 'week'
                  ? 'Daily Activity in Selected Week'
                  : 'Daily Activity in Selected Month'
              }
            />

            {/* Monthly Habit Heatmap */}
            {periodType === 'month' && (
              <HabitHeatmap
                metrics={stats.dailyMetrics}
                startDate={stats.range.startDate}
                weekStartsOn={weekStartsOn}
              />
            )}

            {/* Eisenhower Matrix Distribution */}
            <QuadrantBreakdown distribution={stats.quadrantDistribution} />
          </div>
        </>
      )}
    </main>
  );
}
