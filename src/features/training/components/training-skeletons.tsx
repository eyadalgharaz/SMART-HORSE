'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { useTranslations } from '@/i18n';

/**
 * Loading placeholders that mirror the loaded layout block for block, so
 * nothing jumps when the data arrives. Only the wrapper is announced; the
 * blocks themselves are decorative.
 */

export function TrainingSummarySkeleton() {
  return (
    <ul className="grid gap-4 min-[360px]:grid-cols-2 sm:gap-5 xl:grid-cols-4">
      {Array.from({ length: 4 }, (_, index) => (
        <li key={index} className="rounded-card border border-stone-200 bg-white p-4 sm:p-5">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="mt-3 h-8 w-12" />
          <Skeleton className="mt-2 h-4 w-24" />
        </li>
      ))}
    </ul>
  );
}

export function TrainingListSkeleton({ label }: { label?: string }) {
  const t = useTranslations();
  return (
    <div role="status" aria-busy="true">
      <span className="sr-only">{label ?? t.training.loading.sessions}</span>

      <div className="rounded-card hidden divide-y divide-stone-200 border border-stone-200 bg-white lg:block">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="flex items-center gap-4 px-5 py-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3.5 w-32" />
            </div>
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-5 w-20 rounded" />
          </div>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:hidden">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="rounded-card border border-stone-200 bg-white p-4">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="mt-2 h-3.5 w-28" />
            <Skeleton className="mt-3 h-3.5 w-full" />
            <Skeleton className="mt-3 h-3.5 w-24" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function TrainingTimelineSkeleton() {
  const t = useTranslations();
  return (
    <div role="status" aria-busy="true" className="space-y-4">
      <span className="sr-only">{t.training.loading.history}</span>
      {Array.from({ length: 5 }, (_, index) => (
        <div key={index} className="flex gap-3">
          <Skeleton className="size-8 shrink-0 rounded-md" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="h-4 w-52" />
            <Skeleton className="h-3.5 w-36" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function TrainingFormSkeleton() {
  const t = useTranslations();
  return (
    <div role="status" aria-busy="true" className="space-y-4">
      <span className="sr-only">{t.training.loading.session}</span>
      {Array.from({ length: 3 }, (_, index) => (
        <div key={index} className="rounded-card border border-stone-200 bg-white p-5">
          <Skeleton className="h-5 w-40" />
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 4 }, (_, cell) => (
              <Skeleton key={cell} className="h-10" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
