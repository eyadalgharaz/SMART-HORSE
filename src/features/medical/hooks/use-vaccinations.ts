'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { filterVaccinations, sortVaccinations } from '../format';
import { medicalService } from '../medical-service';
import { medicalKeys } from '../query-keys';
import type { VaccinationFilters } from '../types';

/**
 * The vaccination register, most urgent first. Status is calculated from the
 * dates (see `vaccinationStatus`) rather than stored, so a row can never say
 * "Up to date" next to a date that has passed.
 */
export function useVaccinations(filters?: VaccinationFilters, horseId?: string) {
  const query = useQuery({
    queryKey: medicalKeys.vaccinations(horseId),
    queryFn: () => medicalService.listVaccinations(horseId ? { horseId } : undefined),
  });

  const all = useMemo(() => sortVaccinations(query.data ?? []), [query.data]);
  const vaccinations = useMemo(
    () => (filters ? filterVaccinations(all, filters) : all),
    [all, filters],
  );

  return {
    vaccinations,
    totalCount: all.length,
    isPending: query.isPending,
    isError: query.isError,
    isRefetching: query.isRefetching,
    refetch: query.refetch,
  };
}
