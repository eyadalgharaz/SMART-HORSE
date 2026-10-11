'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Alert } from '@/components/ui/alert';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { useFormErrors } from '@/hooks/use-form-errors';
import { useAuth } from '@/features/auth/auth-provider';
import { useI18n, useRoleLabel } from '@/i18n';
import { useUpdateAccount } from '../hooks/use-account';
import { accountProfileSchema, toAccountInput } from '../schemas';
import type { Account } from '../types';
import { savedUrl } from './saved-message';

/**
 * The signed-in person's own profile. Saving here also calls
 * `useAuth().updateUser` so the topbar avatar and the Dashboard greeting
 * reflect the new name immediately — without that, this form could show a
 * different name than the rest of the shell the moment it saved.
 */
export function AccountProfileForm({ account }: { account: Account }) {
  const router = useRouter();
  const { updateUser } = useAuth();
  const { errors, validate } = useFormErrors(accountProfileSchema);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { mutateAsync } = useUpdateAccount();
  const roleLabel = useRoleLabel(account.farmRole ?? 'FarmOwner');
  const { t, tm } = useI18n();
  const a = t.settings.account;
  const f = t.settings.fields;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const data = new FormData(event.currentTarget);
    const read = (name: string) => String(data.get(name) ?? '');

    const values = validate({
      fullName: read('fullName'),
      email: read('email'),
      phone: read('phone'),
    });
    if (!values) return;

    setSubmitting(true);
    try {
      const input = toAccountInput(values);
      await mutateAsync(input);
      updateUser({ fullName: input.fullName, email: input.email });
      router.push(savedUrl('/settings/account', 'profile'));
    } catch (error) {
      setFormError(error instanceof Error ? error.message : a.profileError);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader title={a.profile} headingLevel={3} />
      <CardBody>
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {formError ? <Alert tone="error">{tm(formError)}</Alert> : null}

          <div className="flex items-center gap-4">
            <Avatar name={account.fullName} className="size-14 text-base" />
            <div className="text-sm text-stone-600">
              {account.farmRole ? (
                <p>
                  {a.signedInAs} <span className="text-ink font-medium">{roleLabel}</span>
                </p>
              ) : null}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label={f.fullName} error={errors.fullName} required>
              <Input name="fullName" defaultValue={account.fullName} maxLength={80} />
            </FormField>

            <FormField label={f.email} error={errors.email} required>
              <Input type="email" name="email" defaultValue={account.email} />
            </FormField>

            <FormField label={f.phone} error={errors.phone} hint={t.common.optional}>
              <Input type="tel" name="phone" defaultValue={account.phone ?? ''} />
            </FormField>
          </div>

          <div className="flex justify-end">
            <Button type="submit" loading={submitting}>
              {submitting ? a.savingProfile : a.saveProfile}
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}
