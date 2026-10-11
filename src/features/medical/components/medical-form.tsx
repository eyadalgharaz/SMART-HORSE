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
import { useI18n } from '@/i18n';
import { restoreSource } from '@/i18n/translate';
import { toDateInputValue } from '@/features/horses/format';
import {
  medicalRecordFormSchema,
  toMedicalRecordInput,
  type MedicalRecordFormValues,
} from '../schemas';
import type { MedicalAttachment, MedicalRecord, MedicalRecordInput } from '../types';
import { recordStatusValues, recordTypeValues } from '../vocabulary';
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
  const { t, tc, tm } = useI18n();
  const stored = defaultsFrom(record);
  // Text fields show stored demo content in the active language; see `restoreSource`.
  const textFields = [
    'veterinarian',
    'title',
    'diagnosis',
    'treatment',
    'medication',
    'notes',
    'followUpNotes',
    'vaccineName',
  ] as const;
  const defaults: MedicalRecordFormValues = { ...stored };
  for (const field of textFields) defaults[field] = stored[field] ? tc(stored[field]) : '';
  const { errors, validate } = useFormErrors(medicalRecordFormSchema);
  const [recordType, setRecordType] = useState(defaults.recordType);
  const [attachments, setAttachments] = useState<MedicalAttachment[]>(record?.attachments ?? []);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isVaccination = recordType === 'vaccination';
  const f = t.medical.fields;
  const m = t.medical.form;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const data = new FormData(event.currentTarget);
    const read = (name: string) => {
      const value = String(data.get(name) ?? '');
      return (textFields as readonly string[]).includes(name)
        ? restoreSource(value, stored[name as (typeof textFields)[number]], tc)
        : value;
    };

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
      setFormError(error instanceof Error ? error.message : m.saveError);
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {formError ? <Alert tone="error">{tm(formError)}</Alert> : null}

      <Card>
        <CardHeader title={m.basicInfo} description={m.belongsTo(horseName)} headingLevel={3} />
        <CardBody className="grid gap-4 sm:grid-cols-2">
          <FormField label={f.recordType} error={errors.recordType} required>
            <Select
              name="recordType"
              value={recordType}
              onChange={(event) =>
                setRecordType(event.target.value as MedicalRecordFormValues['recordType'])
              }
            >
              {recordTypeValues.map((value) => (
                <option key={value} value={value}>
                  {t.medical.recordTypes[value]}
                </option>
              ))}
            </Select>
          </FormField>

          <FormField label={f.status} error={errors.status} required>
            <Select name="status" defaultValue={defaults.status}>
              {recordStatusValues.map((value) => (
                <option key={value} value={value}>
                  {t.medical.statuses[value]}
                </option>
              ))}
            </Select>
          </FormField>

          <FormField label={f.date} error={errors.date} hint={m.dateHint} required>
            <Input type="date" name="date" defaultValue={defaults.date} />
          </FormField>

          <FormField label={f.veterinarian} error={errors.veterinarian} hint={m.vetHint}>
            <Input
              name="veterinarian"
              defaultValue={defaults.veterinarian}
              placeholder={m.vetPlaceholder}
              maxLength={80}
            />
          </FormField>
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title={t.medical.detail.clinical}
          description={m.clinicalDescription}
          headingLevel={3}
        />
        <CardBody className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <FormField label={f.title} error={errors.title} required>
              <Input
                name="title"
                defaultValue={defaults.title}
                placeholder={m.titlePlaceholder}
                maxLength={120}
              />
            </FormField>
          </div>

          {isVaccination ? (
            <>
              <FormField label={f.vaccine} error={errors.vaccineName} required>
                <Input
                  name="vaccineName"
                  defaultValue={defaults.vaccineName}
                  placeholder={m.vaccinePlaceholder}
                  maxLength={80}
                />
              </FormField>

              <FormField
                label={f.nextDoseDue}
                error={errors.vaccineNextDueDate}
                hint={m.nextDoseHint}
              >
                <Input
                  type="date"
                  name="vaccineNextDueDate"
                  defaultValue={defaults.vaccineNextDueDate}
                />
              </FormField>
            </>
          ) : null}

          <FormField label={f.diagnosis} error={errors.diagnosis}>
            <Input
              name="diagnosis"
              defaultValue={defaults.diagnosis}
              placeholder={m.diagnosisPlaceholder}
              maxLength={200}
            />
          </FormField>

          <FormField label={f.medication} error={errors.medication}>
            <Input
              name="medication"
              defaultValue={defaults.medication}
              placeholder={m.medicationPlaceholder}
              maxLength={200}
            />
          </FormField>

          <div className="sm:col-span-2">
            <FormField label={f.treatment} error={errors.treatment}>
              <Textarea
                name="treatment"
                defaultValue={defaults.treatment}
                rows={3}
                maxLength={1000}
                placeholder={m.treatmentPlaceholder}
              />
            </FormField>
          </div>

          <div className="sm:col-span-2">
            <FormField label={f.notes} error={errors.notes}>
              <Textarea
                name="notes"
                defaultValue={defaults.notes}
                rows={3}
                maxLength={2000}
                placeholder={m.notesPlaceholder}
              />
            </FormField>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title={t.medical.detail.followUp}
          description={m.followUpDescription}
          headingLevel={3}
        />
        <CardBody className="grid gap-4 sm:grid-cols-2">
          <FormField label={f.followUpDate} error={errors.followUpDate}>
            <Input type="date" name="followUpDate" defaultValue={defaults.followUpDate} />
          </FormField>

          <div className="sm:col-span-2">
            <FormField label={f.followUpNotes} error={errors.followUpNotes}>
              <Textarea
                name="followUpNotes"
                defaultValue={defaults.followUpNotes}
                rows={2}
                maxLength={500}
                placeholder={m.followUpPlaceholder}
              />
            </FormField>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title={t.medical.detail.attachments} headingLevel={3} />
        <CardBody>
          <MedicalAttachmentField attachments={attachments} onChange={setAttachments} />
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
