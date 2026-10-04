'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { FormField } from '@/components/ui/form-field';
import { Select } from '@/components/ui/select';
import { useUpdateAccountPreferences } from '../hooks/use-preferences';
import type { AccountPreferences } from '../types';
import {
  dateFormatValues,
  dateFormatLabels,
  timeFormatValues,
  timeFormatLabels,
} from '../vocabulary';
import { savedUrl } from './saved-message';

/**
 * A small set of preferences, kept small on purpose: date and time format
 * are stored here but are not yet wired to how dates render elsewhere in the
 * app — a documented limitation, not a broken feature. Adding preferences
 * just to make this page look fuller is exactly what the spec for this phase
 * warns against.
 */
export function AccountPreferencesForm({ preferences }: { preferences: AccountPreferences }) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { mutateAsync } = useUpdateAccountPreferences();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const data = new FormData(event.currentTarget);
    const read = (name: string) => String(data.get(name) ?? '');

    setSubmitting(true);
    try {
      await mutateAsync({
        emailNotifications: read('emailNotifications') === 'on',
        dateFormat: read('dateFormat') as AccountPreferences['dateFormat'],
        timeFormat: read('timeFormat') as AccountPreferences['timeFormat'],
      });
      router.push(savedUrl('/settings/account', 'preferences'));
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Could not save your preferences.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader title="Preferences" headingLevel={3} />
      <CardBody>
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {formError ? <Alert tone="error">{formError}</Alert> : null}

          <div className="grid gap-4 sm:grid-cols-3">
            <FormField label="Email notifications">
              <Select
                name="emailNotifications"
                defaultValue={preferences.emailNotifications ? 'on' : 'off'}
              >
                <option value="on">On</option>
                <option value="off">Off</option>
              </Select>
            </FormField>

            <FormField label="Date format">
              <Select name="dateFormat" defaultValue={preferences.dateFormat}>
                {dateFormatValues.map((value) => (
                  <option key={value} value={value}>
                    {dateFormatLabels[value]}
                  </option>
                ))}
              </Select>
            </FormField>

            <FormField label="Time format">
              <Select name="timeFormat" defaultValue={preferences.timeFormat}>
                {timeFormatValues.map((value) => (
                  <option key={value} value={value}>
                    {timeFormatLabels[value]}
                  </option>
                ))}
              </Select>
            </FormField>
          </div>

          <div className="flex justify-end">
            <Button type="submit" loading={submitting}>
              {submitting ? 'Saving preferences' : 'Save preferences'}
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}
