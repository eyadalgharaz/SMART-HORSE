import { z } from 'zod';
import { fromDateInputValue, toDateInputValue } from '@/features/horses/format';
import type { MedicalAttachment, MedicalRecord, MedicalRecordInput } from './types';
import { recordStatusValues, recordTypeValues } from './vocabulary';

/**
 * Client-side validation only — it exists to give fast, clear feedback. The
 * backend will re-validate everything (Master Prompt v1.0 §4).
 *
 * The schema describes the raw form values, which are all strings;
 * `toMedicalRecordInput` turns a validated set into the record the service
 * stores. Optional fields are submitted as empty strings and become null there,
 * so "left blank" and "not recorded" are the same thing.
 *
 * Dates are compared as "YYYY-MM-DD" strings. That format sorts the same as the
 * calendar, and it avoids comparing instants across time zones.
 */

const isValidDay = (value: string) => !Number.isNaN(new Date(value).getTime());

const optionalDate = z
  .string()
  .refine((value) => value === '' || isValidDay(value), 'Enter a valid date.');

const optionalText = (max: number) => z.string().trim().max(max, `Use ${max} characters or fewer.`);

export const medicalRecordFormSchema = z
  .object({
    recordType: z.enum(recordTypeValues, { error: 'Choose a record type.' }),
    status: z.enum(recordStatusValues, { error: 'Choose a status.' }),
    date: z.string().min(1, 'Enter the date.').refine(isValidDay, 'Enter a valid date.'),
    veterinarian: optionalText(80),

    title: z
      .string()
      .trim()
      .min(3, 'Enter a short title (at least 3 characters).')
      .max(120, 'Use 120 characters or fewer.'),
    diagnosis: optionalText(200),
    treatment: optionalText(1000),
    medication: optionalText(200),
    notes: optionalText(2000),

    followUpDate: optionalDate,
    followUpNotes: optionalText(500),

    /** Only read when the record type is Vaccination. */
    vaccineName: optionalText(80),
    vaccineNextDueDate: optionalDate,
  })
  .superRefine((values, ctx) => {
    const fail = (path: string, message: string) =>
      ctx.addIssue({ code: 'custom', path: [path], message });

    const today = toDateInputValue(new Date().toISOString());
    const dateIsValid = values.date !== '' && isValidDay(values.date);

    if (dateIsValid) {
      if (values.status === 'scheduled' && values.date < today) {
        fail('date', 'A scheduled record needs a date of today or later.');
      }
      if (values.status !== 'scheduled' && values.date > today) {
        fail(
          'date',
          "A record that has already happened can't be dated in the future. Choose Scheduled for an upcoming visit.",
        );
      }
    }

    if (values.followUpDate && isValidDay(values.followUpDate) && dateIsValid) {
      if (values.followUpDate < values.date) {
        fail('followUpDate', "The follow-up can't be before the record date.");
      }
    }
    if (values.status === 'follow-up-required' && !values.followUpDate) {
      fail('followUpDate', 'Set a follow-up date, or change the status.');
    }

    if (values.recordType === 'vaccination') {
      if (!values.vaccineName) fail('vaccineName', 'Enter the vaccine name.');
      if (values.vaccineNextDueDate && isValidDay(values.vaccineNextDueDate) && dateIsValid) {
        if (values.vaccineNextDueDate <= values.date) {
          fail('vaccineNextDueDate', 'The next dose must fall after this one.');
        }
      }
    }
  });

export type MedicalRecordFormValues = z.infer<typeof medicalRecordFormSchema>;

/**
 * An unchanged date keeps the exact instant it had, so editing a booked 9:30
 * appointment does not silently move it to midnight. A changed date starts at
 * the beginning of the chosen day, like every other date the form produces.
 */
function dateFromInput(value: string, previousIso: string | null | undefined): string {
  if (previousIso && toDateInputValue(previousIso) === value) return previousIso;
  return fromDateInputValue(value);
}

/** Validated form values → the record the service stores. */
export function toMedicalRecordInput(
  values: MedicalRecordFormValues,
  attachments: MedicalAttachment[],
  previous?: MedicalRecord,
): MedicalRecordInput {
  return {
    recordType: values.recordType,
    status: values.status,
    date: dateFromInput(values.date, previous?.date),
    title: values.title,
    veterinarian: values.veterinarian || null,
    diagnosis: values.diagnosis || null,
    treatment: values.treatment || null,
    medication: values.medication || null,
    notes: values.notes || null,
    followUpDate: values.followUpDate
      ? dateFromInput(values.followUpDate, previous?.followUpDate)
      : null,
    followUpNotes: values.followUpNotes || null,
    vaccine:
      values.recordType === 'vaccination'
        ? {
            name: values.vaccineName,
            nextDueDate: values.vaccineNextDueDate
              ? dateFromInput(values.vaccineNextDueDate, previous?.vaccine?.nextDueDate)
              : null,
          }
        : null,
    attachments,
  };
}
