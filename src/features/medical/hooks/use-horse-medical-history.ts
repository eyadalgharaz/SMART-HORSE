'use client';

import { useQuery } from '@tanstack/react-query';
import { medicalService } from '../medical-service';
import { medicalKeys } from '../query-keys';

/**
 * One horse's medical history: its health status and every record, newest
 * first. The horse's identity (name, photo, breed) is not loaded here — that
 * belongs to the Horses module and the page reads it with `useHorse`, so an
 * unknown horse is reported by the module that owns horses.
 */
export function useHorseMedicalHistory(horseId: string) {
  const query = useQuery({
    queryKey: medicalKeys.history(horseId),
    queryFn: () => medicalService.getHorseHistory(horseId),
  });

  return {
    records: query.data?.records ?? [],
    health: query.data?.health ?? null,
    isPending: query.isPending,
    isError: query.isError,
    isRefetching: query.isRefetching,
    refetch: query.refetch,
  };
}
