'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { PasswordInput } from '@/components/ui/password-input';
import { useFormErrors } from '@/hooks/use-form-errors';
import { useTranslations } from '@/i18n';
import { authService } from '../auth-service';
import { resetPasswordSchema } from '../schemas';

/** `token` arrives in the reset link; the backend will validate it later. */
export function ResetPasswordForm({ token }: { token: string }) {
  const { errors, validate } = useFormErrors(resetPasswordSchema);
  const [done, setDone] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const t = useTranslations();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const data = new FormData(event.currentTarget);
    const values = validate({
      password: String(data.get('password') ?? ''),
      confirmPassword: String(data.get('confirmPassword') ?? ''),
    });
    if (!values) return;

    setSubmitting(true);
    try {
      await authService.resetPassword({ token, password: values.password });
      setDone(true);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : t.auth.resetPassword.genericError);
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="space-y-4">
        <Alert tone="success" title={t.auth.resetPassword.doneTitle}>
          {t.auth.resetPassword.doneBody}
        </Alert>
        <Link href="/login" className="block">
          <Button fullWidth>{t.auth.resetPassword.goToSignIn}</Button>
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {formError ? <Alert tone="error">{formError}</Alert> : null}

      <FormField
        label={t.auth.resetPassword.newPasswordLabel}
        error={errors.password}
        hint={t.auth.resetPassword.newPasswordHint}
        required
      >
        <PasswordInput name="password" autoComplete="new-password" />
      </FormField>

      <FormField label={t.auth.resetPassword.confirmLabel} error={errors.confirmPassword} required>
        <PasswordInput name="confirmPassword" autoComplete="new-password" />
      </FormField>

      <Button type="submit" fullWidth loading={submitting}>
        {submitting ? t.auth.resetPassword.submitting : t.auth.resetPassword.submit}
      </Button>
    </form>
  );
}
