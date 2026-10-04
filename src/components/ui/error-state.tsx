import { TriangleAlert } from 'lucide-react';
import type { ReactNode } from 'react';

/**
 * Something failed and the person can try again. Says what happened and what to
 * do, with one action. Distinct from `EmptyState`, which is not a failure: this
 * one is announced as an alert and carries the warning mark.
 */
export function ErrorState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div
      role="alert"
      className="rounded-card border border-stone-200 bg-white px-6 py-12 text-center"
    >
      <span className="bg-danger-50 text-danger-500 mx-auto flex size-10 items-center justify-center rounded-full">
        <TriangleAlert className="size-5" aria-hidden="true" />
      </span>
      <h2 className="mt-4 text-base font-semibold">{title}</h2>
      <p className="mx-auto mt-1 max-w-prose text-sm text-stone-600">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
