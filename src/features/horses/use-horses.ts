'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useI18n } from '@/i18n/use-i18n';
import { breedsOf, filterHorses } from './format';
import { horseService } from './horse-service';
import type { HorseFilters } from './types';

export const horsesQueryKey = ['horses', 'list'] as const;
export const horseQueryKey = (id: string) => ['horses', 'detail', id] as const;

/**
 * Loads the stable's horses through the service seam and applies the active
 * filters. Filtering is a pure function over the loaded page, which keeps
 * typing instant and needs no debounce; when the real API arrives the filters
 * move into its query string and only this hook changes.
 */
export function useHorses(filters: HorseFilters) {
  const query = useQuery({
    queryKey: horsesQueryKey,
    queryFn: () => horseService.listHorses(),
  });

  const { tc } = useI18n();
  const all = useMemo(() => query.data ?? [], [query.data]);
  const horses = useMemo(() => filterHorses(all, filters, tc), [all, filters, tc]);
  const breeds = useMemo(() => breedsOf(all), [all]);

  return {
    horses,
    /** Horses on file before filters — the denominator in "8 of 42". */
    totalCount: all.length,
    breeds,
    isPending: query.isPending,
    isError: query.isError,
    isRefetching: query.isRefetching,
    refetch: query.refetch,
  };
}
