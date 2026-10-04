import type { LucideIcon } from 'lucide-react';
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  Clock,
  Dumbbell,
  Stethoscope,
  Syringe,
  UserPlus,
} from 'lucide-react';
import type { NotificationType } from '../types';
import { notificationTypeLabels } from '../vocabulary';

/**
 * One glyph and one tone per notification type, so the kind of notification
 * is understandable from its icon alone — not just its color, and not just
 * its (screen-reader-only) label.
 */
const typeIcons: Record<NotificationType, LucideIcon> = {
  'task-assigned': UserPlus,
  'task-due-soon': Clock,
  'task-overdue': AlertTriangle,
  'task-completed': CheckCircle2,
  'medical-reminder': Stethoscope,
  'vaccination-reminder': Syringe,
  'training-reminder': Dumbbell,
  system: Bell,
};

const typeTone: Record<NotificationType, string> = {
  'task-assigned': 'bg-pasture-50 text-pasture-600',
  'task-due-soon': 'bg-amber-50 text-amber-600',
  'task-overdue': 'bg-red-50 text-red-600',
  'task-completed': 'bg-pasture-50 text-pasture-600',
  'medical-reminder': 'bg-red-50 text-red-600',
  'vaccination-reminder': 'bg-amber-50 text-amber-600',
  'training-reminder': 'bg-stone-100 text-stone-700',
  system: 'bg-stone-100 text-stone-700',
};

export function NotificationTypeIcon({ type }: { type: NotificationType }) {
  const Icon = typeIcons[type];
  return (
    <span
      className={`flex size-9 shrink-0 items-center justify-center rounded-full ${typeTone[type]}`}
    >
      <Icon className="size-4" aria-hidden="true" />
      <span className="sr-only">{notificationTypeLabels[type]}</span>
    </span>
  );
}

/** A small dot plus visually-hidden text, so "unread" is never color-only. */
export function UnreadDot({ label = 'Unread' }: { label?: string }) {
  return (
    <span className="mt-1.5 inline-flex shrink-0 items-center gap-1.5">
      <span className="bg-pasture-500 block size-2 rounded-full" aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </span>
  );
}
