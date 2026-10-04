import { z } from 'zod';
import type { FarmInput, InviteTeamMemberInput, AccountInput, ChangePasswordInput } from './types';
import {
  farmRoleValues,
  farmTypeValues,
  MAX_DESCRIPTION_LENGTH,
  MAX_FARM_NAME_LENGTH,
  MAX_INVITE_MESSAGE_LENGTH,
} from './vocabulary';

/**
 * Client-side validation only — it exists to give fast, clear feedback. The
 * backend will re-validate everything. Optional fields are submitted as
 * empty strings and become `null` in the input the service stores, the same
 * convention every other module's schema follows.
 */

const optionalEmail = z
  .string()
  .trim()
  .refine(
    (value) => value === '' || z.string().email().safeParse(value).success,
    'Enter a valid email address.',
  );

const optionalPhone = z
  .string()
  .trim()
  .refine(
    (value) => value === '' || /^[+()\d][\d\s()-]{6,19}$/.test(value),
    'Enter a valid phone number.',
  );

const optionalUrl = z
  .string()
  .trim()
  .refine(
    (value) => value === '' || /^https?:\/\/.+\..+/.test(value),
    'Enter a valid website address, e.g. https://example.com.',
  );

/* ------------------------------------------------------------------ */
/* Farm profile                                                         */
/* ------------------------------------------------------------------ */

export const farmFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Enter the farm name.')
    .max(MAX_FARM_NAME_LENGTH, `Use ${MAX_FARM_NAME_LENGTH} characters or fewer.`),
  type: z.enum(farmTypeValues, { error: 'Choose a farm type.' }),
  description: z
    .string()
    .trim()
    .max(MAX_DESCRIPTION_LENGTH, `Use ${MAX_DESCRIPTION_LENGTH} characters or fewer.`),
  email: optionalEmail,
  phone: optionalPhone,
  website: optionalUrl,
  address: z.string().trim().max(160, 'Use 160 characters or fewer.'),
  city: z.string().trim().max(80, 'Use 80 characters or fewer.'),
  country: z.string().trim().max(80, 'Use 80 characters or fewer.'),
});

export type FarmFormValues = z.infer<typeof farmFormSchema>;

export function toFarmInput(values: FarmFormValues): FarmInput {
  return {
    name: values.name,
    type: values.type,
    description: values.description || null,
    email: values.email || null,
    phone: values.phone || null,
    website: values.website || null,
    address: values.address || null,
    city: values.city || null,
    country: values.country || null,
  };
}

/* ------------------------------------------------------------------ */
/* Invite team member                                                   */
/* ------------------------------------------------------------------ */

export const inviteMemberSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, 'Enter their full name.')
    .max(80, 'Use 80 characters or fewer.'),
  email: z.string().trim().min(1, 'Enter an email address.').email('Enter a valid email address.'),
  role: z.enum(farmRoleValues, { error: 'Choose a role.' }),
  message: z
    .string()
    .trim()
    .max(MAX_INVITE_MESSAGE_LENGTH, `Use ${MAX_INVITE_MESSAGE_LENGTH} characters or fewer.`),
});

export type InviteMemberFormValues = z.infer<typeof inviteMemberSchema>;

export function toInviteInput(values: InviteMemberFormValues): InviteTeamMemberInput {
  return {
    fullName: values.fullName,
    email: values.email,
    role: values.role,
    message: values.message || null,
  };
}

/* ------------------------------------------------------------------ */
/* Account profile                                                      */
/* ------------------------------------------------------------------ */

export const accountProfileSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, 'Enter your full name.')
    .max(80, 'Use 80 characters or fewer.'),
  email: z
    .string()
    .trim()
    .min(1, 'Enter your email address.')
    .email('Enter a valid email address.'),
  phone: optionalPhone,
});

export type AccountProfileFormValues = z.infer<typeof accountProfileSchema>;

export function toAccountInput(values: AccountProfileFormValues): AccountInput {
  return {
    fullName: values.fullName,
    email: values.email,
    phone: values.phone || null,
  };
}

/* ------------------------------------------------------------------ */
/* Change password — same strength rule as registration (auth/schemas.ts) */
/* ------------------------------------------------------------------ */

const newPassword = z
  .string()
  .min(8, 'Use at least 8 characters.')
  .regex(/[A-Za-z]/, 'Include at least one letter.')
  .regex(/[0-9]/, 'Include at least one number.');

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Enter your current password.'),
    newPassword,
    confirmPassword: z.string().min(1, 'Re-enter your new password.'),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match.',
  })
  .refine((values) => values.currentPassword !== values.newPassword, {
    path: ['newPassword'],
    message: 'Choose a password different from your current one.',
  });

export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

export function toChangePasswordInput(values: ChangePasswordFormValues): ChangePasswordInput {
  return { currentPassword: values.currentPassword, newPassword: values.newPassword };
}
