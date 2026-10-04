'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { medicalService } from '../medical-service';
import { medicalRoot } from '../query-keys';
import type { MedicalRecord, MedicalRecordInput } from '../types';

/**
 * Add and Edit share one mutation hook because they submit the same record;
 * only the service call differs.
 *
 * A saved record can change the list, the horse's timeline, the vaccination
 * register and the upcoming events all at once — a vaccination with a new due
 * date moves rows in three of them — so the whole Medical cache is invalidated
 * rather than a hand-picked set of keys that would drift out of date.
 */
function useMedicalMutation(mutationFn: (input: MedicalRecordInput) => Promise<MedicalRecord>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: medicalRoot }),
  });
}

export function useCreateMedicalRecord(horseId: string) {
  return useMedicalMutation((input) => medicalService.createRecord(horseId, input));
}

export function useUpdateMedicalRecord(id: string) {
  return useMedicalMutation((input) => medicalService.updateRecord(id, input));
}
