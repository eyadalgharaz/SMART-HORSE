import { z } from 'zod';
import { fromDateInputValue } from './format';
import type { HorseGender, HorseInput, HorseStatus } from './types';

/**
 * Client-side validation only — it exists to give fast, clear feedback. The
 * backend will re-validate everything (Master Prompt v1.0 §4).
 *
 * The schema describes the raw form values, which are all strings; `toHorseInput`
 * turns a validated set into the record the service stores. Optional fields are
 * submitted as empty strings and become null there, so "left blank" and "not
 * recorded" are the same thing.
 */

const genders: [HorseGender, ...HorseGender[]] = ['mare', 'stallion', 'gelding', 'filly', 'colt'];
const statusValues: [HorseStatus, ...HorseStatus[]] = ['active', 'in-training', 'resting', 'sold'];

const MICROCHIP_DIGITS = 15;
const EARLIEST_BIRTH_YEAR = 1980;

export const horseFormSchema = z.object({
  name: z.string().trim().min(2, 'Enter the horse’s name.').max(60, 'Use 60 characters or fewer.'),
  breed: z.string().trim().min(1, 'Choose a breed.'),
  gender: z.enum(genders),
  birthDate: z
    .string()
    .min(1, 'Enter a birth date.')
    .refine((value) => !Number.isNaN(new Date(value).getTime()), 'Enter a valid date.')
    .refine((value) => new Date(value) <= new Date(), 'A birth date cannot be in the future.')
    .refine(
      (value) => new Date(value).getFullYear() >= EARLIEST_BIRTH_YEAR,
      `Enter a birth date from ${EARLIEST_BIRTH_YEAR} onwards.`,
    ),
  color: z.string().trim().min(1, 'Enter the coat color.').max(40, 'Use 40 characters or fewer.'),
  registrationNumber: z.string().trim().max(32, 'Use 32 characters or fewer.'),
  microchipNumber: z
    .string()
    .trim()
    .refine(
      (value) => value === '' || new RegExp(`^\\d{${MICROCHIP_DIGITS}}$`).test(value),
      `A microchip number is ${MICROCHIP_DIGITS} digits.`,
    ),
  ownerName: z.string().trim().max(80, 'Use 80 characters or fewer.'),
  status: z.enum(statusValues),
});

export type HorseFormValues = z.infer<typeof horseFormSchema>;

/** Validated form values → the record the service stores. */
export function toHorseInput(values: HorseFormValues, imageUrl: string | null): HorseInput {
  return {
    name: values.name,
    breed: values.breed,
    gender: values.gender,
    birthDate: fromDateInputValue(values.birthDate),
    color: values.color,
    registrationNumber: values.registrationNumber || null,
    microchipNumber: values.microchipNumber || null,
    ownerName: values.ownerName || null,
    status: values.status,
    imageUrl,
  };
}
