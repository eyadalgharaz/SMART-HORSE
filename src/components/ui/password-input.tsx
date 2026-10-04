'use client';

import { forwardRef, useId, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/cn';
import type { InputProps } from './input';

/** Text input with a show/hide toggle. The toggle is a real button, not an icon. */
export const PasswordInput = forwardRef<HTMLInputElement, InputProps>(function PasswordInput(
  { className, invalid, ...props },
  ref,
) {
  const [visible, setVisible] = useState(false);
  const id = useId();

  return (
    <div className="relative">
      <input
        ref={ref}
        type={visible ? 'text' : 'password'}
        aria-invalid={invalid || undefined}
        aria-describedby={`${id}-toggle`}
        className={cn('sh-field pr-11', invalid && 'border-danger-500', className)}
        {...props}
      />
      <button
        type="button"
        id={`${id}-toggle`}
        onClick={() => setVisible((v) => !v)}
        className="hover:text-ink absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-md text-stone-500"
      >
        {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        <span className="sr-only">{visible ? 'Hide password' : 'Show password'}</span>
      </button>
    </div>
  );
});
