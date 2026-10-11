'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { useFormErrors } from '@/hooks/use-form-errors';
import { useI18n } from '@/i18n';
import { useAuth } from '../auth-provider';
import { loginSchema } from '../schemas';

export function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const { errors, validate } = useFormErrors(loginSchema);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { t, tm } = useI18n();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const data = new FormData(event.currentTarget);
    const values = validate({
      email: String(data.get('email') ?? ''),
      password: String(data.get('password') ?? ''),
    });
    if (!values) return;

    setSubmitting(true);
    try {
      await login(values);
      router.replace('/dashboard');
    } catch (error) {
      setFormError(error instanceof Error ? error.message : t.auth.login.genericError);
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {formError ? <Alert tone="error">{tm(formError)}</Alert> : null}

      <FormField label={t.auth.login.emailLabel} error={errors.email} required>
        <Input name="email" type="email" autoComplete="email" placeholder="you@stable.com" />
      </FormField>

      <FormField label={t.auth.login.passwordLabel} error={errors.password} required>
        <PasswordInput name="password" autoComplete="current-password" />
      </FormField>

      <div className="flex justify-end">
        <Link
          href="/forgot-password"
          className="text-pasture-600 text-sm underline underline-offset-2"
        >
          {t.auth.login.forgotPassword}
        </Link>
      </div>

      <Button type="submit" fullWidth loading={submitting}>
        {submitting ? t.auth.login.submitting : t.auth.login.submit}
      </Button>
    </form>
  );
}
