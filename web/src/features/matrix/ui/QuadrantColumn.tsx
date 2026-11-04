import React, { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import type { Task, Quadrant } from '@features/tasks';
import type { QuadrantDefinition } from '../models/matrix';
import { MatrixTaskCard } from './MatrixTaskCard';
import styles from './QuadrantColumn.module.css';

export interface QuadrantColumnProps {
  quadrantDef: QuadrantDefinition;
  tasks: Task[];
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onQuickAdd: (quadrant: Quadrant, title: string) => Promise<void> | void;
}

export function QuadrantColumn({
  quadrantDef,
  tasks,
  onToggleTask,
  onDeleteTask,
  onQuickAdd,
}: QuadrantColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: quadrantDef.id,
    data: {
      type: 'Quadrant',
      quadrant: quadrantDef.id,
    },
  });

  const [quickTitle, setQuickTitle] = useState('');

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const trimmed = quickTitle.trim();
      if (!trimmed) return;
      e.preventDefault();
      await onQuickAdd(quadrantDef.id, trimmed);
      setQuickTitle('');
    }
  };

  const itemIds = tasks.map((t) => t.id);

  return (
    <section
      ref={setNodeRef}
      className={[styles.column, isOver ? styles.columnOver : ''].join(' ')}
      data-testid={`quadrant-column-${quadrantDef.id}`}
      aria-label={`${quadrantDef.name} (${quadrantDef.label})`}
    >
      {/* Header with Title, Action description, and Task Count */}
      <div className={styles.header}>
        <div className={styles.titleArea}>
          <div className={styles.badgeAndTitle}>
            <span
              className={`${styles.badge} ${styles[`badge${quadrantDef.id}`]}`}
            >
              {quadrantDef.label}
            </span>
            <h2 className={styles.name}>{quadrantDef.name}</h2>
          </div>
          <span className={styles.actionSubtitle}>{quadrantDef.action}</span>
        </div>
        <span
          className={styles.countBadge}
          aria-label={`${tasks.length} tasks in ${quadrantDef.name}`}
        >
          {tasks.length}
        </span>
      </div>

      {/* Quick Add Input directly into this quadrant */}
      <input
        className={styles.quickAddInput}
        placeholder={`+ Add to ${quadrantDef.label} (Enter)...`}
        value={quickTitle}
        onChange={(e) => setQuickTitle(e.target.value)}
        onKeyDown={handleKeyDown}
        aria-label={`Quick add task to ${quadrantDef.name}`}
      />

      {/* Sortable Task List */}
      <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
        <div className={styles.tasksList} role="list">
          {tasks.length === 0 ? (
            <div className={styles.emptyState}>
              <span>No tasks here</span>
              <span style={{ fontSize: '11px', opacity: 0.7 }}>
                Drag tasks here or type above
              </span>
            </div>
          ) : (
            tasks.map((task) => (
              <MatrixTaskCard
                key={task.id}
                task={task}
                quadrant={quadrantDef.id}
                onToggle={onToggleTask}
                onDelete={onDeleteTask}
              />
            ))
          )}
        </div>
      </SortableContext>
    </section>
  );
}
