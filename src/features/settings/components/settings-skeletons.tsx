'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { useTranslations } from '@/i18n';

export function FarmProfileSkeleton() {
  const t = useTranslations();
  return (
    <div role="status" aria-busy="true" className="space-y-4">
      <span className="sr-only">{t.settings.farm.loading}</span>
      {Array.from({ length: 3 }, (_, index) => (
        <div key={index} className="rounded-card border border-stone-200 bg-white p-5">
          <Skeleton className="h-5 w-40" />
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 2 }, (_, cell) => (
              <Skeleton key={cell} className="h-10" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function TeamListSkeleton() {
  const t = useTranslations();
  return (
    <div role="status" aria-busy="true">
      <span className="sr-only">{t.settings.team.loading}</span>

      <div className="rounded-card hidden divide-y divide-stone-200 border border-stone-200 bg-white lg:block">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="flex items-center gap-4 px-5 py-4">
            <Skeleton className="size-9 shrink-0 rounded-full" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3.5 w-48" />
            </div>
            <Skeleton className="h-5 w-24 rounded" />
            <Skeleton className="h-5 w-20 rounded" />
          </div>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:hidden">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="rounded-card border border-stone-200 bg-white p-4">
            <div className="flex items-center gap-3">
              <Skeleton className="size-9 shrink-0 rounded-full" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="mt-3 h-3.5 w-full" />
            <Skeleton className="mt-3 h-3.5 w-24" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function RolesSkeleton() {
  const t = useTranslations();
  return (
    <ul role="status" aria-busy="true" className="grid gap-4 sm:grid-cols-2">
      <span className="sr-only">{t.settings.roles.loading}</span>
      {Array.from({ length: 4 }, (_, index) => (
        <li key={index} className="rounded-card border border-stone-200 bg-white p-4 sm:p-5">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="mt-2 h-3.5 w-full" />
          <Skeleton className="mt-3 h-3.5 w-24" />
        </li>
      ))}
    </ul>
  );
}

export function AccountSkeleton() {
  const t = useTranslations();
  return (
    <div role="status" aria-busy="true" className="space-y-4">
      <span className="sr-only">{t.settings.account.loading}</span>
      {Array.from({ length: 2 }, (_, index) => (
        <div key={index} className="rounded-card border border-stone-200 bg-white p-5">
          <Skeleton className="h-5 w-40" />
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 2 }, (_, cell) => (
              <Skeleton key={cell} className="h-10" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
