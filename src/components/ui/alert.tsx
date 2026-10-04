import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

type Tone = 'error' | 'success' | 'info';

const tones: Record<Tone, string> = {
  error: 'border-danger-500/30 bg-danger-50 text-danger-700',
  success: 'border-success-600/30 bg-success-50 text-success-600',
  info: 'border-stone-300 bg-stone-100 text-ink-soft',
};

/** Short status message. Uses a live region so it is announced when it appears. */
export function Alert({
  tone = 'info',
  title,
  children,
}: {
  tone?: Tone;
  title?: string;
  children?: ReactNode;
}) {
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={cn('rounded-md border px-3 py-2.5 text-sm', tones[tone])}
    >
      {title ? <p className="font-medium">{title}</p> : null}
      {children ? <div className={title ? 'mt-0.5' : undefined}>{children}</div> : null}
    </div>
  );
}
