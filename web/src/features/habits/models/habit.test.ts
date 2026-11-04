import { describe, it, expect } from 'vitest';
import {
  createHabitEntity,
  HabitSchema,
  HabitLogSchema,
  HabitFrequencySchema,
} from './habit';

describe('Habit models', () => {
  const fixedClock = () => new Date('2026-11-04T10:00:00.000Z');
  const mockIdGen = () => '01HARC5B0Q8A4T5V9B11C2D3E4';

  it('creates valid daily habit entity with defaults', () => {
    const habit = createHabitEntity(
      {
        name: 'Drink 2L Water',
        frequency: { type: 'daily' },
      },
      fixedClock,
      mockIdGen
    );

    expect(habit.id).toBe('01HARC5B0Q8A4T5V9B11C2D3E4');
    expect(habit.name).toBe('Drink 2L Water');
    expect(habit.frequency).toEqual({ type: 'daily' });
    expect(habit.colorKey).toBe('indigo');
    expect(habit.createdAt).toBe('2026-11-04T10:00:00.000Z');
    expect(habit.archivedAt).toBeUndefined();

    // Verify HabitSchema accepts it
    expect(() => HabitSchema.parse(habit)).not.toThrow();
  });

  it('creates valid weekdays habit with reminder time and custom color', () => {
    const habit = createHabitEntity(
      {
        name: 'Go to Gym',
        frequency: { type: 'weekdays', days: [1, 3, 5] },
        reminderTime: '07:30',
        colorKey: 'emerald',
      },
      fixedClock,
      mockIdGen
    );

    expect(habit.frequency).toEqual({ type: 'weekdays', days: [1, 3, 5] });
    expect(habit.reminderTime).toBe('07:30');
    expect(habit.colorKey).toBe('emerald');
    expect(() => HabitSchema.parse(habit)).not.toThrow();
  });

  it('rejects invalid habit names or empty strings', () => {
    expect(() =>
      createHabitEntity({
        name: '   ',
        frequency: { type: 'daily' },
      })
    ).toThrow();
  });

  it('validates HabitFrequency weekdays correctly', () => {
    expect(() =>
      HabitFrequencySchema.parse({ type: 'weekdays', days: [0, 6] })
    ).not.toThrow();

    // Duplicate days rejected
    expect(() =>
      HabitFrequencySchema.parse({ type: 'weekdays', days: [1, 1] })
    ).toThrow();

    // Out of range days (0-6 allowed)
    expect(() =>
      HabitFrequencySchema.parse({ type: 'weekdays', days: [7] })
    ).toThrow();

    // Empty days rejected
    expect(() =>
      HabitFrequencySchema.parse({ type: 'weekdays', days: [] })
    ).toThrow();
  });

  it('validates HabitLog schema', () => {
    const validLog = {
      habitId: '01HARC5B0Q8A4T5V9B11C2D3E4',
      date: '2026-11-04',
    };
    expect(() => HabitLogSchema.parse(validLog)).not.toThrow();

    // Invalid date format
    expect(() =>
      HabitLogSchema.parse({
        habitId: '01HARC5B0Q8A4T5V9B11C2D3E4',
        date: '2026/11/04',
      })
    ).toThrow();
  });
});
