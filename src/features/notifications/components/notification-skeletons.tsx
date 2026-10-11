'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { useTranslations } from '@/i18n';

export function NotificationListSkeleton({ count = 6 }: { count?: number }) {
  const t = useTranslations();
  return (
    <div role="status" aria-busy="true" className="divide-y divide-stone-200">
      <span className="sr-only">{t.notifications.loading}</span>
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="flex items-start gap-3 px-4 py-3 sm:px-5">
          <Skeleton className="size-9 shrink-0 rounded-full" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3.5 w-full max-w-sm" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      ))}
    </div>
  );
}
