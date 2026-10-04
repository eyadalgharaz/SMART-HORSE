'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { useRemoveTeamMember } from '../hooks/use-team-mutations';
import type { TeamMember } from '../types';
import { savedUrl } from './saved-message';

/**
 * The confirmation Removing a team member requires. Kept as its own small
 * dialog rather than a `window.confirm`, so it matches the rest of the app's
 * dialog behaviour (focus trapped, Escape closes it, styled like SmartHorse)
 * and states plainly what will happen before it happens.
 */
export function RemoveMemberDialog({
  member,
  onClose,
}: {
  member: TeamMember | null;
  onClose: () => void;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const { mutateAsync, isPending } = useRemoveTeamMember();

  if (!member) return null;

  async function handleRemove() {
    if (!member) return;
    setError(null);
    try {
      await mutateAsync(member.id);
      onClose();
      router.push(savedUrl('/settings/team', 'removed'));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not remove this member.');
    }
  }

  return (
    <Modal
      open={Boolean(member)}
      onClose={onClose}
      title="Remove team member?"
      description={`This will remove ${member.fullName} from this farm.`}
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="danger" loading={isPending} onClick={() => void handleRemove()}>
            Remove member
          </Button>
        </div>
      }
    >
      {error ? <Alert tone="error">{error}</Alert> : null}
    </Modal>
  );
}
