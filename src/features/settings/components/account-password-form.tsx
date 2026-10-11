'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { FormField } from '@/components/ui/form-field';
import { PasswordInput } from '@/components/ui/password-input';
import { useFormErrors } from '@/hooks/use-form-errors';
import { useI18n } from '@/i18n';
import { useChangePassword } from '../hooks/use-change-password';
import { changePasswordSchema, toChangePasswordInput } from '../schemas';
import { savedUrl } from './saved-message';

/**
 * Password change is mock only: nothing here is logged, stored, or sent
 * anywhere, and the mock service never persists a password value — see
 * `mock-account-service.ts`. The form clears itself after a successful save
 * so the values never linger in the DOM.
 */
export function AccountPasswordForm() {
  const router = useRouter();
  const { errors, validate } = useFormErrors(changePasswordSchema);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { mutateAsync } = useChangePassword();
  const { t, tm } = useI18n();
  const a = t.settings.account;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const form = event.currentTarget;
    const data = new FormData(form);
    const read = (name: string) => String(data.get(name) ?? '');

    const values = validate({
      currentPassword: read('currentPassword'),
      newPassword: read('newPassword'),
      confirmPassword: read('confirmPassword'),
    });
    if (!values) return;

    setSubmitting(true);
    try {
      await mutateAsync(toChangePasswordInput(values));
      form.reset();
      router.push(savedUrl('/settings/account', 'password'));
    } catch (error) {
      setFormError(error instanceof Error ? error.message : a.passwordError);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader title={a.password} headingLevel={3} />
      <CardBody>
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {formError ? <Alert tone="error">{tm(formError)}</Alert> : null}

          <FormField label={a.currentPassword} error={errors.currentPassword} required>
            <PasswordInput name="currentPassword" autoComplete="current-password" />
          </FormField>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              label={a.newPassword}
              error={errors.newPassword}
              required
              hint={a.newPasswordHint}
            >
              <PasswordInput name="newPassword" autoComplete="new-password" />
            </FormField>

            <FormField label={a.confirmPassword} error={errors.confirmPassword} required>
              <PasswordInput name="confirmPassword" autoComplete="new-password" />
            </FormField>
          </div>

          <div className="flex justify-end">
            <Button type="submit" loading={submitting}>
              {submitting ? a.updatingPassword : a.updatePassword}
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}
