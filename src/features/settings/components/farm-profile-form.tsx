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
import { farmFormSchema, toFarmInput } from '../schemas';
import type { Farm, FarmInput } from '../types';
import { farmTypeOptions } from '../vocabulary';

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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const data = new FormData(event.currentTarget);
    const read = (name: string) => String(data.get(name) ?? '');

    const values = validate({
      name: read('name'),
      type: read('type'),
      description: read('description'),
      email: read('email'),
      phone: read('phone'),
      website: read('website'),
      address: read('address'),
      city: read('city'),
      country: read('country'),
    });
    if (!values) return;

    setSubmitting(true);
    try {
      await onSaved(toFarmInput(values));
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Could not save the farm profile.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {formError ? <Alert tone="error">{formError}</Alert> : null}

      <Card>
        <CardHeader title="Branding" headingLevel={3} />
        <CardBody className="flex items-center gap-4">
          <Avatar name={farm.name} className="size-14 text-base" />
          <p className="text-sm text-stone-600">
            Your farm&apos;s initials are used as its icon throughout SmartHorse. A logo upload
            isn&apos;t available yet.
          </p>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Basic information" headingLevel={3} />
        <CardBody className="grid gap-4 sm:grid-cols-2">
          <FormField label="Farm name" error={errors.name} required>
            <Input name="name" defaultValue={farm.name} maxLength={120} />
          </FormField>

          <FormField label="Farm type" error={errors.type} required>
            <Select name="type" defaultValue={farm.type}>
              {farmTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </FormField>

          <div className="sm:col-span-2">
            <FormField label="Description" error={errors.description} hint="Optional.">
              <Textarea
                name="description"
                defaultValue={farm.description ?? ''}
                rows={3}
                maxLength={600}
              />
            </FormField>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Contact information" headingLevel={3} />
        <CardBody className="grid gap-4 sm:grid-cols-2">
          <FormField label="Email" error={errors.email}>
            <Input type="email" name="email" defaultValue={farm.email ?? ''} />
          </FormField>
          <FormField label="Phone" error={errors.phone}>
            <Input type="tel" name="phone" defaultValue={farm.phone ?? ''} />
          </FormField>
          <div className="sm:col-span-2">
            <FormField label="Website" error={errors.website} hint="e.g. https://example.com">
              <Input type="url" name="website" defaultValue={farm.website ?? ''} />
            </FormField>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Location" headingLevel={3} />
        <CardBody className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <FormField label="Address" error={errors.address}>
              <Input name="address" defaultValue={farm.address ?? ''} />
            </FormField>
          </div>
          <FormField label="City" error={errors.city}>
            <Input name="city" defaultValue={farm.city ?? ''} />
          </FormField>
          <FormField label="Country" error={errors.country}>
            <Input name="country" defaultValue={farm.country ?? ''} />
          </FormField>
        </CardBody>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" loading={submitting}>
          {submitting ? 'Saving changes' : 'Save changes'}
        </Button>
      </div>
    </form>
  );
}
