'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { countMembersByRole } from '../format';
import { roleService } from '../role-service';
import { teamService } from '../team-service';
import { roleKeys, teamKeys } from '../query-keys';

/**
 * Loads the fixed role list alongside the team roster, purely so each role's
 * member count can be derived (`countMembersByRole`) rather than stored —
 * the count can never disagree with who is actually on the team. The team
 * query here shares its cache key with `useTeamMembers`, so visiting Roles
 * after Team Members costs nothing extra.
 */
export function useRoles() {
  const rolesQuery = useQuery({ queryKey: roleKeys.list, queryFn: () => roleService.listRoles() });
  const teamQuery = useQuery({ queryKey: teamKeys.list, queryFn: () => teamService.listMembers() });

  const roles = useMemo(() => rolesQuery.data ?? [], [rolesQuery.data]);
  const members = useMemo(() => teamQuery.data ?? [], [teamQuery.data]);
  const memberCounts = useMemo(() => countMembersByRole(roles, members), [roles, members]);

  return {
    roles,
    memberCounts,
    isPending: rolesQuery.isPending || teamQuery.isPending,
    isError: rolesQuery.isError || teamQuery.isError,
    isRefetching: rolesQuery.isRefetching || teamQuery.isRefetching,
    refetch: () => {
      void rolesQuery.refetch();
      void teamQuery.refetch();
    },
  };
}
