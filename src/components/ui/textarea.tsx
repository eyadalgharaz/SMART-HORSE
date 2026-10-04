import { forwardRef, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean };

/**
 * Multi-line field, styled with the same token as `Input` and `Select` so the
 * three line up in a form. It takes the same `invalid` prop, which is what
 * `FormField` sets when it has an error to show.
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className, invalid, ...props },
  ref,
) {
  return (
    <textarea
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn('sh-field', invalid && 'border-danger-500', className)}
      {...props}
    />
  );
});
