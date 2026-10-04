/**
 * One place for the words the Tasks module uses on screen, and for every
 * controlled list it validates against. Filters, the list, the form and
 * schemas all read from here, so a label or an allowed value never drifts
 * between two screens.
 *
 * The `as const` tuples are the single source of truth for the allowed
 * values: the union types below are derived from them and the Zod schema
 * validates against the same tuples, so a new category is added in exactly
 * one place.
 */

/* ------------------------------------------------------------------ */
/* Category                                                             */
/* ------------------------------------------------------------------ */

export const taskCategoryValues = [
  'care',
  'feeding',
  'grooming',
  'health',
  'medication',
  'training',
  'stable',
  'administrative',
  'other',
] as const;

export type TaskCategory = (typeof taskCategoryValues)[number];

export const taskCategoryLabels: Record<TaskCategory, string> = {
  care: 'Care',
  feeding: 'Feeding',
  grooming: 'Grooming',
  health: 'Health',
  medication: 'Medication',
  training: 'Training',
  stable: 'Stable',
  administrative: 'Administrative',
  other: 'Other',
};

export const taskCategoryOptions = taskCategoryValues.map((value) => ({
  value,
  label: taskCategoryLabels[value],
}));

/* ------------------------------------------------------------------ */
/* Status (as stored) — "overdue" is never one of these; see format.ts  */
/* ------------------------------------------------------------------ */

export const taskStatusValues = ['pending', 'in-progress', 'completed', 'cancelled'] as const;

export type TaskStatus = (typeof taskStatusValues)[number];

type StatusTone = 'neutral' | 'pasture' | 'warning' | 'danger' | 'success';

export const taskStatusPresentation: Record<TaskStatus, { label: string; tone: StatusTone }> = {
  pending: { label: 'Pending', tone: 'neutral' },
  'in-progress': { label: 'In progress', tone: 'warning' },
  completed: { label: 'Completed', tone: 'success' },
  cancelled: { label: 'Cancelled', tone: 'neutral' },
};

export const taskStatusOptions = taskStatusValues.map((value) => ({
  value,
  label: taskStatusPresentation[value].label,
}));

/**
 * The due-date view of a task, computed from its due date and stored status —
 * never stored itself, so it can never drift from the date beside it. Kept
 * next to `TaskStatus` because every status badge and filter treats the two
 * as one combined vocabulary.
 */
export const dueStateValues = ['overdue', 'due-today', 'upcoming', 'no-date'] as const;

export type DueState = (typeof dueStateValues)[number];

export const dueStatePresentation: Record<DueState, { label: string; tone: StatusTone }> = {
  overdue: { label: 'Overdue', tone: 'danger' },
  'due-today': { label: 'Due today', tone: 'warning' },
  upcoming: { label: 'Upcoming', tone: 'neutral' },
  'no-date': { label: 'No due date', tone: 'neutral' },
};

/* ------------------------------------------------------------------ */
/* Priority                                                             */
/* ------------------------------------------------------------------ */

export const taskPriorityValues = ['low', 'medium', 'high', 'urgent'] as const;

export type TaskPriority = (typeof taskPriorityValues)[number];

export const taskPriorityPresentation: Record<TaskPriority, { label: string; tone: StatusTone }> = {
  low: { label: 'Low', tone: 'neutral' },
  medium: { label: 'Medium', tone: 'pasture' },
  high: { label: 'High', tone: 'warning' },
  urgent: { label: 'Urgent', tone: 'danger' },
};

export const taskPriorityOptions = taskPriorityValues.map((value) => ({
  value,
  label: taskPriorityPresentation[value].label,
}));

/* ------------------------------------------------------------------ */
/* Recurrence                                                           */
/* ------------------------------------------------------------------ */

export const recurrenceFrequencyValues = ['none', 'daily', 'weekly', 'monthly'] as const;

export type RecurrenceFrequency = (typeof recurrenceFrequencyValues)[number];

export const recurrenceFrequencyLabels: Record<RecurrenceFrequency, string> = {
  none: 'Does not repeat',
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
};

export const recurrenceFrequencyOptions = recurrenceFrequencyValues.map((value) => ({
  value,
  label: recurrenceFrequencyLabels[value],
}));

/* ------------------------------------------------------------------ */
/* Misc                                                                 */
/* ------------------------------------------------------------------ */

export const MAX_TITLE_LENGTH = 120;
export const MAX_NOTES_LENGTH = 1000;
export const MAX_DESCRIPTION_LENGTH = 500;
