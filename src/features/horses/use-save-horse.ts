'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { horseService } from './horse-service';
import type { Horse, HorseInput } from './types';
import { horseQueryKey, horsesQueryKey } from './use-horses';

/**
 * Add and Edit share one mutation hook because they submit the same record and
 * invalidate the same caches; only the service call differs. Both refresh the
 * list and the profile so the change is visible wherever the user lands next.
 */
function useHorseMutation(mutationFn: (input: HorseInput) => Promise<Horse>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: (horse) => {
      queryClient.setQueryData(horseQueryKey(horse.id), horse);
      void queryClient.invalidateQueries({ queryKey: horsesQueryKey });
    },
  });
}

export function useCreateHorse() {
  return useHorseMutation((input) => horseService.createHorse(input));
}

export function useUpdateHorse(id: string) {
  return useHorseMutation((input) => horseService.updateHorse(id, input));
}
