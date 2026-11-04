import React, { forwardRef } from 'react';
import styles from './Button.module.css';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  /** If provided, renders an <a> tag instead of <button>. */
  asChild?: false;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled,
      className,
      children,
      ...rest
    },
    ref
  ) {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        className={[
          styles.button,
          styles[variant],
          styles[size],
          loading ? styles.loading : '',
          className ?? '',
        ]
          .filter(Boolean)
          .join(' ')}
        disabled={isDisabled}
        aria-disabled={isDisabled || undefined}
        aria-busy={loading || undefined}
        {...rest}
      >
        {loading && <span className={styles.spinner} aria-hidden="true" />}
        <span className={styles.content}>{children}</span>
      </button>
    );
  }
);
