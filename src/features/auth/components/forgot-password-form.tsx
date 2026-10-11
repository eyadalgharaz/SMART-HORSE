'use client';

import { useState, type FormEvent } from 'react';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { useFormErrors } from '@/hooks/use-form-errors';
import { useI18n } from '@/i18n';
import { authService } from '../auth-service';
import { forgotPasswordSchema } from '../schemas';

export function ForgotPasswordForm() {
  const { errors, validate } = useFormErrors(forgotPasswordSchema);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { t, tm } = useI18n();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const data = new FormData(event.currentTarget);
    const values = validate({ email: String(data.get('email') ?? '') });
    if (!values) return;

    setSubmitting(true);
    try {
      await authService.requestPasswordReset(values.email);
      setSentTo(values.email);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : t.auth.forgotPassword.genericError);
    } finally {
      setSubmitting(false);
    }
  }

  if (sentTo) {
    return (
      <Alert tone="success" title={t.auth.forgotPassword.sentTitle}>
        {t.auth.forgotPassword.sentBody(sentTo)}
      </Alert>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {formError ? <Alert tone="error">{tm(formError)}</Alert> : null}

      <FormField label={t.auth.forgotPassword.emailLabel} error={errors.email} required>
        <Input name="email" type="email" autoComplete="email" placeholder="you@stable.com" />
      </FormField>

      <Button type="submit" fullWidth loading={submitting}>
        {submitting ? t.auth.forgotPassword.submitting : t.auth.forgotPassword.submit}
      </Button>
    </form>
  );
}
