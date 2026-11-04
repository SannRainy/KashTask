import React, { forwardRef, useId } from 'react';
import styles from './Input.module.css';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Visible label rendered above the input. */
  label?: string;
  /** Supplementary text below the input. */
  helperText?: string;
  /** Error message — replaces helperText and applies error styles. */
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, helperText, error, className, id: idProp, ...rest },
  ref
) {
  const generatedId = useId();
  const id = idProp ?? generatedId;
  const descId = `${id}-desc`;
  const hasError = Boolean(error);

  return (
    <div className={styles.field}>
      {label && (
        <label htmlFor={id} className={styles.label}>
          {label}
        </label>
      )}
      <div className={styles.inputWrapper}>
        <input
          ref={ref}
          id={id}
          className={[
            styles.input,
            hasError ? styles.inputError : '',
            className ?? '',
          ]
            .filter(Boolean)
            .join(' ')}
          aria-invalid={hasError || undefined}
          aria-describedby={error || helperText ? descId : undefined}
          {...rest}
        />
      </div>
      {(error || helperText) && (
        <span
          id={descId}
          className={hasError ? styles.errorText : styles.helperText}
          role={hasError ? 'alert' : undefined}
        >
          {error ?? helperText}
        </span>
      )}
    </div>
  );
});
