'use client';

import { useQuery } from '@tanstack/react-query';
import { trainingService } from '../training-service';
import { trainingKeys } from '../query-keys';

/** The known trainers, for filters and the session form's trainer select. */
export function useTrainers() {
  const query = useQuery({
    queryKey: trainingKeys.trainers,
    queryFn: () => trainingService.listTrainers(),
  });

  return {
    trainers: query.data ?? [],
    isPending: query.isPending,
    isError: query.isError,
  };
}
