import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/cn';
import { fadeInUp, hoverLift, staggerDelay } from './layout';

interface SummaryCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  /** One short supporting line. Keep it to a single fact. */
  children?: ReactNode;
  /** Position in the summary row, for a staggered entrance. */
  index?: number;
}

/**
 * One headline figure. Reads in order as "label, value, detail", which is also
 * the visual order, so screen-reader and sighted users get the same sentence.
 * The icon chip uses the forest/brass accent so the summary row reads as the
 * dashboard's premium "headline" moment without recoloring every card green.
 */
export function SummaryCard({ label, value, icon: Icon, children, index = 0 }: SummaryCardProps) {
  return (
    <li className={cn(fadeInUp, staggerDelay(index))}>
      <Card className={cn('h-full p-4 sm:p-5', hoverLift)}>
        <div className="flex items-start justify-between gap-3">
          <p className="text-sm font-medium text-stone-600">{label}</p>
          <span className="bg-forest-700 text-sand-50 flex size-9 shrink-0 items-center justify-center rounded-lg">
            <Icon className="size-4" aria-hidden="true" />
          </span>
        </div>
        <p className="text-ink mt-2 text-3xl font-semibold tracking-tight tabular-nums">{value}</p>
        {children ? (
          <p className="mt-1.5 flex items-center gap-1 text-sm text-stone-600">{children}</p>
        ) : null}
      </Card>
    </li>
  );
}
