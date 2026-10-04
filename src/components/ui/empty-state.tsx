import type { ReactNode } from 'react';

/** An empty screen is an invitation to act — always give it a next step or a reason. */
export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-card border border-dashed border-stone-300 bg-white px-6 py-12 text-center">
      <h3 className="text-base font-semibold">{title}</h3>
      {description ? (
        <p className="mx-auto mt-1 max-w-prose text-sm text-stone-600">{description}</p>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
