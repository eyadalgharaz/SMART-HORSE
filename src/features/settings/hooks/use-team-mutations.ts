'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { teamService } from '../team-service';
import { teamKeys } from '../query-keys';
import type { FarmRole, InviteTeamMemberInput, TeamMemberStatus } from '../types';

/**
 * One mutation hook per team action, each invalidating the same list query —
 * inviting, changing a role, suspending/reactivating and removing all change
 * what that single list shows, the same way a Training session save
 * invalidates the whole Training cache rather than a hand-picked key.
 */
function useTeamListMutation<TInput, TResult>(mutationFn: (input: TInput) => Promise<TResult>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: teamKeys.root }),
  });
}

export function useInviteTeamMember() {
  return useTeamListMutation((input: InviteTeamMemberInput) => teamService.inviteMember(input));
}

export function useUpdateTeamMemberRole() {
  return useTeamListMutation(({ id, role }: { id: string; role: FarmRole }) =>
    teamService.updateMemberRole(id, role),
  );
}

export function useSetTeamMemberStatus() {
  return useTeamListMutation(({ id, status }: { id: string; status: TeamMemberStatus }) =>
    teamService.setMemberStatus(id, status),
  );
}

export function useRemoveTeamMember() {
  return useTeamListMutation((id: string) => teamService.removeMember(id));
}
