'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { farmService } from '../farm-service';
import { farmKeys } from '../query-keys';
import type { FarmInput } from '../types';

export function useFarm() {
  const query = useQuery({
    queryKey: farmKeys.root,
    queryFn: () => farmService.getFarm(),
  });

  return {
    farm: query.data,
    isPending: query.isPending,
    isError: query.isError,
    isRefetching: query.isRefetching,
    refetch: query.refetch,
  };
}

export function useUpdateFarm() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: FarmInput) => farmService.updateFarm(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: farmKeys.root }),
  });
}
