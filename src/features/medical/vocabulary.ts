/**
 * One place for the words the Medical module uses on screen, and for every
 * controlled list it validates against. Filters, tables, the timeline, forms
 * and schemas all read from here, so a label or an allowed value never drifts
 * between two screens. Copy is English-only for now; a later i18n pass replaces
 * this file.
 *
 * The `as const` tuples are the single source of truth for the allowed values:
 * the union types below are derived from them and the Zod schemas validate
 * against the same tuples, so a new record type is added in exactly one place.
 */

/* ------------------------------------------------------------------ */
/* Record types                                                        */
/* ------------------------------------------------------------------ */

export const recordTypeValues = [
  'checkup',
  'vaccination',
  'diagnosis',
  'treatment',
  'medication',
  'injury',
  'surgery',
  'other',
] as const;

export type MedicalRecordType = (typeof recordTypeValues)[number];

export const recordTypeLabels: Record<MedicalRecordType, string> = {
  checkup: 'Checkup',
  vaccination: 'Vaccination',
  diagnosis: 'Diagnosis',
  treatment: 'Treatment',
  medication: 'Medication',
  injury: 'Injury',
  surgery: 'Surgery',
  other: 'Other',
};

export const recordTypeOptions = recordTypeValues.map((value) => ({
  value,
  label: recordTypeLabels[value],
}));

/* ------------------------------------------------------------------ */
/* Record status — where a record is in its life                       */
/* ------------------------------------------------------------------ */

export const recordStatusValues = [
  'completed',
  'ongoing',
  'follow-up-required',
  'scheduled',
] as const;

export type MedicalRecordStatus = (typeof recordStatusValues)[number];

/* ------------------------------------------------------------------ */
/* Horse health status — set by a person, never predicted              */
/* ------------------------------------------------------------------ */

export const healthStatusValues = [
  'healthy',
  'monitoring',
  'needs-attention',
  'under-treatment',
  'recovering',
] as const;

export type HealthStatus = (typeof healthStatusValues)[number];

/** Statuses that put a horse on the "requiring attention" list. */
export const attentionStatuses: readonly HealthStatus[] = ['needs-attention', 'under-treatment'];

/* ------------------------------------------------------------------ */
/* Vaccination status — always calculated from dates                   */
/* ------------------------------------------------------------------ */

export const vaccinationStatusValues = ['up-to-date', 'due-soon', 'overdue', 'scheduled'] as const;

export type VaccinationStatus = (typeof vaccinationStatusValues)[number];

/** A dose or visit falling due within this many days counts as "due soon". */
export const DUE_SOON_DAYS = 30;

/** Window for the "recent records" and "upcoming visits" summary figures. */
export const SUMMARY_WINDOW_DAYS = 30;

/* ------------------------------------------------------------------ */
/* One badge vocabulary for every status                               */
/* ------------------------------------------------------------------ */

/**
 * Health, vaccination and record statuses share one badge. "Scheduled" is a
 * member of two of the lists on purpose: it means the same thing in both, so it
 * is presented the same way.
 */
export type MedicalStatus = HealthStatus | VaccinationStatus | MedicalRecordStatus;

type StatusTone = 'neutral' | 'pasture' | 'warning' | 'danger' | 'success';

/**
 * Every status carries a word, so colour is never the only signal. Colour is
 * kept for states that need a decision: quiet neutral for routine states, and
 * red only for the two that genuinely need action (needs attention, overdue).
 */
export const statusPresentation: Record<MedicalStatus, { label: string; tone: StatusTone }> = {
  healthy: { label: 'Healthy', tone: 'success' },
  monitoring: { label: 'Monitoring', tone: 'neutral' },
  'needs-attention': { label: 'Needs attention', tone: 'danger' },
  'under-treatment': { label: 'Under treatment', tone: 'warning' },
  recovering: { label: 'Recovering', tone: 'pasture' },

  'up-to-date': { label: 'Up to date', tone: 'success' },
  'due-soon': { label: 'Due soon', tone: 'warning' },
  overdue: { label: 'Overdue', tone: 'danger' },
  scheduled: { label: 'Scheduled', tone: 'neutral' },

  completed: { label: 'Completed', tone: 'neutral' },
  ongoing: { label: 'Ongoing', tone: 'pasture' },
  'follow-up-required': { label: 'Follow-up needed', tone: 'warning' },
};

export const recordStatusOptions = recordStatusValues.map((value) => ({
  value,
  label: statusPresentation[value].label,
}));

export const vaccinationStatusOptions = vaccinationStatusValues.map((value) => ({
  value,
  label: statusPresentation[value].label,
}));

/* ------------------------------------------------------------------ */
/* Upcoming medical events                                             */
/* ------------------------------------------------------------------ */

export const upcomingEventKindValues = [
  'vaccination-due',
  'follow-up',
  'checkup',
  'medication-review',
  'visit',
] as const;

export type UpcomingEventKind = (typeof upcomingEventKindValues)[number];

export const upcomingEventKindLabels: Record<UpcomingEventKind, string> = {
  'vaccination-due': 'Vaccination',
  'follow-up': 'Follow-up visit',
  checkup: 'Scheduled checkup',
  'medication-review': 'Medication review',
  visit: 'Scheduled visit',
};

/** Kinds that count as a visit from the vet in the "Upcoming vet visits" figure. */
export const vetVisitKinds: readonly UpcomingEventKind[] = ['checkup', 'follow-up', 'visit'];

/* ------------------------------------------------------------------ */
/* Attachments                                                         */
/* ------------------------------------------------------------------ */

export const attachmentTypeValues = ['x-ray', 'lab-result', 'document', 'image'] as const;

export type AttachmentType = (typeof attachmentTypeValues)[number];

export const attachmentTypeLabels: Record<AttachmentType, string> = {
  'x-ray': 'X-ray',
  'lab-result': 'Lab result',
  document: 'Document',
  image: 'Image',
};

export const attachmentTypeOptions = attachmentTypeValues.map((value) => ({
  value,
  label: attachmentTypeLabels[value],
}));

/** Largest file the mock attachment picker accepts, for a realistic limit. */
export const MAX_ATTACHMENT_BYTES = 25 * 1024 * 1024;

/* ------------------------------------------------------------------ */
/* Misc copy                                                           */
/* ------------------------------------------------------------------ */

/** Shown where an optional part of a record was never filled in. */
export const NOT_RECORDED = 'Not recorded';
