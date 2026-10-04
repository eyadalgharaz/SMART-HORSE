'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { accountService } from '../account-service';
import { accountKeys } from '../query-keys';
import type { AccountPreferences } from '../types';

export function useAccountPreferences() {
  const query = useQuery({
    queryKey: accountKeys.preferences,
    queryFn: () => accountService.getPreferences(),
  });

  return {
    preferences: query.data,
    isPending: query.isPending,
    isError: query.isError,
  };
}

export function useUpdateAccountPreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: AccountPreferences) => accountService.updatePreferences(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: accountKeys.preferences }),
  });
}
