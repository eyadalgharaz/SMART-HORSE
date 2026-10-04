'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { trainingService } from '../training-service';
import { trainingRoot } from '../query-keys';
import type { TrainingSession, TrainingSessionInput } from '../types';

/**
 * Add and Edit share one mutation hook because they submit the same session;
 * only the service call differs.
 *
 * A saved session can change the overview summary, the farm session list, the
 * horse's timeline and its progress chart all at once, so the whole Training
 * cache is invalidated rather than a hand-picked set of keys that would drift
 * out of date.
 */
function useTrainingMutation(
  mutationFn: (input: TrainingSessionInput) => Promise<TrainingSession>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: trainingRoot }),
  });
}

export function useCreateTrainingSession(horseId: string) {
  return useTrainingMutation((input) => trainingService.createSession(horseId, input));
}

export function useUpdateTrainingSession(id: string) {
  return useTrainingMutation((input) => trainingService.updateSession(id, input));
}
