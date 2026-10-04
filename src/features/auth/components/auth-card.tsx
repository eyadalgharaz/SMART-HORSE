import type { ReactNode } from 'react';
import { Brand } from '@/components/layout/brand';
import { cn } from '@/lib/cn';

/** Shared frame for the four authentication screens. */
export function AuthCard({
  title,
  description,
  children,
  footer,
  maxWidth = 'max-w-sm',
}: {
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  /**
   * Card width. Login/Forgot/Reset stay at the default `max-w-sm` so the four
   * auth screens keep a consistent frame; Register alone passes a wider value
   * so its role cards have room to sit two-across instead of cramping into a
   * single narrow column.
   */
  maxWidth?: string;
}) {
  return (
    <div className={cn('w-full', maxWidth)}>
      <Brand className="mb-8" />
      <div className="rounded-card border border-stone-200 bg-white px-6 py-7">
        <h1 className="text-xl font-semibold">{title}</h1>
        {description ? <p className="mt-1 text-sm text-stone-600">{description}</p> : null}
        <div className="mt-6">{children}</div>
      </div>
      {footer ? <div className="mt-5 text-center text-sm text-stone-600">{footer}</div> : null}
    </div>
  );
}
