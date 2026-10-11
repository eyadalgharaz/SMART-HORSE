'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useFormErrors } from '@/hooks/use-form-errors';
import { useInviteTeamMember } from '../hooks/use-team-mutations';
import { inviteMemberSchema, toInviteInput } from '../schemas';
import { useI18n, useRoleOptions } from '@/i18n';
import { savedUrl } from './saved-message';

/**
 * Invite Member is mock only: submitting creates an "Invited" row in the
 * team list, exactly what a backend invitation would produce the moment it
 * is sent, but no email is sent from here. The wording says "Invitation
 * created" rather than "Invitation sent" so the UI never claims to have done
 * something it did not.
 */
export function InviteMemberDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const roleOptions = useRoleOptions();
  const { errors, validate } = useFormErrors(inviteMemberSchema);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { mutateAsync } = useInviteTeamMember();
  const { t, tm } = useI18n();
  const inv = t.settings.invite;
  const f = t.settings.fields;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const data = new FormData(event.currentTarget);
    const read = (name: string) => String(data.get(name) ?? '');

    const values = validate({
      fullName: read('fullName'),
      email: read('email'),
      role: read('role'),
      message: read('message'),
    });
    if (!values) return;

    setSubmitting(true);
    try {
      await mutateAsync(toInviteInput(values));
      onClose();
      router.push(savedUrl('/settings/team', 'invited'));
    } catch (error) {
      setFormError(error instanceof Error ? error.message : inv.saveError);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={inv.title}
      description={inv.description}
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            {t.common.cancel}
          </Button>
          <Button type="submit" form="invite-member-form" loading={submitting}>
            {submitting ? inv.submitting : inv.submit}
          </Button>
        </div>
      }
    >
      <form id="invite-member-form" onSubmit={handleSubmit} noValidate className="space-y-4">
        {formError ? <Alert tone="error">{tm(formError)}</Alert> : null}

        <FormField label={f.fullName} error={errors.fullName} required>
          <Input name="fullName" maxLength={80} />
        </FormField>

        <FormField label={f.email} error={errors.email} required>
          <Input type="email" name="email" />
        </FormField>

        <FormField label={f.role} error={errors.role} required>
          <Select name="role" defaultValue="Worker">
            {roleOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField label={inv.message} error={errors.message} hint={inv.messageHint}>
          <Textarea name="message" rows={3} maxLength={400} />
        </FormField>
      </form>
    </Modal>
  );
}
