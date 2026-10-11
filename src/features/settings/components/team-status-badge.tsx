'use client';

import { Badge } from '@/components/ui/badge';
import { useRoleLabel, useTranslations } from '@/i18n';
import type { FarmRole, TeamMemberStatus } from '../types';
import { teamMemberStatusPresentation } from '../vocabulary';

/** A team member's status, using the shared badge. Colour only reinforces the word. */
export function TeamMemberStatusBadge({ status }: { status: TeamMemberStatus }) {
  const t = useTranslations();
  const { tone } = teamMemberStatusPresentation[status];
  return <Badge tone={tone}>{t.settings.memberStatuses[status]}</Badge>;
}

/** A team member's role. Neutral on purpose: a role is not a status. */
export function FarmRoleBadge({ role }: { role: FarmRole }) {
  const label = useRoleLabel(role);
  return <Badge tone="neutral">{label}</Badge>;
}
