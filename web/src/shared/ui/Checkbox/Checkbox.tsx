import React, { forwardRef, useId } from 'react';
import styles from './Checkbox.module.css';

export interface CheckboxProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'type'
> {
  /** Label displayed next to the checkbox. */
  label?: React.ReactNode;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  function Checkbox({ label, className, id: idProp, ...rest }, ref) {
    const generatedId = useId();
    const id = idProp ?? generatedId;

    return (
      <label
        htmlFor={id}
        className={[styles.wrapper, className ?? ''].filter(Boolean).join(' ')}
      >
        <input
          ref={ref}
          id={id}
          type="checkbox"
          className={styles.input}
          {...rest}
        />
        <span className={styles.box} aria-hidden="true">
          {/* Animated SVG checkmark */}
          <svg
            className={styles.checkmark}
            width="10"
            height="8"
            viewBox="0 0 10 8"
            fill="none"
            aria-hidden="true"
          >
            <path
              className={styles.checkmarkPath}
              d="M1 4L3.5 6.5L9 1"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        {label && <span className={styles.label}>{label}</span>}
      </label>
    );
  }
);
