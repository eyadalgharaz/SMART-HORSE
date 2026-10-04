'use client';

import { useQuery } from '@tanstack/react-query';
import { taskService } from '../task-service';
import { taskKeys } from '../query-keys';
import { isTaskNotFound } from '../types';

/**
 * Loads one task through the service seam. A missing id is not an error the
 * user can retry out of, so it is reported separately and never retried.
 */
export function useTask(id: string) {
  const query = useQuery({
    queryKey: taskKeys.detail(id),
    queryFn: () => taskService.getTask(id),
    retry: (failureCount, error) => !isTaskNotFound(error) && failureCount < 1,
  });

  const notFound = query.isError && isTaskNotFound(query.error);

  return {
    task: query.data,
    isPending: query.isPending,
    notFound,
    isError: query.isError && !notFound,
    isRefetching: query.isRefetching,
    refetch: query.refetch,
  };
}
