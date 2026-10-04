import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

type Tone = 'neutral' | 'pasture' | 'warning' | 'danger' | 'success';

const tones: Record<Tone, string> = {
  neutral: 'bg-stone-100 text-stone-700',
  pasture: 'bg-pasture-50 text-pasture-700',
  warning: 'bg-warning-50 text-warning-600',
  danger: 'bg-danger-50 text-danger-700',
  success: 'bg-success-50 text-success-600',
};

/**
 * Status label. Colour is never the only signal: pair a tone with readable text
 * and, for statuses that matter, an `icon`.
 */
export function Badge({
  tone = 'neutral',
  icon,
  children,
}: {
  tone?: Tone;
  /** Decorative glyph shown before the label; keep it `aria-hidden`. */
  icon?: ReactNode;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs font-medium whitespace-nowrap',
        tones[tone],
      )}
    >
      {icon}
      {children}
    </span>
  );
}
