'use client';

import { useQuery } from '@tanstack/react-query';
import { trainingService } from '../training-service';
import { trainingKeys } from '../query-keys';
import { isTrainingSessionNotFound } from '../types';

/**
 * Loads one training session through the service seam. A missing id is not an
 * error the user can retry out of, so it is reported separately and never
 * retried.
 */
export function useTrainingSession(id: string) {
  const query = useQuery({
    queryKey: trainingKeys.session(id),
    queryFn: () => trainingService.getSession(id),
    retry: (failureCount, error) => !isTrainingSessionNotFound(error) && failureCount < 1,
  });

  const notFound = query.isError && isTrainingSessionNotFound(query.error);

  return {
    session: query.data,
    isPending: query.isPending,
    notFound,
    isError: query.isError && !notFound,
    isRefetching: query.isRefetching,
    refetch: query.refetch,
  };
}
