import type { PeriodType } from '../models/stats';
import styles from './PeriodSelector.module.css';

export interface PeriodSelectorProps {
  periodType: PeriodType;
  label: string;
  onPeriodTypeChange: (type: PeriodType) => void;
  onPrev: () => void;
  onNext: () => void;
  onCurrent: () => void;
}

export function PeriodSelector({
  periodType,
  label,
  onPeriodTypeChange,
  onPrev,
  onNext,
  onCurrent,
}: PeriodSelectorProps) {
  return (
    <div className={styles.container} aria-label="Period Controls">
      {/* Week vs Month Switcher */}
      <div
        className={styles.typeGroup}
        role="radiogroup"
        aria-label="Select period type"
      >
        <button
          type="button"
          role="radio"
          aria-checked={periodType === 'week'}
          className={[
            styles.typeBtn,
            periodType === 'week' ? styles.typeBtnActive : '',
          ].join(' ')}
          onClick={() => onPeriodTypeChange('week')}
        >
          Week
        </button>
        <button
          type="button"
          role="radio"
          aria-checked={periodType === 'month'}
          className={[
            styles.typeBtn,
            periodType === 'month' ? styles.typeBtnActive : '',
          ].join(' ')}
          onClick={() => onPeriodTypeChange('month')}
        >
          Month
        </button>
      </div>

      {/* Navigation and Current Range Label */}
      <div className={styles.navGroup}>
        <button
          type="button"
          className={styles.currentBtn}
          onClick={onCurrent}
          aria-label="Jump to current period"
        >
          Current
        </button>
        <button
          type="button"
          className={styles.navBtn}
          onClick={onPrev}
          aria-label={`Previous ${periodType}`}
        >
          ←
        </button>
        <span className={styles.label} aria-live="polite">
          {label}
        </span>
        <button
          type="button"
          className={styles.navBtn}
          onClick={onNext}
          aria-label={`Next ${periodType}`}
        >
          →
        </button>
      </div>
    </div>
  );
}
