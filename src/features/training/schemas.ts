import { z } from 'zod';
import { toDateInputValue } from '@/features/horses/format';
import type { Trainer, TrainingSession, TrainingSessionInput } from './types';
import {
  MAX_DISTANCE_KM,
  MAX_DURATION_MINUTES,
  MAX_SPEED_KMH,
  trainingTypeValues,
  sessionStatusValues,
} from './vocabulary';

/**
 * Client-side validation only — it exists to give fast, clear feedback. The
 * backend will re-validate everything.
 *
 * The schema describes the raw form values, which are all strings;
 * `toTrainingSessionInput` turns a validated set into the session the service
 * stores. Optional numeric fields are submitted as empty strings and become
 * null there, so "left blank" and "not tracked" are the same thing.
 *
 * Dates are compared as "YYYY-MM-DD" strings, which sorts the same as the
 * calendar and avoids comparing instants across time zones.
 */

const isValidDay = (value: string) => !Number.isNaN(new Date(value).getTime());

const optionalText = (max: number) => z.string().trim().max(max, `Use ${max} characters or fewer.`);

/** A number field submitted as a string; empty means "not tracked" when `optional`. */
function numberField(options: { min: number; max: number; label: string; optional?: boolean }) {
  const { min, max, label, optional = false } = options;
  return z
    .string()
    .trim()
    .refine((value) => (optional ? true : value !== ''), `Enter ${label.toLowerCase()}.`)
    .refine(
      (value) => value === '' || !Number.isNaN(Number(value)),
      `Enter a valid number for ${label.toLowerCase()}.`,
    )
    .refine(
      (value) => value === '' || (Number(value) >= min && Number(value) <= max),
      `${label} must be between ${min} and ${max}.`,
    );
}

export const trainingSessionFormSchema = z
  .object({
    programId: z.string(),
    trainingType: z.enum(trainingTypeValues, { error: 'Choose a training type.' }),
    title: z
      .string()
      .trim()
      .min(3, 'Enter a short title (at least 3 characters).')
      .max(120, 'Use 120 characters or fewer.'),
    date: z.string().min(1, 'Enter the date.').refine(isValidDay, 'Enter a valid date.'),
    startTime: z.string().min(1, 'Enter a start time.'),
    durationMinutes: numberField({ min: 5, max: MAX_DURATION_MINUTES, label: 'Duration' }),
    trainerId: z.string().min(1, 'Choose a trainer.'),
    status: z.enum(sessionStatusValues, { error: 'Choose a status.' }),
    distanceKm: numberField({ min: 0, max: MAX_DISTANCE_KM, label: 'Distance', optional: true }),
    avgSpeedKmh: numberField({
      min: 0,
      max: MAX_SPEED_KMH,
      label: 'Average speed',
      optional: true,
    }),
    maxSpeedKmh: numberField({
      min: 0,
      max: MAX_SPEED_KMH,
      label: 'Maximum speed',
      optional: true,
    }),
    result: optionalText(300),
    trainerNotes: optionalText(1000),
    notes: optionalText(1000),
  })
  .superRefine((values, ctx) => {
    const fail = (path: string, message: string) =>
      ctx.addIssue({ code: 'custom', path: [path], message });

    const today = toDateInputValue(new Date().toISOString());
    const dateIsValid = values.date !== '' && isValidDay(values.date);

    if (dateIsValid) {
      if (values.status === 'scheduled' && values.date < today) {
        fail('date', 'A scheduled session needs a date of today or later.');
      }
      if ((values.status === 'completed' || values.status === 'cancelled') && values.date > today) {
        fail('date', "A completed or cancelled session can't be dated in the future.");
      }
    }

    if (
      values.avgSpeedKmh !== '' &&
      values.maxSpeedKmh !== '' &&
      Number(values.maxSpeedKmh) < Number(values.avgSpeedKmh)
    ) {
      fail('maxSpeedKmh', "Maximum speed can't be lower than the average speed.");
    }
  });

export type TrainingSessionFormValues = z.infer<typeof trainingSessionFormSchema>;

function toNumberOrNull(value: string): number | null {
  return value === '' ? null : Number(value);
}

/** "2026-09-18" + "09:30" → the start of that local minute, as an ISO instant. */
export function combineDateAndTime(dateValue: string, timeValue: string): string {
  const [year, month, day] = dateValue.split('-').map(Number);
  const [hour, minute] = timeValue.split(':').map(Number);
  return new Date(year ?? 0, (month ?? 1) - 1, day ?? 1, hour ?? 0, minute ?? 0).toISOString();
}

/** Validated form values → the session the service stores. */
export function toTrainingSessionInput(
  values: TrainingSessionFormValues,
  horseId: string,
  trainers: Trainer[],
  previous?: TrainingSession,
): TrainingSessionInput {
  const trainer = trainers.find((candidate) => candidate.id === values.trainerId);

  return {
    horseId,
    programId: values.programId || null,
    trainingType: values.trainingType,
    title: values.title,
    date: combineDateAndTime(values.date, values.startTime),
    durationMinutes: Number(values.durationMinutes),
    trainerId: values.trainerId,
    trainerName: trainer?.name ?? previous?.trainerName ?? 'Unknown trainer',
    status: values.status,
    distanceKm: toNumberOrNull(values.distanceKm),
    avgSpeedKmh: toNumberOrNull(values.avgSpeedKmh),
    maxSpeedKmh: toNumberOrNull(values.maxSpeedKmh),
    result: values.result || null,
    trainerNotes: values.trainerNotes || null,
    notes: values.notes || null,
  };
}
