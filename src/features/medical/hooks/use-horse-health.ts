'use client';

import { useQuery } from '@tanstack/react-query';
import { medicalService } from '../medical-service';
import { medicalKeys } from '../query-keys';

/**
 * Health status for every horse that has been assessed. These are entered by a
 * person and stored — nothing here is predicted or inferred.
 */
export function useHorseHealth() {
  const query = useQuery({
    queryKey: medicalKeys.health,
    queryFn: () => medicalService.listHorseHealth(),
  });

  return {
    health: query.data ?? [],
    isPending: query.isPending,
    isError: query.isError,
  };
}
