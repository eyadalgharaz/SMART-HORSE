'use client';

import { useQuery } from '@tanstack/react-query';
import { horseService } from './horse-service';
import { isHorseNotFound } from './types';
import { horseQueryKey } from './use-horses';

/**
 * Loads one horse through the service seam. A missing id is not an error the
 * user can retry out of, so it is reported separately and never retried.
 */
export function useHorse(id: string) {
  const query = useQuery({
    queryKey: horseQueryKey(id),
    queryFn: () => horseService.getHorse(id),
    retry: (failureCount, error) => !isHorseNotFound(error) && failureCount < 1,
  });

  const notFound = query.isError && isHorseNotFound(query.error);

  return {
    horse: query.data,
    isPending: query.isPending,
    notFound,
    isError: query.isError && !notFound,
    isRefetching: query.isRefetching,
    refetch: query.refetch,
  };
}
