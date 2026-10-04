'use client';

import { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { formatMemberCount } from '../format';
import { useTeamMembers } from '../hooks/use-team-members';
import { emptyTeamMemberFilters, type TeamMember, type TeamMemberFilters } from '../types';
import { InviteMemberDialog } from './invite-member-dialog';
import { RemoveMemberDialog } from './remove-member-dialog';
import { SettingsSavedMessage } from './saved-message';
import { SettingsSectionLayout } from './settings-section-layout';
import { TeamListSkeleton } from './settings-skeletons';
import { TeamFilterBar } from './team-filter-bar';
import { TeamMemberDetailDialog } from './team-member-detail-dialog';
import { TeamMemberList } from './team-member-list';

/**
 * Container for /settings/team. Selecting a member opens their detail in a
 * dialog rather than a route: unlike a horse or a task, a team member has no
 * page of their own elsewhere in the app to deep-link to, and the list is
 * short enough that losing your place in it would be the only cost of a
 * full navigation.
 */
export function TeamMembersPage() {
  const [filters, setFilters] = useState<TeamMemberFilters>(emptyTeamMemberFilters);
  const [inviting, setInviting] = useState(false);
  const [selected, setSelected] = useState<TeamMember | null>(null);
  const [removing, setRemoving] = useState<TeamMember | null>(null);

  const { members, totalCount, isPending, isError, isRefetching, refetch } =
    useTeamMembers(filters);

  return (
    <SettingsSectionLayout
      title="Team Members"
      description="Manage people who have access to this farm."
      action={
        <Button onClick={() => setInviting(true)}>
          <UserPlus className="size-4" aria-hidden="true" />
          Invite member
        </Button>
      }
    >
      <div className="space-y-4">
        <SettingsSavedMessage />

        {isError ? (
          <ErrorState
            title="We couldn't load your team"
            description="Something went wrong while loading the team. Check your connection and try again."
            action={
              <Button variant="secondary" onClick={() => void refetch()} loading={isRefetching}>
                Try again
              </Button>
            }
          />
        ) : totalCount === 0 && !isPending ? (
          <EmptyState
            title="No team members yet"
            description="Invite your first team member to start managing farm access."
            action={
              <Button onClick={() => setInviting(true)}>
                <UserPlus className="size-4" aria-hidden="true" />
                Invite member
              </Button>
            }
          />
        ) : (
          <>
            <TeamFilterBar
              filters={filters}
              onChange={setFilters}
              onReset={() => setFilters(emptyTeamMemberFilters)}
            />

            {isPending ? (
              <TeamListSkeleton />
            ) : (
              <>
                <p role="status" className="text-sm text-stone-600">
                  {formatMemberCount(members.length, totalCount)}
                </p>

                {members.length === 0 ? (
                  <EmptyState
                    title="No members match your filters"
                    description="Try a different search term, or clear the filters."
                    action={
                      <Button
                        variant="secondary"
                        onClick={() => setFilters(emptyTeamMemberFilters)}
                      >
                        Clear filters
                      </Button>
                    }
                  />
                ) : (
                  <TeamMemberList members={members} onSelect={setSelected} />
                )}
              </>
            )}
          </>
        )}
      </div>

      <InviteMemberDialog open={inviting} onClose={() => setInviting(false)} />

      <TeamMemberDetailDialog
        member={selected}
        onClose={() => setSelected(null)}
        onRequestRemove={(member) => {
          setSelected(null);
          setRemoving(member);
        }}
      />

      <RemoveMemberDialog member={removing} onClose={() => setRemoving(null)} />
    </SettingsSectionLayout>
  );
}
