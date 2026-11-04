import { Checkbox } from '@shared/ui/Checkbox';
import { IconButton } from '@shared/ui/IconButton';
import type { Habit, HabitColorKey } from '../models/habit';
import { HABIT_COLORS } from '../models/habit';
import type { StreakResult, WeekStripDay } from '../logic/habitOperations';
import styles from './HabitItem.module.css';

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export interface HabitItemProps {
  habit: Habit;
  selectedDate: string;
  isCompleted: boolean;
  streak: StreakResult;
  weekDays?: WeekStripDay[];
  onToggle: (habitId: string, date: string) => void;
  onEdit: (habit: Habit) => void;
  onArchive: (habitId: string) => void;
  onUnarchive?: (habitId: string) => void;
  onDelete: (habitId: string) => void;
  isCompletedOnDate?: (habitId: string, date: string) => boolean;
}

export function HabitItem({
  habit,
  selectedDate,
  isCompleted,
  streak,
  weekDays = [],
  onToggle,
  onEdit,
  onArchive,
  onUnarchive,
  onDelete,
  isCompletedOnDate,
}: HabitItemProps) {
  const isArchived = Boolean(habit.archivedAt);
  const colorDef =
    HABIT_COLORS[habit.colorKey as HabitColorKey] || HABIT_COLORS.indigo;

  // Format frequency label
  let freqLabel = 'Daily';
  if (habit.frequency.type === 'weekdays') {
    freqLabel = habit.frequency.days.map((d) => DAY_LABELS[d]).join(', ');
  }

  return (
    <div
      className={[styles.item, isArchived ? styles.itemArchived : ''].join(' ')}
      data-testid={`habit-item-${habit.id}`}
    >
      <div
        className={styles.colorStrip}
        style={{ backgroundColor: colorDef.value }}
      />

      <div className={styles.leftSection}>
        {!isArchived && (
          <Checkbox
            checked={isCompleted}
            onChange={() => onToggle(habit.id, selectedDate)}
            aria-label={`Toggle "${habit.name}" for ${selectedDate}`}
          />
        )}

        <div className={styles.content}>
          <div className={styles.nameRow}>
            <h3
              className={[
                styles.name,
                isCompleted && !isArchived ? styles.nameCompleted : '',
              ].join(' ')}
            >
              {habit.name}
            </h3>
          </div>

          <div className={styles.metaRow}>
            <span className={styles.metaBadge}>{freqLabel}</span>
            {habit.reminderTime && (
              <span className={styles.metaBadge} title="Reminder time">
                ⏰ {habit.reminderTime}
              </span>
            )}
            {isArchived && (
              <span
                className={styles.metaBadge}
                style={{ color: 'var(--color-text-muted)' }}
              >
                Archived
              </span>
            )}
          </div>
        </div>
      </div>

      <div className={styles.rightSection}>
        {/* Streak Badge */}
        <span
          className={[
            styles.streakBadge,
            streak.current === 0 ? styles.streakZero : '',
          ].join(' ')}
          title={`Current: ${streak.current} days, Best: ${streak.longest} days`}
          data-testid={`streak-badge-${habit.id}`}
        >
          🔥 {streak.current}
        </span>

        {/* 7-day mini-dots */}
        {weekDays.length > 0 && isCompletedOnDate && (
          <div
            className={styles.miniWeekDots}
            aria-label="7-day completion overview"
          >
            {weekDays.map((d) => {
              const done = isCompletedOnDate(habit.id, d.date);
              return (
                <span
                  key={d.date}
                  className={[
                    styles.miniDot,
                    done ? styles.miniDotCompleted : '',
                  ].join(' ')}
                  style={done ? { backgroundColor: colorDef.value } : undefined}
                  title={`${d.shortDayName} ${d.dayNumber}: ${done ? 'Completed' : 'Not completed'}`}
                />
              );
            })}
          </div>
        )}

        {/* Action buttons */}
        <div className={styles.actions}>
          {!isArchived && (
            <IconButton
              size="sm"
              onClick={() => onEdit(habit)}
              aria-label={`Edit ${habit.name}`}
            >
              ✎
            </IconButton>
          )}

          {isArchived ? (
            <IconButton
              size="sm"
              onClick={() => onUnarchive?.(habit.id)}
              aria-label={`Restore ${habit.name}`}
              title="Restore"
            >
              ↺
            </IconButton>
          ) : (
            <IconButton
              size="sm"
              onClick={() => onArchive(habit.id)}
              aria-label={`Archive ${habit.name}`}
              title="Archive"
            >
              📥
            </IconButton>
          )}

          <IconButton
            size="sm"
            onClick={() => onDelete(habit.id)}
            aria-label={`Delete ${habit.name}`}
            title="Delete"
          >
            ✕
          </IconButton>
        </div>
      </div>
    </div>
  );
}
