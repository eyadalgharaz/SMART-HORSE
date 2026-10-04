import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <section className={cn('rounded-card border border-stone-200 bg-white', className)}>
      {children}
    </section>
  );
}

export function CardHeader({
  title,
  description,
  action,
  headingLevel = 2,
}: {
  title: string;
  description?: string;
  /** Optional control aligned to the end of the header, e.g. a "View all" link. */
  action?: ReactNode;
  /** Use 3 when the card sits under a page-level heading, so levels never skip. */
  headingLevel?: 2 | 3;
}) {
  const Heading = headingLevel === 3 ? 'h3' : 'h2';

  return (
    <header className="flex items-start justify-between gap-3 border-b border-stone-200 px-4 py-4 sm:px-5">
      <div className="min-w-0">
        <Heading className="text-base font-semibold">{title}</Heading>
        {description ? <p className="mt-0.5 text-sm text-stone-600">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </header>
  );
}

export function CardBody({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn('px-4 py-4 sm:px-5', className)}>{children}</div>;
}
