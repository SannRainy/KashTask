import React from 'react';
import styles from './EmptyState.module.css';

export interface EmptyStateProps {
  /** Icon element (emoji, SVG, or component). */
  icon?: React.ReactNode;
  title: string;
  description?: string;
  /** Optional action (e.g. a Button). */
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={[styles.emptyState, className ?? ''].filter(Boolean).join(' ')}
      role="status"
      aria-label={title}
    >
      {icon && (
        <div className={styles.iconSlot} aria-hidden="true">
          {icon}
        </div>
      )}
      <h3 className={styles.title}>{title}</h3>
      {description && <p className={styles.description}>{description}</p>}
      {action && <div className={styles.action}>{action}</div>}
    </div>
  );
}
