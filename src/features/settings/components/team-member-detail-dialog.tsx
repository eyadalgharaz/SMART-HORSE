'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Alert } from '@/components/ui/alert';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { Modal } from '@/components/ui/modal';
import { Select } from '@/components/ui/select';
import { formatLastActive, formatSettingsDate } from '../format';
import { useSetTeamMemberStatus, useUpdateTeamMemberRole } from '../hooks/use-team-mutations';
import type { FarmRole, TeamMember } from '../types';
import { useRoleOptions } from '@/i18n';
import { savedUrl } from './saved-message';
import { TeamMemberStatusBadge } from './team-status-badge';

/**
 * A member's detail view, and the actions available from where they
 * currently stand: an invited member can only be removed (there is no
 * "active work" to suspend yet), an active member can have their role
 * changed or be suspended, and a suspended member can be reactivated.
 * Remove is available from any state but opens its own confirmation rather
 * than acting immediately here.
 */
export function TeamMemberDetailDialog({
  member,
  onClose,
  onRequestRemove,
}: {
  member: TeamMember | null;
  onClose: () => void;
  onRequestRemove: (member: TeamMember) => void;
}) {
  const router = useRouter();
  const roleOptions = useRoleOptions();
  const [role, setRole] = useState<FarmRole | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const { mutateAsync: saveRole, isPending: savingRole } = useUpdateTeamMemberRole();
  const { mutateAsync: saveStatus, isPending: savingStatus } = useSetTeamMemberStatus();

  if (!member) return null;
  const currentRole = role ?? member.role;
  const roleChanged = currentRole !== member.role;

  async function handleSaveRole() {
    if (!member || !roleChanged) return;
    setActionError(null);
    try {
      await saveRole({ id: member.id, role: currentRole });
      onClose();
      router.push(savedUrl('/settings/team', 'role'));
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Could not update this role.');
    }
  }

  async function handleStatus(next: 'active' | 'suspended') {
    if (!member) return;
    setActionError(null);
    try {
      await saveStatus({ id: member.id, status: next });
      onClose();
      router.push(savedUrl('/settings/team', next === 'suspended' ? 'suspended' : 'reactivated'));
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Could not update this member.');
    }
  }

  return (
    <Modal open={Boolean(member)} onClose={onClose} title="Team member">
      <div className="space-y-5">
        {actionError ? <Alert tone="error">{actionError}</Alert> : null}

        <div className="flex items-center gap-3">
          <Avatar name={member.fullName} className="size-12 text-base" />
          <div className="min-w-0">
            <p className="truncate font-semibold">{member.fullName}</p>
            <p className="truncate text-sm text-stone-600">{member.email}</p>
          </div>
        </div>

        <dl className="grid grid-cols-2 gap-x-3 gap-y-3 text-sm">
          <div>
            <dt className="text-stone-600">Status</dt>
            <dd className="mt-1">
              <TeamMemberStatusBadge status={member.status} />
            </dd>
          </div>
          <div>
            <dt className="text-stone-600">Phone</dt>
            <dd className="mt-1 font-medium">{member.phone ?? 'Not provided'}</dd>
          </div>
          <div>
            <dt className="text-stone-600">{member.status === 'invited' ? 'Invited' : 'Joined'}</dt>
            <dd className="mt-1 font-medium">{formatSettingsDate(member.joinedAt)}</dd>
          </div>
          <div>
            <dt className="text-stone-600">Last active</dt>
            <dd className="mt-1 font-medium">{formatLastActive(member.lastActiveAt)}</dd>
          </div>
        </dl>

        <div className="border-t border-stone-200 pt-4">
          <FormField label="Role">
            <Select
              value={currentRole}
              onChange={(event) => setRole(event.target.value as FarmRole)}
              disabled={member.status === 'invited'}
            >
              {roleOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </FormField>
          {roleChanged ? (
            <Button
              size="sm"
              className="mt-2"
              loading={savingRole}
              onClick={() => void handleSaveRole()}
            >
              Save role
            </Button>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2 border-t border-stone-200 pt-4">
          {member.status === 'active' ? (
            <Button
              variant="secondary"
              loading={savingStatus}
              onClick={() => void handleStatus('suspended')}
            >
              Suspend member
            </Button>
          ) : null}
          {member.status === 'suspended' ? (
            <Button loading={savingStatus} onClick={() => void handleStatus('active')}>
              Reactivate member
            </Button>
          ) : null}
          <Button variant="danger" onClick={() => onRequestRemove(member)}>
            Remove member
          </Button>
        </div>
      </div>
    </Modal>
  );
}
