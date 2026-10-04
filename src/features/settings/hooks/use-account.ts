'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { accountService } from '../account-service';
import { accountKeys } from '../query-keys';
import type { AccountInput } from '../types';

export function useAccount() {
  const query = useQuery({
    queryKey: accountKeys.profile,
    queryFn: () => accountService.getAccount(),
  });

  return {
    account: query.data,
    isPending: query.isPending,
    isError: query.isError,
    isRefetching: query.isRefetching,
    refetch: query.refetch,
  };
}

export function useUpdateAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: AccountInput) => accountService.updateAccount(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: accountKeys.profile }),
  });
}
