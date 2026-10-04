import type { LucideIcon } from 'lucide-react';
import {
  Activity,
  Bandage,
  CalendarClock,
  CircleCheck,
  Clock,
  FileSearch,
  HeartPulse,
  Pill,
  Scissors,
  Stethoscope,
  Syringe,
  TriangleAlert,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { MedicalRecordType } from '../types';
import { recordTypeLabels, statusPresentation, type MedicalStatus } from '../vocabulary';

/**
 * Every medical status — health, vaccination and record — is presented by this
 * one badge, so "Overdue" looks the same wherever it appears. The label is
 * always a word and the states that need action also carry an icon, so colour
 * is never the only signal.
 */

const statusIcons: Partial<Record<MedicalStatus, LucideIcon>> = {
  'needs-attention': TriangleAlert,
  overdue: TriangleAlert,
  'due-soon': Clock,
  'follow-up-required': CalendarClock,
  healthy: CircleCheck,
  'up-to-date': CircleCheck,
};

export function MedicalStatusBadge({ status }: { status: MedicalStatus }) {
  const { label, tone } = statusPresentation[status];
  const Icon = statusIcons[status];
  return (
    <Badge tone={tone} icon={Icon ? <Icon className="size-3.5" aria-hidden="true" /> : undefined}>
      {label}
    </Badge>
  );
}

/** One glyph per record type, used beside the type label in lists and the timeline. */
export const recordTypeIcons: Record<MedicalRecordType, LucideIcon> = {
  checkup: Stethoscope,
  vaccination: Syringe,
  diagnosis: FileSearch,
  treatment: HeartPulse,
  medication: Pill,
  injury: Bandage,
  surgery: Scissors,
  other: Activity,
};

/**
 * The kind of record, as an icon and a word. Neutral on purpose: the type is
 * not a status, so it does not compete with the badge next to it for attention.
 */
export function RecordTypeLabel({
  type,
  className,
}: {
  type: MedicalRecordType;
  className?: string;
}) {
  const Icon = recordTypeIcons[type];
  return (
    <span className={className ?? 'text-ink-soft inline-flex items-center gap-1.5 text-sm'}>
      <Icon className="size-4 shrink-0 text-stone-500" aria-hidden="true" />
      {recordTypeLabels[type]}
    </span>
  );
}

/** The record-type icon in its own tile, for rows that lead with it. */
export function RecordTypeIcon({ type }: { type: MedicalRecordType }) {
  const Icon = recordTypeIcons[type];
  return (
    <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-stone-100 text-stone-700">
      <Icon className="size-4" aria-hidden="true" />
      <span className="sr-only">{recordTypeLabels[type]}</span>
    </span>
  );
}
