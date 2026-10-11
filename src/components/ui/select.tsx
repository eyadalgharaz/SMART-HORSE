import { forwardRef, type SelectHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & { invalid?: boolean };

/**
 * Native select, styled with the same field token as `Input` so the two line up
 * in a form row. Native is deliberate: it gets platform keyboard behaviour, a
 * usable picker on phones and correct screen-reader semantics for free.
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { className, invalid, children, ...props },
  ref,
) {
  return (
    <select
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn('sh-field appearance-none pe-8', invalid && 'border-danger-500', className)}
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='none' stroke='%235d5d56' stroke-width='1.75' stroke-linecap='round' stroke-linejoin='round'><path d='M6 8l4 4 4-4'/></svg>\")",
        backgroundRepeat: 'no-repeat',
        backgroundSize: '1.25rem 1.25rem',
      }}
      {...props}
    >
      {children}
    </select>
  );
});
