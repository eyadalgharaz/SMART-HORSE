'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useI18n } from '@/i18n/use-i18n';
import { filterMedicalRecords, horsesOf } from '../format';
import { medicalService } from '../medical-service';
import { medicalKeys } from '../query-keys';
import type { MedicalRecordFilters } from '../types';

/**
 * Loads the farm's medical records through the service seam and applies the
 * active filters. Filtering is a pure function over the loaded page, which keeps
 * typing instant and needs no debounce; when the real API arrives the filters
 * move into its query string and only this hook changes.
 */
export function useMedicalRecords(filters: MedicalRecordFilters) {
  const query = useQuery({
    queryKey: medicalKeys.records,
    queryFn: () => medicalService.listRecords(),
  });

  const { tc } = useI18n();
  const all = useMemo(() => query.data ?? [], [query.data]);
  const records = useMemo(() => filterMedicalRecords(all, filters, tc), [all, filters, tc]);
  const horses = useMemo(() => horsesOf(all), [all]);

  return {
    records,
    /** Every record on file, ignoring the filters — what the farm summary counts. */
    allRecords: all,
    /** Records on file before filters — the denominator in "8 of 46". */
    totalCount: all.length,
    /** Horses that have records, for the filter's option list. */
    horses,
    isPending: query.isPending,
    isError: query.isError,
    isRefetching: query.isRefetching,
    refetch: query.refetch,
  };
}
