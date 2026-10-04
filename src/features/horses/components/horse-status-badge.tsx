'use client';

import { Badge } from '@/components/ui/badge';
import { useHorseStatusLabel } from '@/i18n';
import type { HorseStatus } from '../types';
import { statuses } from '../vocabulary';

/** Status as a word, using the shared badge. Colour only reinforces the label. */
export function HorseStatusBadge({ status }: { status: HorseStatus }) {
  const label = useHorseStatusLabel(status);
  const { tone } = statuses[status];
  return <Badge tone={tone}>{label}</Badge>;
}
