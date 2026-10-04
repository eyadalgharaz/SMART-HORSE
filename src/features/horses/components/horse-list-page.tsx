'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button, ButtonLink } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { PageHeader } from '@/components/layout/page-header';
import { useTranslations } from '@/i18n';
import { formatHorseCount } from '../format';
import { emptyHorseFilters, type HorseFilters } from '../types';
import { useHorses } from '../use-horses';
import { HorseCardList } from './horse-card-list';
import { HorseFilterBar } from './horse-filter-bar';
import { HorseListSkeleton } from './horse-list-skeleton';
import { HorseTable } from './horse-table';
import { SavedMessage } from './saved-message';

/**
 * Container for /horses: holds the filter state, reads through the service seam
 * and chooses between loading, error, empty and list. All display lives in the
 * presentational components, which only ever receive plain data.
 */
export function HorseListPage() {
  const [filters, setFilters] = useState<HorseFilters>(emptyHorseFilters);
  const { horses, totalCount, breeds, isPending, isError, isRefetching, refetch } =
    useHorses(filters);
  const t = useTranslations();

  return (
    <>
      <PageHeader
        title={t.pages.horses.title}
        description={t.pages.horses.description}
        action={
          <ButtonLink href="/horses/new">
            <Plus className="size-4" aria-hidden="true" />
            {t.pages.horses.addHorse}
          </ButtonLink>
        }
      />

      <div className="space-y-4">
        <SavedMessage />

        {isError ? (
          <ErrorState
            title={t.pages.horses.errorTitle}
            description={t.pages.horses.errorDescription}
            action={
              <Button variant="secondary" onClick={() => void refetch()} loading={isRefetching}>
                {t.common.tryAgain}
              </Button>
            }
          />
        ) : isPending ? (
          <>
            <HorseFilterBar
              filters={filters}
              onChange={setFilters}
              onReset={() => setFilters(emptyHorseFilters)}
              breeds={breeds}
            />
            <HorseListSkeleton />
          </>
        ) : totalCount === 0 ? (
          <EmptyState
            title={t.pages.horses.emptyTitle}
            description={t.pages.horses.emptyDescription}
            action={
              <ButtonLink href="/horses/new">
                <Plus className="size-4" aria-hidden="true" />
                Add horse
              </ButtonLink>
            }
          />
        ) : (
          <>
            <HorseFilterBar
              filters={filters}
              onChange={setFilters}
              onReset={() => setFilters(emptyHorseFilters)}
              breeds={breeds}
            />

            <p role="status" className="text-sm text-stone-600">
              {formatHorseCount(horses.length, totalCount)}
            </p>

            {horses.length === 0 ? (
              <EmptyState
                title="No horses match your search"
                description="Try a different name or number, or widen the filters."
                action={
                  <Button variant="secondary" onClick={() => setFilters(emptyHorseFilters)}>
                    Clear filters
                  </Button>
                }
              />
            ) : (
              <>
                <HorseTable horses={horses} />
                <HorseCardList horses={horses} />
              </>
            )}
          </>
        )}
      </div>
    </>
  );
}
