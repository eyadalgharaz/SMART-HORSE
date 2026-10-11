'use client';

import type { ReactNode } from 'react';
import { useNotProvided } from '@/i18n';

/**
 * Label-and-value pairs for the profile, marked up as a description list so the
 * relationship survives for screen readers. Missing optional information reads
 * as "Not provided" rather than an empty cell, which would look like a bug.
 */
export function DetailList({ children }: { children: ReactNode }) {
  return <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">{children}</dl>;
}

export function Detail({
  label,
  value,
  children,
}: {
  label: string;
  /** Plain text value; null or empty renders the "Not provided" placeholder. */
  value?: string | null;
  /** Rich value (a badge, a link) when plain text is not enough. */
  children?: ReactNode;
}) {
  const missing = !children && !value;
  const notProvided = useNotProvided();

  return (
    <div className="min-w-0">
      <dt className="text-sm text-stone-600">{label}</dt>
      <dd className={missing ? 'mt-0.5 text-stone-500 italic' : 'mt-0.5 font-medium break-words'}>
        {children ?? value ?? notProvided}
      </dd>
    </div>
  );
}
