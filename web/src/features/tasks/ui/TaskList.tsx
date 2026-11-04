import React, { useState } from 'react';
import { Button } from '@shared/ui/Button';
import { EmptyState } from '@shared/ui/EmptyState';
import { useToastSafe } from '@shared/ui/Toast';
import type { CreateTaskInput, Quadrant, Task } from '../models/task';
import type { TaskFilter } from '../logic/taskOperations';
import { useTasks } from '../logic/useTasks';
import { TaskItem } from './TaskItem';
import { TaskForm } from './TaskForm';
import styles from './TaskList.module.css';

const QUADRANTS: Array<Quadrant | 'all'> = [
  'all',
  'DO',
  'SCHEDULE',
  'DELEGATE',
  'ELIMINATE',
];

export function TaskList() {
  const {
    tasks,
    allTasks,
    filter,
    quadrant,
    addTask,
    updateTask,
    toggleTask,
    deleteTask,
    setFilter,
    setQuadrant,
  } = useTasks();

  const { addToast } = useToastSafe();

  const [quickTitle, setQuickTitle] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Counts
  const totalCount = allTasks.length;
  const activeCount = allTasks.filter((t) => t.status === 'todo').length;
  const doneCount = allTasks.filter((t) => t.status === 'done').length;

  const handleQuickAdd = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const trimmed = quickTitle.trim();
      if (!trimmed) return;
      e.preventDefault();
      try {
        await addTask({ title: trimmed });
        setQuickTitle('');
      } catch {
        // Error is set in store
      }
    }
  };

  const handleFormSubmit = async (data: CreateTaskInput) => {
    if (editingTask) {
      await updateTask(editingTask.id, data);
    } else {
      await addTask(data);
    }
    setEditingTask(null);
  };

  const handleDeleteWithUndo = async (id: string) => {
    try {
      const { task, undo } = await deleteTask(id);
      addToast(
        <span>
          Task &quot;{task.title}&quot; deleted.{' '}
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

  const openNewForm = () => {
    setEditingTask(null);
    setIsFormOpen(true);
  };

  const openEditForm = (task: Task) => {
    setEditingTask(task);
    setIsFormOpen(true);
  };

  return (
    <section className={styles.container}>
      {/* Quick Add Bar */}
      <div className={styles.quickAddRow}>
        <input
          className={styles.quickAddInput}
          placeholder="Add a new task (press Enter)..."
          value={quickTitle}
          onChange={(e) => setQuickTitle(e.target.value)}
          onKeyDown={handleQuickAdd}
          aria-label="Quick add task"
        />
        <Button variant="primary" onClick={openNewForm}>
          + New Task
        </Button>
      </div>

      {/* Filter and Quadrant Tabs */}
      <div className={styles.filterBar}>
        <div
          className={styles.statusTabs}
          role="tablist"
          aria-label="Task Status Filters"
        >
          {(
            [
              { id: 'all', label: `All (${totalCount})` },
              { id: 'active', label: `Active (${activeCount})` },
              { id: 'done', label: `Done (${doneCount})` },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={filter === tab.id}
              className={[
                styles.tab,
                filter === tab.id ? styles.tabActive : '',
              ].join(' ')}
              onClick={() => setFilter(tab.id as TaskFilter)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className={styles.quadrantChips} aria-label="Quadrant Filters">
          {QUADRANTS.map((q) => (
            <button
              key={q}
              className={[
                styles.chip,
                quadrant === q ? styles.chipActive : '',
              ].join(' ')}
              onClick={() => setQuadrant(q)}
            >
              {q === 'all' ? 'All Quadrants' : q}
            </button>
          ))}
        </div>
      </div>

      {/* Task List or Empty State */}
      {tasks.length === 0 ? (
        <EmptyState
          icon="📋"
          title={
            totalCount === 0 ? 'No tasks yet' : 'No tasks match current filter'
          }
          description={
            totalCount === 0
              ? 'Stay focused and organize your priorities with the Eisenhower Matrix.'
              : 'Try selecting a different filter or adding a new task.'
          }
          action={
            <Button size="sm" variant="secondary" onClick={openNewForm}>
              Create Task
            </Button>
          }
        />
      ) : (
        <div className={styles.list} role="list" aria-label="Tasks">
          {tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={toggleTask}
              onUpdate={updateTask}
              onEdit={openEditForm}
              onDelete={handleDeleteWithUndo}
            />
          ))}
        </div>
      )}

      {/* Dialog Form */}
      <TaskForm
        open={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingTask(null);
        }}
        onSubmit={handleFormSubmit}
        initialTask={editingTask}
      />
    </section>
  );
}
