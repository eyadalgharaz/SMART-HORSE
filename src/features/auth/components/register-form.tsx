'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { useFormErrors } from '@/hooks/use-form-errors';
import { useI18n } from '@/i18n';
import { useAuth } from '../auth-provider';
import { registerSchema } from '../schemas';
import { RoleSelect } from './role-select';

export function RegisterForm() {
  const { register } = useAuth();
  const router = useRouter();
  const { errors, validate } = useFormErrors(registerSchema);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { t, tm } = useI18n();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const data = new FormData(event.currentTarget);
    const values = validate({
      fullName: String(data.get('fullName') ?? ''),
      email: String(data.get('email') ?? ''),
      password: String(data.get('password') ?? ''),
      confirmPassword: String(data.get('confirmPassword') ?? ''),
      farmRole: String(data.get('farmRole') ?? ''),
    });
    if (!values) return;

    setSubmitting(true);
    try {
      await register({
        fullName: values.fullName,
        email: values.email,
        password: values.password,
        farmRole: values.farmRole,
      });
      router.replace('/dashboard');
    } catch (error) {
      setFormError(error instanceof Error ? error.message : t.auth.register.genericError);
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {formError ? <Alert tone="error">{tm(formError)}</Alert> : null}

      <FormField label={t.auth.register.fullNameLabel} error={errors.fullName} required>
        <Input
          name="fullName"
          autoComplete="name"
          placeholder={t.auth.register.fullNamePlaceholder}
        />
      </FormField>

      <FormField label={t.auth.register.emailLabel} error={errors.email} required>
        <Input name="email" type="email" autoComplete="email" placeholder="you@stable.com" />
      </FormField>

      <FormField
        label={t.auth.register.passwordLabel}
        error={errors.password}
        hint={t.auth.register.passwordHint}
        required
      >
        <PasswordInput name="password" autoComplete="new-password" />
      </FormField>

      <FormField
        label={t.auth.register.confirmPasswordLabel}
        error={errors.confirmPassword}
        required
      >
        <PasswordInput name="confirmPassword" autoComplete="new-password" />
      </FormField>

      <RoleSelect error={errors.farmRole} required />

      <Button type="submit" fullWidth loading={submitting}>
        {submitting ? t.auth.register.submitting : t.auth.register.submit}
      </Button>
    </form>
  );
}
