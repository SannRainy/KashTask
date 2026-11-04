import React, { useState, useEffect } from 'react';
import { Dialog } from '@shared/ui/Dialog';
import { Button } from '@shared/ui/Button';
import { Input } from '@shared/ui/Input';
import { Checkbox } from '@shared/ui/Checkbox';
import type { CreateTaskInput, Task } from '../models/task';
import { deriveQuadrant } from '../models/task';
import styles from './TaskForm.module.css';

export interface TaskFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateTaskInput) => Promise<void> | void;
  initialTask?: Task | null;
}

export function TaskForm({
  open,
  onClose,
  onSubmit,
  initialTask,
}: TaskFormProps) {
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [urgent, setUrgent] = useState(false);
  const [important, setImportant] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      if (initialTask) {
        setTitle(initialTask.title);
        setNotes(initialTask.notes ?? '');
        setDueDate(initialTask.dueDate ?? '');
        setUrgent(initialTask.urgent);
        setImportant(initialTask.important);
      } else {
        setTitle('');
        setNotes('');
        setDueDate('');
        setUrgent(false);
        setImportant(false);
      }
      setError(null);
      setIsSubmitting(false);
    }
  }, [open, initialTask]);

  const quadrant = deriveQuadrant(urgent, important);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      setError('Title is required');
      return;
    }
    if (trimmedTitle.length > 120) {
      setError('Title cannot exceed 120 characters');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit({
        title: trimmedTitle,
        notes: notes.trim() || undefined,
        dueDate: dueDate || undefined,
        urgent,
        important,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save task');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // If Enter pressed outside textarea, submit
    if (e.key === 'Enter' && (e.target as HTMLElement).tagName !== 'TEXTAREA') {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={initialTask ? 'Edit Task' : 'New Task'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={() => handleSubmit()}
            loading={isSubmitting}
          >
            {initialTask ? 'Save Changes' : 'Create Task'}
          </Button>
        </>
      }
    >
      <form
        className={styles.form}
        onSubmit={handleSubmit}
        onKeyDown={handleKeyDown}
      >
        <Input
          label="Title"
          placeholder="What needs to be done?"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (error) setError(null);
          }}
          error={error ?? undefined}
          autoFocus
          maxLength={120}
        />

        <div className={styles.textareaField}>
          <label htmlFor="task-notes" className={styles.label}>
            Notes (optional)
          </label>
          <textarea
            id="task-notes"
            className={styles.textarea}
            placeholder="Add context, links, or sub-details..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
          />
        </div>

        <Input
          label="Due Date (optional)"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />

        <div className={styles.togglesRow}>
          <div className={styles.checkboxGroup}>
            <Checkbox
              label="Urgent"
              checked={urgent}
              onChange={(e) => setUrgent(e.target.checked)}
            />
            <Checkbox
              label="Important"
              checked={important}
              onChange={(e) => setImportant(e.target.checked)}
            />
          </div>

          <div
            className={`${styles.previewBadge} ${styles[`badge${quadrant}`]}`}
            title={`Assigned quadrant: ${quadrant}`}
          >
            Quadrant: {quadrant}
          </div>
        </div>
      </form>
    </Dialog>
  );
}
