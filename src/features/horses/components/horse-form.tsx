'use client';

import { useState, type FormEvent } from 'react';
import { Alert } from '@/components/ui/alert';
import { Button, ButtonLink } from '@/components/ui/button';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { useFormErrors } from '@/hooks/use-form-errors';
import { useGenderOptions, useI18n, useStatusOptions } from '@/i18n';
import { restoreSource } from '@/i18n/translate';
import { toDateInputValue } from '../format';
import { horseFormSchema, toHorseInput, type HorseFormValues } from '../schemas';
import type { Horse, HorseInput } from '../types';
import { breedOptions } from '../vocabulary';
import { HorseImageField } from './horse-image-field';

const today = () => toDateInputValue(new Date().toISOString());

function defaultsFrom(horse: Horse | undefined): HorseFormValues & { imageUrl: string | null } {
  if (!horse) {
    return {
      name: '',
      breed: '',
      gender: 'mare',
      birthDate: '',
      color: '',
      registrationNumber: '',
      microchipNumber: '',
      ownerName: '',
      status: 'active',
      imageUrl: null,
    };
  }
  return {
    name: horse.name,
    breed: horse.breed,
    gender: horse.gender,
    birthDate: toDateInputValue(horse.birthDate),
    color: horse.color,
    registrationNumber: horse.registrationNumber ?? '',
    microchipNumber: horse.microchipNumber ?? '',
    ownerName: horse.owner?.name ?? '',
    status: horse.status,
    imageUrl: horse.imageUrl,
  };
}

interface HorseFormProps {
  /** Present for Edit, where the form is pre-populated; absent for Add. */
  horse?: Horse;
  submitLabel: string;
  submittingLabel: string;
  onSubmit: (input: HorseInput) => Promise<void>;
  onCancelHref: string;
}

/**
 * Add and Edit are the same form: same fields, same validation, same layout.
 * The only differences are the starting values and what happens on submit, both
 * passed in by the page. Grouped into the same four sections the profile uses
 * — Basic information, Identification, Ownership, Photo — so the record reads
 * the same way whether you're creating or reviewing it.
 */
export function HorseForm({
  horse,
  submitLabel,
  submittingLabel,
  onSubmit,
  onCancelHref,
}: HorseFormProps) {
  const { t, tc, tm } = useI18n();
  const stored = defaultsFrom(horse);
  // Names, breed, colour and owner show in the active language; an unchanged
  // field saves its stored value, not the translation (see `restoreSource`).
  const defaults = {
    ...stored,
    name: tc(stored.name),
    breed: tc(stored.breed),
    color: tc(stored.color),
    ownerName: tc(stored.ownerName),
  };
  const { errors, validate } = useFormErrors(horseFormSchema);
  const [imageUrl, setImageUrl] = useState<string | null>(defaults.imageUrl);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const genderOptions = useGenderOptions();
  const statusOptions = useStatusOptions();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const data = new FormData(event.currentTarget);
    const values = validate({
      name: restoreSource(String(data.get('name') ?? ''), stored.name, tc),
      breed: restoreSource(String(data.get('breed') ?? ''), stored.breed, tc),
      gender: String(data.get('gender') ?? ''),
      birthDate: String(data.get('birthDate') ?? ''),
      color: restoreSource(String(data.get('color') ?? ''), stored.color, tc),
      registrationNumber: String(data.get('registrationNumber') ?? ''),
      microchipNumber: String(data.get('microchipNumber') ?? ''),
      ownerName: restoreSource(String(data.get('ownerName') ?? ''), stored.ownerName, tc),
      status: String(data.get('status') ?? ''),
    });
    if (!values) return;

    setSubmitting(true);
    try {
      await onSubmit(toHorseInput(values, imageUrl));
    } catch (error) {
      setFormError(error instanceof Error ? error.message : t.horses.saveError);
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {formError ? <Alert tone="error">{tm(formError)}</Alert> : null}

      <Card>
        <CardHeader title={t.horses.sections.basicInfo} headingLevel={3} />
        <CardBody className="grid gap-4 sm:grid-cols-2">
          <FormField label={t.horses.fields.name} error={errors.name} required>
            <Input
              name="name"
              defaultValue={defaults.name}
              placeholder={t.horses.placeholders.name}
              maxLength={60}
            />
          </FormField>

          <FormField label={t.horses.fields.breed} error={errors.breed} required>
            <Input
              name="breed"
              list="horse-breed-options"
              defaultValue={defaults.breed}
              placeholder={t.horses.placeholders.breed}
            />
          </FormField>
          {/* The stored value stays the breed's standard (English) name, so
              records match across languages; the localized name is shown
              beside it as the suggestion's label. */}
          <datalist id="horse-breed-options">
            {breedOptions.map((breed) => (
              <option
                key={breed}
                value={breed}
                label={tc(breed) !== breed ? tc(breed) : undefined}
              />
            ))}
          </datalist>

          <FormField label={t.horses.fields.gender} error={errors.gender} required>
            <Select name="gender" defaultValue={defaults.gender}>
              {genderOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </FormField>

          <FormField label={t.horses.fields.color} error={errors.color} required>
            <Input
              name="color"
              defaultValue={defaults.color}
              placeholder={t.horses.placeholders.color}
              maxLength={40}
            />
          </FormField>

          <FormField label={t.horses.fields.birthDate} error={errors.birthDate} required>
            <Input type="date" name="birthDate" defaultValue={defaults.birthDate} max={today()} />
          </FormField>

          <FormField label={t.horses.fields.status} error={errors.status} required>
            <Select name="status" defaultValue={defaults.status}>
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </FormField>
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title={t.horses.sections.identification}
          description={t.horses.hints.identification}
          headingLevel={3}
        />
        <CardBody className="grid gap-4 sm:grid-cols-2">
          <FormField label={t.horses.fields.registrationNumber} error={errors.registrationNumber}>
            <Input
              name="registrationNumber"
              defaultValue={defaults.registrationNumber}
              placeholder={t.horses.placeholders.registration}
              maxLength={32}
              dir="ltr"
            />
          </FormField>

          <FormField
            label={t.horses.fields.microchipNumber}
            error={errors.microchipNumber}
            hint={t.horses.hints.microchip}
          >
            <Input
              name="microchipNumber"
              defaultValue={defaults.microchipNumber}
              placeholder={t.horses.placeholders.microchip}
              inputMode="numeric"
              maxLength={15}
              dir="ltr"
            />
          </FormField>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title={t.horses.sections.ownership} headingLevel={3} />
        <CardBody>
          <FormField
            label={t.horses.fields.owner}
            error={errors.ownerName}
            hint={t.horses.hints.owner}
          >
            <Input
              name="ownerName"
              defaultValue={defaults.ownerName}
              placeholder={t.horses.placeholders.owner}
              maxLength={80}
            />
          </FormField>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title={t.horses.sections.photo} headingLevel={3} />
        <CardBody>
          <HorseImageField name={defaults.name} value={imageUrl} onChange={setImageUrl} />
        </CardBody>
      </Card>

      <div className="flex flex-wrap justify-end gap-2">
        <ButtonLink href={onCancelHref} variant="secondary">
          {t.common.cancel}
        </ButtonLink>
        <Button type="submit" loading={submitting}>
          {submitting ? submittingLabel : submitLabel}
        </Button>
      </div>
    </form>
  );
}
