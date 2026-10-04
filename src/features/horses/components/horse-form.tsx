'use client';

import { useState, type FormEvent } from 'react';
import { Alert } from '@/components/ui/alert';
import { Button, ButtonLink } from '@/components/ui/button';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { useFormErrors } from '@/hooks/use-form-errors';
import { toDateInputValue } from '../format';
import { horseFormSchema, toHorseInput, type HorseFormValues } from '../schemas';
import type { Horse, HorseInput } from '../types';
import { breedOptions, genderOptions, statusOptions } from '../vocabulary';
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
  const defaults = defaultsFrom(horse);
  const { errors, validate } = useFormErrors(horseFormSchema);
  const [imageUrl, setImageUrl] = useState<string | null>(defaults.imageUrl);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const data = new FormData(event.currentTarget);
    const values = validate({
      name: String(data.get('name') ?? ''),
      breed: String(data.get('breed') ?? ''),
      gender: String(data.get('gender') ?? ''),
      birthDate: String(data.get('birthDate') ?? ''),
      color: String(data.get('color') ?? ''),
      registrationNumber: String(data.get('registrationNumber') ?? ''),
      microchipNumber: String(data.get('microchipNumber') ?? ''),
      ownerName: String(data.get('ownerName') ?? ''),
      status: String(data.get('status') ?? ''),
    });
    if (!values) return;

    setSubmitting(true);
    try {
      await onSubmit(toHorseInput(values, imageUrl));
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Could not save this horse.');
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {formError ? <Alert tone="error">{formError}</Alert> : null}

      <Card>
        <CardHeader title="Basic information" headingLevel={3} />
        <CardBody className="grid gap-4 sm:grid-cols-2">
          <FormField label="Name" error={errors.name} required>
            <Input
              name="name"
              defaultValue={defaults.name}
              placeholder="e.g. Luna"
              maxLength={60}
            />
          </FormField>

          <FormField label="Breed" error={errors.breed} required>
            <Input
              name="breed"
              list="horse-breed-options"
              defaultValue={defaults.breed}
              placeholder="e.g. Arabian"
            />
          </FormField>
          <datalist id="horse-breed-options">
            {breedOptions.map((breed) => (
              <option key={breed} value={breed} />
            ))}
          </datalist>

          <FormField label="Gender" error={errors.gender} required>
            <Select name="gender" defaultValue={defaults.gender}>
              {genderOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </FormField>

          <FormField label="Color" error={errors.color} required>
            <Input
              name="color"
              defaultValue={defaults.color}
              placeholder="e.g. Grey"
              maxLength={40}
            />
          </FormField>

          <FormField label="Birth date" error={errors.birthDate} required>
            <Input type="date" name="birthDate" defaultValue={defaults.birthDate} max={today()} />
          </FormField>

          <FormField label="Status" error={errors.status} required>
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
          title="Identification"
          description="Leave blank if not yet issued."
          headingLevel={3}
        />
        <CardBody className="grid gap-4 sm:grid-cols-2">
          <FormField label="Registration number" error={errors.registrationNumber}>
            <Input
              name="registrationNumber"
              defaultValue={defaults.registrationNumber}
              placeholder="e.g. AHA-284193"
              maxLength={32}
            />
          </FormField>

          <FormField
            label="Microchip number"
            error={errors.microchipNumber}
            hint="15 digits, as printed on the chip certificate."
          >
            <Input
              name="microchipNumber"
              defaultValue={defaults.microchipNumber}
              placeholder="e.g. 985141002734611"
              inputMode="numeric"
              maxLength={15}
            />
          </FormField>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Ownership" headingLevel={3} />
        <CardBody>
          <FormField
            label="Owner"
            error={errors.ownerName}
            hint="Leave blank if this horse has no assigned owner yet."
          >
            <Input
              name="ownerName"
              defaultValue={defaults.ownerName}
              placeholder="e.g. Ahmed Hassan"
              maxLength={80}
            />
          </FormField>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Photo" headingLevel={3} />
        <CardBody>
          <HorseImageField name={defaults.name} value={imageUrl} onChange={setImageUrl} />
        </CardBody>
      </Card>

      <div className="flex flex-wrap justify-end gap-2">
        <ButtonLink href={onCancelHref} variant="secondary">
          Cancel
        </ButtonLink>
        <Button type="submit" loading={submitting}>
          {submitting ? submittingLabel : submitLabel}
        </Button>
      </div>
    </form>
  );
}
