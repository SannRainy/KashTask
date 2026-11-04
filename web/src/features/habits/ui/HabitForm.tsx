import React, { useState, useEffect } from 'react';
import { Dialog } from '@shared/ui/Dialog';
import { Button } from '@shared/ui/Button';
import { Input } from '@shared/ui/Input';
import type {
  CreateHabitInput,
  Habit,
  HabitColorKey,
  HabitFrequency,
} from '../models/habit';
import { HABIT_COLOR_KEYS, HABIT_COLORS } from '../models/habit';
import styles from './HabitForm.module.css';

const DAY_OPTIONS = [
  { day: 1, label: 'Mon' },
  { day: 2, label: 'Tue' },
  { day: 3, label: 'Wed' },
  { day: 4, label: 'Thu' },
  { day: 5, label: 'Fri' },
  { day: 6, label: 'Sat' },
  { day: 0, label: 'Sun' },
];

export interface HabitFormProps {
  isOpen: boolean;
  habit?: Habit | null;
  onClose: () => void;
  onSubmit: (input: CreateHabitInput) => Promise<void> | void;
}

export function HabitForm({
  isOpen,
  habit,
  onClose,
  onSubmit,
}: HabitFormProps) {
  const [name, setName] = useState('');
  const [freqType, setFreqType] = useState<'daily' | 'weekdays'>('daily');
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [reminderTime, setReminderTime] = useState('');
  const [colorKey, setColorKey] = useState<HabitColorKey>('indigo');
  const [errors, setErrors] = useState<{ name?: string; days?: string }>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (habit) {
      setName(habit.name);
      if (habit.frequency.type === 'daily') {
        setFreqType('daily');
        setSelectedDays([1, 2, 3, 4, 5]);
      } else {
        setFreqType('weekdays');
        setSelectedDays(habit.frequency.days);
      }
      setReminderTime(habit.reminderTime || '');
      setColorKey((habit.colorKey as HabitColorKey) || 'indigo');
    } else {
      setName('');
      setFreqType('daily');
      setSelectedDays([1, 2, 3, 4, 5]);
      setReminderTime('');
      setColorKey('indigo');
    }
    setErrors({});
  }, [habit, isOpen]);

  const toggleDay = (day: number) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter((d) => d !== day));
    } else {
      setSelectedDays([...selectedDays, day].sort());
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedName = name.trim();
    const newErrors: { name?: string; days?: string } = {};

    if (!trimmedName) {
      newErrors.name = 'Habit name is required';
    } else if (trimmedName.length > 100) {
      newErrors.name = 'Name cannot exceed 100 characters';
    }

    if (freqType === 'weekdays' && selectedDays.length === 0) {
      newErrors.days = 'Please select at least one day';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmitting(true);
    try {
      const frequency: HabitFrequency =
        freqType === 'daily'
          ? { type: 'daily' }
          : { type: 'weekdays', days: selectedDays };

      await onSubmit({
        name: trimmedName,
        frequency,
        reminderTime: reminderTime || undefined,
        colorKey,
      });
      onClose();
    } catch {
      // Error handled by store
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      title={habit ? 'Edit Habit' : 'New Habit'}
    >
      <form onSubmit={handleSubmit} className={styles.form}>
        <Input
          label="Habit Name"
          placeholder="e.g. Read 20 pages"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (errors.name)
              setErrors((prev) => ({ ...prev, name: undefined }));
          }}
          error={errors.name}
          maxLength={100}
          autoFocus
        />

        <div className={styles.fieldGroup}>
          <label className={styles.label}>Frequency</label>
          <div className={styles.segmentedControl} role="radiogroup">
            <button
              type="button"
              role="radio"
              aria-checked={freqType === 'daily'}
              className={[
                styles.segmentBtn,
                freqType === 'daily' ? styles.segmentBtnActive : '',
              ].join(' ')}
              onClick={() => setFreqType('daily')}
            >
              Daily
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={freqType === 'weekdays'}
              className={[
                styles.segmentBtn,
                freqType === 'weekdays' ? styles.segmentBtnActive : '',
              ].join(' ')}
              onClick={() => setFreqType('weekdays')}
            >
              Specific Days
            </button>
          </div>

          {freqType === 'weekdays' && (
            <div>
              <div className={styles.weekdayGrid}>
                {DAY_OPTIONS.map(({ day, label }) => {
                  const isActive = selectedDays.includes(day);
                  return (
                    <button
                      key={day}
                      type="button"
                      className={[
                        styles.dayToggle,
                        isActive ? styles.dayToggleActive : '',
                      ].join(' ')}
                      onClick={() => toggleDay(day)}
                      aria-pressed={isActive}
                      aria-label={label}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
              {errors.days && <p className={styles.errorText}>{errors.days}</p>}
            </div>
          )}
        </div>

        <div className={styles.fieldGroup}>
          <Input
            type="time"
            label="Reminder Time (24h)"
            helperText="Stored locally in web"
            value={reminderTime}
            onChange={(e) => setReminderTime(e.target.value)}
          />
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.label}>Color Theme</label>
          <div
            className={styles.colorPicker}
            role="radiogroup"
            aria-label="Color Theme"
          >
            {HABIT_COLOR_KEYS.map((key) => {
              const def = HABIT_COLORS[key];
              const isSelected = colorKey === key;
              return (
                <button
                  key={key}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  aria-label={def.label}
                  className={[
                    styles.colorSwatch,
                    isSelected ? styles.colorSwatchSelected : '',
                  ].join(' ')}
                  style={{ backgroundColor: def.value }}
                  onClick={() => setColorKey(key)}
                />
              );
            })}
          </div>
        </div>

        <div className={styles.actions}>
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={submitting}>
            {habit ? 'Save Changes' : 'Create Habit'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
