'use client';

import { useState, type FormEvent } from 'react';
import { Alert } from '@/components/ui/alert';
import { Button, ButtonLink } from '@/components/ui/button';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useFormErrors } from '@/hooks/use-form-errors';
import { toDateInputValue } from '@/features/horses/format';
import {
  medicalRecordFormSchema,
  toMedicalRecordInput,
  type MedicalRecordFormValues,
} from '../schemas';
import type { MedicalAttachment, MedicalRecord, MedicalRecordInput } from '../types';
import { recordStatusOptions, recordTypeOptions } from '../vocabulary';
import { MedicalAttachmentField } from './medical-attachment-field';

/**
 * Add and Edit are the same form: same fields, same validation, same layout.
 * The only differences are the starting values and what happens on submit, both
 * passed in by the page.
 *
 * Grouped into the sections a clinical record actually has — Basic information,
 * Clinical information, Follow-up, Attachments — so the form reads in the same
 * order as the record detail it produces.
 *
 * Record type is held in React state rather than read only on submit, because
 * the vaccine fields appear and disappear with it. Everything else is
 * uncontrolled and read from the form on submit, which is how the Horses form
 * works too.
 */

function defaultsFrom(record: MedicalRecord | undefined): MedicalRecordFormValues {
  if (!record) {
    return {
      recordType: 'checkup',
      status: 'completed',
      date: toDateInputValue(new Date().toISOString()),
      veterinarian: '',
      title: '',
      diagnosis: '',
      treatment: '',
      medication: '',
      notes: '',
      followUpDate: '',
      followUpNotes: '',
      vaccineName: '',
      vaccineNextDueDate: '',
    };
  }

  return {
    recordType: record.recordType,
    status: record.status,
    date: toDateInputValue(record.date),
    veterinarian: record.veterinarian ?? '',
    title: record.title,
    diagnosis: record.diagnosis ?? '',
    treatment: record.treatment ?? '',
    medication: record.medication ?? '',
    notes: record.notes ?? '',
    followUpDate: record.followUpDate ? toDateInputValue(record.followUpDate) : '',
    followUpNotes: record.followUpNotes ?? '',
    vaccineName: record.vaccine?.name ?? '',
    vaccineNextDueDate: record.vaccine?.nextDueDate
      ? toDateInputValue(record.vaccine.nextDueDate)
      : '',
  };
}

interface MedicalFormProps {
  /** Present for Edit, where the form is pre-populated; absent for Add. */
  record?: MedicalRecord;
  /** Shown as context so the person always knows whose record they are writing. */
  horseName: string;
  submitLabel: string;
  submittingLabel: string;
  onSubmit: (input: MedicalRecordInput) => Promise<void>;
  onCancelHref: string;
}

