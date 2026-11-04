import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Checkbox } from '@shared/ui/Checkbox';
import { IconButton } from '@shared/ui/IconButton';
import type { Task, Quadrant } from '@features/tasks';
import styles from './MatrixTaskCard.module.css';

export interface MatrixTaskCardProps {
  task: Task;
  quadrant: Quadrant;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  isOverlay?: boolean;
}

export function MatrixTaskCard({
  task,
  quadrant,
  onToggle,
  onDelete,
  isOverlay = false,
}: MatrixTaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: 'Task',
      task,
      quadrant,
    },
    disabled: isOverlay,
  });

  const style: React.CSSProperties = {
    // Restrict animations strictly to transform and opacity
    transform: CSS.Transform.toString(transform),
    transition: transition || undefined,
  };

  const isDone = task.status === 'done';

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={[
        styles.card,
        isDragging ? styles.cardDragging : '',
        isDone ? styles.cardDone : '',
        isOverlay ? styles.overlay : '',
      ].join(' ')}
      data-testid={`matrix-card-${task.id}`}
    >
      <div className={styles.leftSection}>
        {/* Accessible Drag Handle */}
        <button
          type="button"
          className={styles.dragHandle}
          aria-label={`Drag task "${task.title}". Press Space to grab and arrow keys to move.`}
          {...attributes}
          {...listeners}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <circle cx="9" cy="6" r="1.5" fill="currentColor" />
            <circle cx="15" cy="6" r="1.5" fill="currentColor" />
            <circle cx="9" cy="12" r="1.5" fill="currentColor" />
            <circle cx="15" cy="12" r="1.5" fill="currentColor" />
            <circle cx="9" cy="18" r="1.5" fill="currentColor" />
            <circle cx="15" cy="18" r="1.5" fill="currentColor" />
          </svg>
        </button>

        <Checkbox
          checked={isDone}
          onChange={() => onToggle(task.id)}
          aria-label={`Mark "${task.title}" as ${isDone ? 'incomplete' : 'complete'}`}
        />

        <div className={styles.content}>
          <span
            className={[styles.title, isDone ? styles.titleDone : ''].join(' ')}
          >
            {task.title}
          </span>
          {task.dueDate && (
            <span className={styles.meta}>Due: {task.dueDate}</span>
          )}
        </div>
      </div>

      {!isOverlay && (
        <div className={styles.actions}>
          <IconButton
            size="sm"
            aria-label={`Delete task "${task.title}"`}
            onClick={() => onDelete(task.id)}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M18 6L6 18M6 6l12 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </IconButton>
        </div>
      )}
    </div>
  );
}
