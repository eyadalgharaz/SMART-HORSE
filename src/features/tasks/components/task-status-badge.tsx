import type { LucideIcon } from 'lucide-react';
import {
  Briefcase,
  Dumbbell,
  Heart,
  HeartPulse,
  Home,
  MoreHorizontal,
  Pill,
  Sparkles,
  Utensils,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { deriveDueState } from '../format';
import type { Task, TaskCategory, TaskPriority, TaskStatus } from '../types';
import {
  dueStatePresentation,
  taskCategoryLabels,
  taskPriorityPresentation,
  taskStatusPresentation,
} from '../vocabulary';

/** A task's stored status, using the shared badge. */
export function TaskStatusBadge({ status }: { status: TaskStatus }) {
  const { label, tone } = taskStatusPresentation[status];
  return <Badge tone={tone}>{label}</Badge>;
}

/** A task's priority, using the shared badge. Colour only reinforces the word. */
export function TaskPriorityBadge({ priority }: { priority: TaskPriority }) {
  const { label, tone } = taskPriorityPresentation[priority];
  return <Badge tone={tone}>{label}</Badge>;
}

/**
 * The due-date state (overdue / due today / upcoming), derived fresh from the
 * task rather than trusted as a prop, so a stale badge is never possible.
 * Renders nothing for a completed/cancelled task or one with no due date —
 * `TaskStatusBadge` already covers "done", and "no due date" is shown as
 * plain text where it matters instead of a badge with nothing to contrast.
 */
export function TaskDueBadge({ task, reference }: { task: Task; reference?: Date }) {
  const state = deriveDueState(task, reference);
  if (state === 'no-date') return null;
  const { label, tone } = dueStatePresentation[state];
  return <Badge tone={tone}>{label}</Badge>;
}

/** One glyph per task category. */
export const taskCategoryIcons: Record<TaskCategory, LucideIcon> = {
  care: Heart,
  feeding: Utensils,
  grooming: Sparkles,
  health: HeartPulse,
  medication: Pill,
  training: Dumbbell,
  stable: Home,
  administrative: Briefcase,
  other: MoreHorizontal,
};

export function TaskCategoryIcon({ category }: { category: TaskCategory }) {
  const Icon = taskCategoryIcons[category];
  return (
    <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-stone-100 text-stone-700">
      <Icon className="size-4" aria-hidden="true" />
      <span className="sr-only">{taskCategoryLabels[category]}</span>
    </span>
  );
}

export function TaskCategoryLabel({ category }: { category: TaskCategory }) {
  const Icon = taskCategoryIcons[category];
  return (
    <span className="text-ink-soft inline-flex items-center gap-1.5 text-sm">
      <Icon className="size-4 shrink-0 text-stone-500" aria-hidden="true" />
      {taskCategoryLabels[category]}
    </span>
  );
}