export function MedicalForm({
  record,
  horseName,
  submitLabel,
  submittingLabel,
  onSubmit,
  onCancelHref,
}: MedicalFormProps) {
  const defaults = defaultsFrom(record);
  const { errors, validate } = useFormErrors(medicalRecordFormSchema);
  const [recordType, setRecordType] = useState(defaults.recordType);
  const [attachments, setAttachments] = useState<MedicalAttachment[]>(record?.attachments ?? []);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isVaccination = recordType === 'vaccination';

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const data = new FormData(event.currentTarget);
    const read = (name: string) => String(data.get(name) ?? '');

    const values = validate({
      recordType: read('recordType'),
      status: read('status'),
      date: read('date'),
      veterinarian: read('veterinarian'),
      title: read('title'),
      diagnosis: read('diagnosis'),
      treatment: read('treatment'),
      medication: read('medication'),
      notes: read('notes'),
      followUpDate: read('followUpDate'),
      followUpNotes: read('followUpNotes'),
      vaccineName: read('vaccineName'),
      vaccineNextDueDate: read('vaccineNextDueDate'),
    });
    if (!values) return;

    setSubmitting(true);
    try {
      await onSubmit(toMedicalRecordInput(values, attachments, record));
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Could not save this record.');
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {formError ? <Alert tone="error">{formError}</Alert> : null}

      <Card>
        <CardHeader
          title="Basic information"
          description={`This record belongs to ${horseName}.`}
          headingLevel={3}
        />
        <CardBody className="grid gap-4 sm:grid-cols-2">
          <FormField label="Record type" error={errors.recordType} required>
            <Select
              name="recordType"
              value={recordType}
              onChange={(event) =>
                setRecordType(event.target.value as MedicalRecordFormValues['recordType'])
              }
            >
              {recordTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </FormField>

          <FormField label="Status" error={errors.status} required>
            <Select name="status" defaultValue={defaults.status}>
              {recordStatusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </FormField>

          <FormField
            label="Date"
            error={errors.date}
            hint="Use a future date only for a scheduled visit."
            required
          >
            <Input type="date" name="date" defaultValue={defaults.date} />
          </FormField>

          <FormField
            label="Veterinarian"
            error={errors.veterinarian}
            hint="Leave blank if no vet attended."
          >
            <Input
              name="veterinarian"
              defaultValue={defaults.veterinarian}
              placeholder="e.g. Dr. Sara Nabil"
              maxLength={80}
            />
          </FormField>
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="Clinical information"
          description="Only the title is required — leave the rest blank if it does not apply."
          headingLevel={3}
        />
        <CardBody className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <FormField label="Title" error={errors.title} required>
              <Input
                name="title"
                defaultValue={defaults.title}
                placeholder="e.g. Routine health examination"
                maxLength={120}
              />
            </FormField>
          </div>

          {isVaccination ? (
            <>
              <FormField label="Vaccine" error={errors.vaccineName} required>
                <Input
                  name="vaccineName"
                  defaultValue={defaults.vaccineName}
                  placeholder="e.g. Equine influenza"
                  maxLength={80}
                />
              </FormField>

              <FormField
                label="Next dose due"
                error={errors.vaccineNextDueDate}
                hint="Leave blank if no further dose is planned."
              >
                <Input
                  type="date"
                  name="vaccineNextDueDate"
                  defaultValue={defaults.vaccineNextDueDate}
                />
              </FormField>
            </>
          ) : null}

          <FormField label="Diagnosis" error={errors.diagnosis}>
            <Input
              name="diagnosis"
              defaultValue={defaults.diagnosis}
              placeholder="e.g. Mild suspensory strain"
              maxLength={200}
            />
          </FormField>

          <FormField label="Medication" error={errors.medication}>
            <Input
              name="medication"
              defaultValue={defaults.medication}
              placeholder="e.g. Phenylbutazone 2 g twice daily"
              maxLength={200}
            />
          </FormField>

          <div className="sm:col-span-2">
            <FormField label="Treatment" error={errors.treatment}>
              <Textarea
                name="treatment"
                defaultValue={defaults.treatment}
                rows={3}
                maxLength={1000}
                placeholder="What was done, and what happens next."
              />
            </FormField>
          </div>

          <div className="sm:col-span-2">
            <FormField label="Notes" error={errors.notes}>
              <Textarea
                name="notes"
                defaultValue={defaults.notes}
                rows={3}
                maxLength={2000}
                placeholder="Observations, readings, anything the next vet should know."
              />
            </FormField>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="Follow-up"
          description="Set a date and this record appears in upcoming medical events."
          headingLevel={3}
        />
        <CardBody className="grid gap-4 sm:grid-cols-2">
          <FormField label="Follow-up date" error={errors.followUpDate}>
            <Input type="date" name="followUpDate" defaultValue={defaults.followUpDate} />
          </FormField>

          <div className="sm:col-span-2">
            <FormField label="Follow-up notes" error={errors.followUpNotes}>
              <Textarea
                name="followUpNotes"
                defaultValue={defaults.followUpNotes}
                rows={2}
                maxLength={500}
                placeholder="What the follow-up should check."
              />
            </FormField>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Attachments" headingLevel={3} />
        <CardBody>
          <MedicalAttachmentField attachments={attachments} onChange={setAttachments} />
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
