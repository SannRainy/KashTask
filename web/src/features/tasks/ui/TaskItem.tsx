import React, { useState, useRef, useEffect } from 'react';
import { Checkbox } from '@shared/ui/Checkbox';
import { IconButton } from '@shared/ui/IconButton';
import type { Task } from '../models/task';
import { deriveQuadrant } from '../models/task';
import styles from './TaskItem.module.css';

export interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onUpdate: (id: string, patch: Partial<Task>) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

export function TaskItem({
  task,
  onToggle,
  onUpdate,
  onEdit,
  onDelete,
}: TaskItemProps) {
  const [isEditingInline, setIsEditingInline] = useState(false);
  const [inlineTitle, setInlineTitle] = useState(task.title);
  const inputRef = useRef<HTMLInputElement>(null);

  const quadrant = deriveQuadrant(task);
  const isDone = task.status === 'done';

  useEffect(() => {
    if (isEditingInline) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditingInline]);

  const handleSaveInline = () => {
    const trimmed = inlineTitle.trim();
    if (trimmed && trimmed !== task.title) {
      onUpdate(task.id, { title: trimmed });
    } else {
      setInlineTitle(task.title);
    }
    setIsEditingInline(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSaveInline();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setInlineTitle(task.title);
      setIsEditingInline(false);
    }
  };

  return (
    <div
      className={[styles.item, isDone ? styles.itemDone : ''].join(' ')}
      data-testid={`task-item-${task.id}`}
    >
      <div className={styles.leftSection}>
        <Checkbox
          checked={isDone}
          onChange={() => onToggle(task.id)}
          aria-label={`Mark "${task.title}" as ${isDone ? 'incomplete' : 'complete'}`}
        />

        <div className={styles.content}>
          <div className={styles.titleRow}>
            {isEditingInline ? (
              <input
                ref={inputRef}
                className={styles.inlineEditInput}
                value={inlineTitle}
                onChange={(e) => setInlineTitle(e.target.value)}
                onBlur={handleSaveInline}
                onKeyDown={handleKeyDown}
                maxLength={120}
              />
            ) : (
              <span
                className={[styles.title, isDone ? styles.titleDone : ''].join(
                  ' '
                )}
                onClick={() => setIsEditingInline(true)}
                title="Click to edit inline"
              >
                {task.title}
              </span>
            )}
          </div>

          <div className={styles.metaRow}>
            <span className={`${styles.badge} ${styles[`badge${quadrant}`]}`}>
              {quadrant}
            </span>

            {task.dueDate && (
              <span className={styles.dueDate}>Due: {task.dueDate}</span>
            )}

            {task.notes && (
              <span className={styles.notes} title={task.notes}>
                📝{' '}
                {task.notes.length > 50
                  ? `${task.notes.slice(0, 50)}…`
                  : task.notes}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className={styles.actions}>
        <IconButton
          size="sm"
          aria-label={`Edit task "${task.title}"`}
          onClick={() => onEdit(task)}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </IconButton>

        <IconButton
          size="sm"
          aria-label={`Delete task "${task.title}"`}
          onClick={() => onDelete(task.id)}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </IconButton>
      </div>
    </div>
  );
}
