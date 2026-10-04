import { Skeleton } from '@/components/ui/skeleton';

const ROWS = 6;

/**
 * Mirrors the loaded list block for block — table rows on wide screens, cards
 * below — so nothing jumps when the data arrives. Only the wrapper is
 * announced; the blocks themselves are decorative.
 */
export function HorseListSkeleton() {
  return (
    <div role="status" aria-busy="true">
      <span className="sr-only">Loading horses</span>

      <div className="rounded-card hidden divide-y divide-stone-200 border border-stone-200 bg-white lg:block">
        {Array.from({ length: ROWS }, (_, index) => (
          <div key={index} className="flex items-center gap-4 px-5 py-3.5">
            <Skeleton className="size-10 shrink-0" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3.5 w-20" />
            </div>
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-5 w-16 rounded" />
            <Skeleton className="h-4 w-10" />
          </div>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:hidden">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="rounded-card border border-stone-200 bg-white p-4">
            <div className="flex gap-3">
              <Skeleton className="size-14 shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3.5 w-36" />
                <Skeleton className="h-5 w-16 rounded" />
              </div>
            </div>
            <Skeleton className="mt-4 h-3.5 w-2/3" />
          </div>
        ))}
      </div>
    </div>
  );
}
