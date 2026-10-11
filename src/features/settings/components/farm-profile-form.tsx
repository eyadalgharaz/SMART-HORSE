'use client';

import { useState, type FormEvent } from 'react';
import { Alert } from '@/components/ui/alert';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useFormErrors } from '@/hooks/use-form-errors';
import { useI18n } from '@/i18n';
import { restoreSource } from '@/i18n/translate';
import { farmFormSchema, toFarmInput } from '../schemas';
import type { Farm, FarmInput } from '../types';
import { farmTypeValues } from '../vocabulary';

/**
 * The Farm Profile form. Sectioned exactly the way the spec describes a farm
 * profile — Basic Information, Contact Information, Location, Branding —
 * with one save covering all four, since they are all facets of the same
 * record rather than independent resources.
 *
 * Branding has no real file upload (mock only): the farm's initials stand in
 * for a logo, the same way `Avatar` already does for a person.
 */
export function FarmProfileForm({
  farm,
  onSaved,
}: {
  farm: Farm;
  onSaved: (input: FarmInput) => Promise<void>;
}) {
  const { errors, validate } = useFormErrors(farmFormSchema);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { t, tc, tm } = useI18n();
  const fp = t.settings.farm;
  const f = t.settings.fields;
  // The farm's own name and details show in the active language when a
  // translation exists; an unchanged field saves its stored value.
  const shown = (value: string | null) => (value ? tc(value) : '');
  const keep = (name: keyof typeof farm, submitted: string) =>
    restoreSource(submitted, farm[name] as string | null, tc);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const data = new FormData(event.currentTarget);
    const read = (name: string) => String(data.get(name) ?? '');

    const values = validate({
      name: keep('name', read('name')),
      type: read('type'),
      description: keep('description', read('description')),
      email: read('email'),
      phone: read('phone'),
      website: read('website'),
      address: keep('address', read('address')),
      city: keep('city', read('city')),
      country: keep('country', read('country')),
    });
    if (!values) return;

    setSubmitting(true);
    try {
      await onSaved(toFarmInput(values));
    } catch (error) {
      setFormError(error instanceof Error ? error.message : fp.saveError);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {formError ? <Alert tone="error">{tm(formError)}</Alert> : null}

      <Card>
        <CardHeader title={fp.branding} headingLevel={3} />
        <CardBody className="flex items-center gap-4">
          <Avatar name={farm.name} className="size-14 text-base" />
          <p className="text-sm text-stone-600">{fp.brandingNote}</p>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title={fp.basicInfo} headingLevel={3} />
        <CardBody className="grid gap-4 sm:grid-cols-2">
          <FormField label={fp.farmName} error={errors.name} required>
            <Input name="name" defaultValue={shown(farm.name)} maxLength={120} />
          </FormField>

          <FormField label={fp.farmType} error={errors.type} required>
            <Select name="type" defaultValue={farm.type}>
              {farmTypeValues.map((value) => (
                <option key={value} value={value}>
                  {t.settings.farmTypes[value]}
                </option>
              ))}
            </Select>
          </FormField>

          <div className="sm:col-span-2">
            <FormField label={fp.description} error={errors.description} hint={t.common.optional}>
              <Textarea
                name="description"
                defaultValue={shown(farm.description)}
                rows={3}
                maxLength={600}
              />
            </FormField>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title={fp.contact} headingLevel={3} />
        <CardBody className="grid gap-4 sm:grid-cols-2">
          <FormField label={f.email} error={errors.email}>
            <Input type="email" name="email" defaultValue={farm.email ?? ''} />
          </FormField>
          <FormField label={f.phone} error={errors.phone}>
            <Input type="tel" name="phone" defaultValue={farm.phone ?? ''} />
          </FormField>
          <div className="sm:col-span-2">
            <FormField label={fp.website} error={errors.website} hint={fp.websiteHint}>
              <Input type="url" name="website" defaultValue={farm.website ?? ''} />
            </FormField>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title={fp.location} headingLevel={3} />
        <CardBody className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <FormField label={fp.address} error={errors.address}>
              <Input name="address" defaultValue={shown(farm.address)} />
            </FormField>
          </div>
          <FormField label={fp.city} error={errors.city}>
            <Input name="city" defaultValue={shown(farm.city)} />
          </FormField>
          <FormField label={fp.country} error={errors.country}>
            <Input name="country" defaultValue={shown(farm.country)} />
          </FormField>
        </CardBody>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" loading={submitting}>
          {submitting ? t.common.savingChanges : t.common.saveChanges}
        </Button>
      </div>
    </form>
  );
}
