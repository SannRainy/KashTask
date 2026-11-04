import React, { forwardRef } from 'react';
import styles from './IconButton.module.css';

export type IconButtonSize = 'sm' | 'md' | 'lg';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Accessible label — required for screen readers. */
  'aria-label': string;
  size?: IconButtonSize;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton({ size = 'md', className, children, ...rest }, ref) {
    return (
      <button
        ref={ref}
        type="button"
        className={[styles.iconButton, styles[size], className ?? '']
          .filter(Boolean)
          .join(' ')}
        {...rest}
      >
        {children}
      </button>
    );
  }
);
