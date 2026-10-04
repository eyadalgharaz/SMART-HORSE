'use client';

import { useQuery } from '@tanstack/react-query';
import { trainingService } from '../training-service';
import { trainingKeys } from '../query-keys';

/** Every training program on file. */
export function useTrainingPrograms() {
  const query = useQuery({
    queryKey: trainingKeys.programs,
    queryFn: () => trainingService.listPrograms(),
  });

  return {
    programs: query.data ?? [],
    isPending: query.isPending,
    isError: query.isError,
    isRefetching: query.isRefetching,
    refetch: query.refetch,
  };
}
