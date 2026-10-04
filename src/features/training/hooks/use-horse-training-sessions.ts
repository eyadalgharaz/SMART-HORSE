'use client';

import { useQuery } from '@tanstack/react-query';
import { trainingService } from '../training-service';
import { trainingKeys } from '../query-keys';

/**
 * One horse's training sessions, newest first. The horse's identity (name,
 * photo, breed) is not loaded here — that belongs to the Horses module and the
 * page reads it with `useHorse`, so an unknown horse is reported by the module
 * that owns horses.
 */
export function useHorseTrainingSessions(horseId: string) {
  const query = useQuery({
    queryKey: trainingKeys.horseSessions(horseId),
    queryFn: () => trainingService.getHorseSessions(horseId),
  });

  return {
    sessions: query.data ?? [],
    isPending: query.isPending,
    isError: query.isError,
    isRefetching: query.isRefetching,
    refetch: query.refetch,
  };
}
