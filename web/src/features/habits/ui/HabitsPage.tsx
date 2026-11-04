import { useState } from 'react';
import { Button } from '@shared/ui/Button';
import { EmptyState } from '@shared/ui/EmptyState';
import { useToastSafe } from '@shared/ui/Toast';
import { useSettings } from '@features/settings';
import type { CreateHabitInput, Habit } from '../models/habit';
import { useHabits } from '../logic/useHabits';
import { getWeekStrip } from '../logic/habitOperations';
import { WeekStrip } from './WeekStrip';
import { HabitItem } from './HabitItem';
import { HabitForm } from './HabitForm';
import styles from './HabitsPage.module.css';

export function HabitsPage() {
  const {
    habits,
    filteredHabits,
    selectedDate,
    filter,
    addHabit,
    updateHabit,
    archiveHabit,
    unarchiveHabit,
    deleteHabit,
    toggleHabitDay,
    setSelectedDate,
    setFilter,
    isCompletedOn,
    getStreak,
  } = useHabits();

  const { weekStartsOn } = useSettings();
  const { addToast } = useToastSafe();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

  // Counts
  const activeCount = habits.filter((h) => !h.archivedAt).length;
  const archivedCount = habits.filter((h) => Boolean(h.archivedAt)).length;
  const totalCount = habits.length;

  const weekDays = getWeekStrip(selectedDate, weekStartsOn);

  const handleOpenCreate = () => {
    setEditingHabit(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (habit: Habit) => {
    setEditingHabit(habit);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (input: CreateHabitInput) => {
    if (editingHabit) {
      await updateHabit(editingHabit.id, input);
    } else {
      await addHabit(input);
    }
    setEditingHabit(null);
  };

  const handleArchive = async (habitId: string) => {
    try {
      const { habit, undo } = await archiveHabit(habitId);
      addToast(
        <span>
          Habit &quot;{habit.name}&quot; archived.{' '}
          <button
            type="button"
            className={styles.undoToastAction}
            onClick={() => {
              void undo();
            }}
          >
            Undo
          </button>
        </span>,
        'info',
        6000
      );
    } catch {
      // Handled in store
    }
  };

  const handleDelete = async (habitId: string) => {
    try {
      const { habit, undo } = await deleteHabit(habitId);
      addToast(
        <span>
          Habit &quot;{habit.name}&quot; deleted.{' '}
          <button
            type="button"
            className={styles.undoToastAction}
            onClick={() => {
              void undo();
            }}
          >
            Undo
          </button>
        </span>,
        'info',
        6000
      );
    } catch {
      // Handled in store
    }
  };

  return (
    <main className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Habits</h1>
          <p className={styles.subtitle}>
            Build lasting routines and track your daily streaks.
          </p>
        </div>

        <Button variant="primary" onClick={handleOpenCreate}>
          + New Habit
        </Button>
      </header>

      {/* Week Calendar Strip */}
      <WeekStrip
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        weekStartsOn={weekStartsOn}
      />

      {/* Filter Tabs */}
      <div className={styles.controlsRow}>
        <div
          className={styles.filterTabs}
          role="tablist"
          aria-label="Habit filters"
        >
          <button
            type="button"
            role="tab"
            aria-selected={filter === 'active'}
            className={[
              styles.tabBtn,
              filter === 'active' ? styles.tabBtnActive : '',
            ].join(' ')}
            onClick={() => setFilter('active')}
          >
            Active <span className={styles.countBadge}>{activeCount}</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={filter === 'archived'}
            className={[
              styles.tabBtn,
              filter === 'archived' ? styles.tabBtnActive : '',
            ].join(' ')}
            onClick={() => setFilter('archived')}
          >
            Archived <span className={styles.countBadge}>{archivedCount}</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={filter === 'all'}
            className={[
              styles.tabBtn,
              filter === 'all' ? styles.tabBtnActive : '',
            ].join(' ')}
            onClick={() => setFilter('all')}
          >
            All <span className={styles.countBadge}>{totalCount}</span>
          </button>
        </div>
      </div>

      {/* Habit List */}
      <div className={styles.habitsList}>
        {filteredHabits.length === 0 ? (
          <EmptyState
            icon="🌱"
            title={
              filter === 'archived' ? 'No archived habits' : 'No habits found'
            }
            description={
              filter === 'archived'
                ? 'Archived habits will appear here when you archive them.'
                : 'Create your first daily routine to begin tracking streaks!'
            }
            action={
              filter !== 'archived' ? (
                <Button variant="primary" onClick={handleOpenCreate}>
                  Create First Habit
                </Button>
              ) : undefined
            }
          />
        ) : (
          filteredHabits.map((habit) => {
            const isDone = isCompletedOn(habit.id, selectedDate);
            const streak = getStreak(habit);

            return (
              <HabitItem
                key={habit.id}
                habit={habit}
                selectedDate={selectedDate}
                isCompleted={isDone}
                streak={streak}
                weekDays={weekDays}
                onToggle={toggleHabitDay}
                onEdit={handleOpenEdit}
                onArchive={handleArchive}
                onUnarchive={unarchiveHabit}
                onDelete={handleDelete}
                isCompletedOnDate={isCompletedOn}
              />
            );
          })
        )}
      </div>

      {/* Create / Edit Habit Dialog Modal */}
      <HabitForm
        isOpen={isFormOpen}
        habit={editingHabit}
        onClose={() => {
          setIsFormOpen(false);
          setEditingHabit(null);
        }}
        onSubmit={handleFormSubmit}
      />
    </main>
  );
}
