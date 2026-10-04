'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { filterTeamMembers, sortMembersNewestFirst } from '../format';
import { teamService } from '../team-service';
import { teamKeys } from '../query-keys';
import type { TeamMemberFilters } from '../types';

/**
 * Loads the team through the service seam and applies the active filters.
 * Filtering is a pure function over the loaded page, which keeps typing
 * instant and needs no debounce; when the real API arrives the filters move
 * into its query string and only this hook changes.
 */
export function useTeamMembers(filters: TeamMemberFilters) {
  const query = useQuery({
    queryKey: teamKeys.list,
    queryFn: () => teamService.listMembers(),
  });

  const all = useMemo(() => query.data ?? [], [query.data]);
  const members = useMemo(
    () => sortMembersNewestFirst(filterTeamMembers(all, filters)),
    [all, filters],
  );

  return {
    members,
    allMembers: all,
    totalCount: all.length,
    isPending: query.isPending,
    isError: query.isError,
    isRefetching: query.isRefetching,
    refetch: query.refetch,
  };
}
