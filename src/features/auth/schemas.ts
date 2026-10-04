import { z } from 'zod';
import { isFarmRole, type FarmRole } from './roles';

/**
 * Client-side validation only — it exists to give fast, clear feedback.
 * The backend re-validates everything; see Master Prompt v1.0 §4.
 */

const email = z
  .string()
  .trim()
  .min(1, 'Enter your email address.')
  .email('Enter a valid email address.');

const password = z
  .string()
  .min(8, 'Use at least 8 characters.')
  .regex(/[A-Za-z]/, 'Include at least one letter.')
  .regex(/[0-9]/, 'Include at least one number.');

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Enter your password.'),
});

const farmRole = z
  .string()
  .min(1, 'Choose your role.')
  .refine(isFarmRole, 'Choose your role.')
  .transform((value) => value as FarmRole);

export const registerSchema = z
  .object({
    fullName: z.string().trim().min(2, 'Enter your full name.'),
    email,
    password,
    confirmPassword: z.string().min(1, 'Re-enter your password.'),
    farmRole,
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match.',
  });

export const forgotPasswordSchema = z.object({ email });

export const resetPasswordSchema = z
  .object({
    password,
    confirmPassword: z.string().min(1, 'Re-enter your password.'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match.',
  });

export type LoginValues = z.infer<typeof loginSchema>;
export type RegisterValues = z.infer<typeof registerSchema>;
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;
