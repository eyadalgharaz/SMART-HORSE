'use client';

import { useQuery } from '@tanstack/react-query';
import { medicalService } from '../medical-service';
import { medicalKeys } from '../query-keys';

/** What is coming up, soonest first — for the whole farm, or for one horse. */
export function useUpcomingMedicalEvents(horseId?: string) {
  const query = useQuery({
    queryKey: medicalKeys.events(horseId),
    queryFn: () => medicalService.listUpcomingEvents(horseId ? { horseId } : undefined),
  });

  return {
    events: query.data ?? [],
    isPending: query.isPending,
    isError: query.isError,
  };
}
