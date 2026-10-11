'use client';

import type { LucideIcon } from 'lucide-react';
import {
  Activity,
  Dumbbell,
  Footprints,
  Gauge,
  HeartPulse,
  Medal,
  MoveRight,
  Waves,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useTranslations } from '@/i18n';
import type { TrainingProgramStatus, TrainingSessionStatus, TrainingType } from '../types';
import { programStatusPresentation, sessionStatusPresentation } from '../vocabulary';

/** A session's status, using the shared badge. Colour only reinforces the label. */
export function TrainingSessionStatusBadge({ status }: { status: TrainingSessionStatus }) {
  const t = useTranslations();
  const { tone } = sessionStatusPresentation[status];
  return <Badge tone={tone}>{t.training.sessionStatuses[status]}</Badge>;
}

/** A program's status, using the shared badge. */
export function TrainingProgramStatusBadge({ status }: { status: TrainingProgramStatus }) {
  const t = useTranslations();
  const { tone } = programStatusPresentation[status];
  return <Badge tone={tone}>{t.training.programStatuses[status]}</Badge>;
}

/** One glyph per training type, used beside the type label in lists and the timeline. */
export const trainingTypeIcons: Record<TrainingType, LucideIcon> = {
  flatwork: MoveRight,
  dressage: Medal,
  conditioning: Dumbbell,
  endurance: Waves,
  'speed-work': Gauge,
  jumping: Activity,
  recovery: HeartPulse,
  'ground-work': Footprints,
};

/** Icons that point along the reading direction, and so mirror in Arabic. */
function mirrorClass(type: TrainingType): string {
  return type === 'flatwork' ? 'rtl:-scale-x-100' : '';
}

/**
 * The kind of session, as an icon and a word. Neutral on purpose: the type is
 * not a status, so it does not compete with the status badge next to it.
 */
export function TrainingTypeLabel({ type, className }: { type: TrainingType; className?: string }) {
  const t = useTranslations();
  const Icon = trainingTypeIcons[type];
  return (
    <span className={className ?? 'text-ink-soft inline-flex items-center gap-1.5 text-sm'}>
      <Icon className={`size-4 shrink-0 text-stone-500 ${mirrorClass(type)}`} aria-hidden="true" />
      {t.training.types[type]}
    </span>
  );
}

/** The type icon in its own tile, for rows that lead with it. */
export function TrainingTypeIcon({ type }: { type: TrainingType }) {
  const t = useTranslations();
  const Icon = trainingTypeIcons[type];
  return (
    <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-stone-100 text-stone-700">
      <Icon className={`size-4 ${mirrorClass(type)}`} aria-hidden="true" />
      <span className="sr-only">{t.training.types[type]}</span>
    </span>
  );
}
