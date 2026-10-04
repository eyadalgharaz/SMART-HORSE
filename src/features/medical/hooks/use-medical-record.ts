'use client';

import { useQuery } from '@tanstack/react-query';
import { medicalService } from '../medical-service';
import { medicalKeys } from '../query-keys';
import { isMedicalRecordNotFound } from '../types';

/**
 * Loads one medical record through the service seam. A missing id is not an
 * error the user can retry out of, so it is reported separately and never
 * retried. `enabled` lets a screen hold the request until it has an id.
 */
export function useMedicalRecord(id: string, options?: { enabled?: boolean }) {
  const query = useQuery({
    queryKey: medicalKeys.record(id),
    queryFn: () => medicalService.getRecord(id),
    enabled: options?.enabled ?? true,
    retry: (failureCount, error) => !isMedicalRecordNotFound(error) && failureCount < 1,
  });

  const notFound = query.isError && isMedicalRecordNotFound(query.error);

  return {
    record: query.data,
    isPending: query.isPending,
    notFound,
    isError: query.isError && !notFound,
    isRefetching: query.isRefetching,
    refetch: query.refetch,
  };
}
