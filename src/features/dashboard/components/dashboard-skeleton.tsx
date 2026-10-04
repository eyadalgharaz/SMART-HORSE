'use client';

import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslations } from '@/i18n';
import { twoColumnGrid } from './layout';

/** Bar heights (percent) for the chart placeholder — varied so it reads as a chart. */
const CHART_BAR_HEIGHTS = [55, 75, 60, 90, 80, 40, 65];
const LIST_ROWS = 4;

function ListRows({ rows }: { rows: number }) {
  return (
    <div className="divide-y divide-stone-200">
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="flex gap-3 px-4 py-3.5 sm:px-5">
          <Skeleton className="size-8 shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      ))}
    </div>
  );
}

function PanelHeader() {
  return (
    <div className="border-b border-stone-200 px-4 py-4 sm:px-5">
      <Skeleton className="h-5 w-36" />
    </div>
  );
}

/**
 * Mirrors the loaded layout block for block so nothing jumps when data arrives.
 * The wrapper is the only thing announced; the blocks themselves are decorative.
 */
export function DashboardSkeleton() {
  const t = useTranslations();
  return (
    <div role="status" aria-busy="true" className="space-y-4 sm:space-y-5">
      <span className="sr-only">{t.dashboard.loadingAnnouncement}</span>

      <div className="grid gap-4 min-[360px]:grid-cols-2 sm:gap-5 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <Card key={index} className="p-4 sm:p-5">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="mt-3 h-8 w-16" />
            <Skeleton className="mt-3 h-4 w-32" />
          </Card>
        ))}
      </div>

      <div className={twoColumnGrid}>
        <Card>
          <PanelHeader />
          <div className="space-y-5 px-4 py-4 sm:px-5">
            <Skeleton className="h-8 w-40" />
            <div className="flex h-44 items-end gap-3 pl-8">
              {CHART_BAR_HEIGHTS.map((height, index) => (
                <div key={index} className="flex-1" style={{ height: `${height}%` }}>
                  <Skeleton className="h-full w-full rounded-b-none" />
                </div>
              ))}
            </div>
          </div>
        </Card>
        <Card>
          <PanelHeader />
          <ListRows rows={5} />
        </Card>
      </div>

      <div className={twoColumnGrid}>
        <Card>
          <PanelHeader />
          <div className="space-y-5 px-4 py-4 sm:px-5">
            <Skeleton className="h-8 w-full" />
            <div className="grid grid-cols-2 gap-3">
              {Array.from({ length: 4 }, (_, index) => (
                <Skeleton key={index} className="h-24" />
              ))}
            </div>
          </div>
        </Card>
        <Card>
          <PanelHeader />
          <ListRows rows={LIST_ROWS} />
        </Card>
      </div>
    </div>
  );
}
