/**
 * One place for the words the Training module uses on screen, and for every
 * controlled list it validates against. Filters, tables, the timeline, forms
 * and schemas all read from here, so a label or an allowed value never drifts
 * between two screens. Copy is English-only for now; a later i18n pass
 * replaces this file.
 *
 * The `as const` tuples are the single source of truth for the allowed
 * values: the union types below are derived from them and the Zod schemas
 * validate against the same tuples, so a new training type is added in
 * exactly one place.
 */

/* ------------------------------------------------------------------ */
/* Training types                                                       */
/* ------------------------------------------------------------------ */

export const trainingTypeValues = [
  'flatwork',
  'dressage',
  'conditioning',
  'endurance',
  'speed-work',
  'jumping',
  'recovery',
  'ground-work',
] as const;

export type TrainingType = (typeof trainingTypeValues)[number];

export const trainingTypeLabels: Record<TrainingType, string> = {
  flatwork: 'Flatwork',
  dressage: 'Dressage',
  conditioning: 'Conditioning',
  endurance: 'Endurance',
  'speed-work': 'Speed work',
  jumping: 'Jumping',
  recovery: 'Recovery',
  'ground-work': 'Ground work',
};

export const trainingTypeOptions = trainingTypeValues.map((value) => ({
  value,
  label: trainingTypeLabels[value],
}));

/* ------------------------------------------------------------------ */
/* Session status                                                       */
/* ------------------------------------------------------------------ */

export const sessionStatusValues = ['scheduled', 'in-progress', 'completed', 'cancelled'] as const;

export type TrainingSessionStatus = (typeof sessionStatusValues)[number];

type StatusTone = 'neutral' | 'pasture' | 'warning' | 'danger' | 'success';

export const sessionStatusPresentation: Record<
  TrainingSessionStatus,
  { label: string; tone: StatusTone }
> = {
  scheduled: { label: 'Scheduled', tone: 'neutral' },
  'in-progress': { label: 'In progress', tone: 'warning' },
  completed: { label: 'Completed', tone: 'success' },
  cancelled: { label: 'Cancelled', tone: 'neutral' },
};

export const sessionStatusOptions = sessionStatusValues.map((value) => ({
  value,
  label: sessionStatusPresentation[value].label,
}));

/* ------------------------------------------------------------------ */
/* Program status                                                       */
/* ------------------------------------------------------------------ */

export const programStatusValues = ['planned', 'active', 'completed', 'paused'] as const;

export type TrainingProgramStatus = (typeof programStatusValues)[number];

export const programStatusPresentation: Record<
  TrainingProgramStatus,
  { label: string; tone: StatusTone }
> = {
  planned: { label: 'Planned', tone: 'neutral' },
  active: { label: 'Active', tone: 'pasture' },
  completed: { label: 'Completed', tone: 'success' },
  paused: { label: 'Paused', tone: 'warning' },
};

export const programStatusOptions = programStatusValues.map((value) => ({
  value,
  label: programStatusPresentation[value].label,
}));

/* ------------------------------------------------------------------ */
/* Misc copy and limits                                                 */
/* ------------------------------------------------------------------ */

/** Shown where an optional part of a session was never filled in. */
export const NOT_RECORDED = 'Not recorded';

/** A session dated within this many days counts toward "this week". */
export const WEEK_WINDOW_DAYS = 7;

/** Largest sensible values a form accepts, to keep validation human. */
export const MAX_DURATION_MINUTES = 8 * 60;
export const MAX_DISTANCE_KM = 200;
export const MAX_SPEED_KMH = 80;
