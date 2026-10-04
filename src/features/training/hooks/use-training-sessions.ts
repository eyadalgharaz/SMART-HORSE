'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { filterTrainingSessions, horsesOf, trainersOf } from '../format';
import { trainingService } from '../training-service';
import { trainingKeys } from '../query-keys';
import type { TrainingSessionFilters } from '../types';

/**
 * Loads the farm's training sessions through the service seam and applies the
 * active filters. Filtering is a pure function over the loaded page, which
 * keeps typing instant and needs no debounce; when the real API arrives the
 * filters move into its query string and only this hook changes.
 */
export function useTrainingSessions(filters: TrainingSessionFilters) {
  const query = useQuery({
    queryKey: trainingKeys.sessions,
    queryFn: () => trainingService.listSessions(),
  });

  const all = useMemo(() => query.data ?? [], [query.data]);
  const sessions = useMemo(() => filterTrainingSessions(all, filters), [all, filters]);
  const horses = useMemo(() => horsesOf(all), [all]);
  const trainers = useMemo(() => trainersOf(all), [all]);

  return {
    sessions,
    /** Every session on file, ignoring the filters — what the farm summary counts. */
    allSessions: all,
    /** Sessions on file before filters — the denominator in "8 of 40". */
    totalCount: all.length,
    /** Horses that have sessions, for the filter's option list. */
    horses,
    /** Trainers that have sessions, for the filter's option list. */
    trainers,
    isPending: query.isPending,
    isError: query.isError,
    isRefetching: query.isRefetching,
    refetch: query.refetch,
  };
}
