import { useId, type ReactElement, cloneElement } from 'react';

interface FormFieldProps {
  label: string;
  /** Message shown below the control. Also marks the control invalid. */
  error?: string;
  hint?: string;
  children: ReactElement<{
    id?: string;
    invalid?: boolean;
    'aria-describedby'?: string;
    required?: boolean;
  }>;
  required?: boolean;
}

/**
 * Label + control + message, wired together for screen readers.
 * Errors are conveyed by text and an icon-free message, never by colour alone.
 */
export function FormField({ label, error, hint, children, required }: FormFieldProps) {
  const id = useId();
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const describedBy = [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(' ');

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-ink-soft block text-sm font-medium">
        {label}
        {required ? (
          <span className="ms-0.5 text-stone-500" aria-hidden="true">
            *
          </span>
        ) : null}
      </label>
      {cloneElement(children, {
        id,
        required,
        invalid: Boolean(error),
        'aria-describedby': describedBy || undefined,
      })}
      {hint ? (
        <p id={hintId} className="text-xs text-stone-600">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="text-danger-700 text-sm">
          {error}
        </p>
      ) : null}
    </div>
  );
}
