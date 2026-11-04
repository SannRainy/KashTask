import { getTodayDateString } from '@core/clock';
import { addDays } from '../logic/dateUtils';
import { getWeekStrip } from '../logic/habitOperations';
import styles from './WeekStrip.module.css';

export interface WeekStripProps {
  selectedDate: string;
  onSelectDate: (date: string) => void;
  weekStartsOn?: 0 | 1;
}

export function WeekStrip({
  selectedDate,
  onSelectDate,
  weekStartsOn = 1,
}: WeekStripProps) {
  const todayStr = getTodayDateString();
  const weekDays = getWeekStrip(selectedDate, weekStartsOn);

  // Month & year label from middle day of strip
  const midDay = weekDays[3] || weekDays[0];
  const [year] = midDay.date.split('-');
  const monthYearLabel = `${midDay.monthName} ${year}`;

  const handlePrevWeek = () => {
    onSelectDate(addDays(selectedDate, -7));
  };

  const handleNextWeek = () => {
    onSelectDate(addDays(selectedDate, 7));
  };

  const handleToday = () => {
    onSelectDate(todayStr);
  };

  return (
    <div className={styles.container} aria-label="Weekly Calendar Strip">
      <div className={styles.header}>
        <span className={styles.monthLabel}>{monthYearLabel}</span>

        <div className={styles.navControls}>
          <button
            type="button"
            className={styles.todayBtn}
            onClick={handleToday}
            aria-label="Jump to today"
          >
            Today
          </button>
          <button
            type="button"
            className={styles.navBtn}
            onClick={handlePrevWeek}
            aria-label="Previous week"
          >
            ←
          </button>
          <button
            type="button"
            className={styles.navBtn}
            onClick={handleNextWeek}
            aria-label="Next week"
          >
            →
          </button>
        </div>
      </div>

      <div
        className={styles.stripGrid}
        role="tablist"
        aria-label="Days of the week"
      >
        {weekDays.map((day) => {
          const isSelected = day.date === selectedDate;
          return (
            <button
              key={day.date}
              type="button"
              role="tab"
              aria-selected={isSelected}
              className={[
                styles.dayCard,
                isSelected ? styles.dayCardSelected : '',
              ].join(' ')}
              onClick={() => onSelectDate(day.date)}
              data-testid={`week-strip-day-${day.date}`}
            >
              <span className={styles.dayName}>{day.shortDayName}</span>
              <span className={styles.dayNum}>{day.dayNumber}</span>
              {day.isToday && (
                <span className={styles.todayIndicator} title="Today" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
