import type { ReactNode } from 'react';

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0">
        <h2 className="text-lg font-semibold">{title}</h2>
        {description ? (
          <p className="mt-1 max-w-prose text-sm text-stone-600">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}
