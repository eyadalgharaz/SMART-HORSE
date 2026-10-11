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
import { sortByLabel, useI18n } from '@/i18n';
import { restoreSource } from '@/i18n/translate';
import { toDateInputValue } from '@/features/horses/format';
import {
  trainingSessionFormSchema,
  toTrainingSessionInput,
  type TrainingSessionFormValues,
} from '../schemas';
import type { Trainer, TrainingProgram, TrainingSession, TrainingSessionInput } from '../types';
import { sessionStatusValues, trainingTypeValues } from '../vocabulary';

/**
 * Add and Edit are the same form: same fields, same validation, same layout.
 * The only differences are the starting values and what happens on submit,
 * both passed in by the page.
 *
 * Grouped into the sections a training session actually has — Session
 * information, Performance, Notes — matching the shape the create/edit spec
 * describes. Everything is uncontrolled and read from the form on submit,
 * the same approach the Horses and Medical forms use.
 */

function defaultsFrom(session: TrainingSession | undefined): TrainingSessionFormValues {
  if (!session) {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    return {
      programId: '',
      trainingType: 'flatwork',
      title: '',
      date: toDateInputValue(now.toISOString()),
      startTime: `${hh}:${mm}`,
      durationMinutes: '45',
      trainerId: '',
      status: 'scheduled',
      distanceKm: '',
      avgSpeedKmh: '',
      maxSpeedKmh: '',
      result: '',
      trainerNotes: '',
      notes: '',
    };
  }

  const date = new Date(session.date);
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');

  return {
    programId: session.programId ?? '',
    trainingType: session.trainingType,
    title: session.title,
    date: toDateInputValue(session.date),
    startTime: `${hh}:${mm}`,
    durationMinutes: String(session.durationMinutes),
    trainerId: session.trainerId,
    status: session.status,
    distanceKm: session.distanceKm === null ? '' : String(session.distanceKm),
    avgSpeedKmh: session.avgSpeedKmh === null ? '' : String(session.avgSpeedKmh),
    maxSpeedKmh: session.maxSpeedKmh === null ? '' : String(session.maxSpeedKmh),
    result: session.result ?? '',
    trainerNotes: session.trainerNotes ?? '',
    notes: session.notes ?? '',
  };
}

interface TrainingSessionFormProps {
  /** Present for Edit, where the form is pre-populated; absent for Add. */
  session?: TrainingSession;
  horseId: string;
  /** Shown as context so the person always knows whose session they are writing. */
  horseName: string;
  /** Programs belonging to this horse, for the program select. */
  programs: TrainingProgram[];
  trainers: Trainer[];
  submitLabel: string;
  submittingLabel: string;
  onSubmit: (input: TrainingSessionInput) => Promise<void>;
  onCancelHref: string;
}

export function TrainingSessionForm({
  session,
  horseId,
  horseName,
  programs,
  trainers,
  submitLabel,
  submittingLabel,
  onSubmit,
  onCancelHref,
}: TrainingSessionFormProps) {
  const { t, tc, tm, locale } = useI18n();
  const f = t.training.form;
  const stored = defaultsFrom(session);
  // Free-text fields show stored demo content in the active language; an
  // unchanged field saves its stored value (see `restoreSource`).
  const textFields = ['title', 'result', 'trainerNotes', 'notes'] as const;
  const defaults: TrainingSessionFormValues = { ...stored };
  for (const field of textFields) defaults[field] = stored[field] ? tc(stored[field]) : '';
  const { errors, validate } = useFormErrors(trainingSessionFormSchema);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

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
      programId: read('programId'),
      trainingType: read('trainingType'),
      title: read('title'),
      date: read('date'),
      startTime: read('startTime'),
      durationMinutes: read('durationMinutes'),
      trainerId: read('trainerId'),
      status: read('status'),
      distanceKm: read('distanceKm'),
      avgSpeedKmh: read('avgSpeedKmh'),
      maxSpeedKmh: read('maxSpeedKmh'),
      result: read('result'),
      trainerNotes: read('trainerNotes'),
      notes: read('notes'),
    });
    if (!values) return;

    setSubmitting(true);
    try {
      await onSubmit(toTrainingSessionInput(values, horseId, trainers, session));
    } catch (error) {
      setFormError(error instanceof Error ? error.message : f.saveError);
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {formError ? <Alert tone="error">{tm(formError)}</Alert> : null}

      <Card>
        <CardHeader title={f.sessionInfo} description={f.belongsTo(horseName)} headingLevel={3} />
        <CardBody className="grid gap-4 sm:grid-cols-2">
          <FormField label={f.program} hint={f.programHint}>
            <Select name="programId" defaultValue={defaults.programId}>
              <option value="">{f.noProgram}</option>
              {programs.map((program) => (
                <option key={program.id} value={program.id}>
                  {tc(program.name)}
                </option>
              ))}
            </Select>
          </FormField>

          <FormField label={f.type} error={errors.trainingType} required>
            <Select name="trainingType" defaultValue={defaults.trainingType}>
              {trainingTypeValues.map((value) => (
                <option key={value} value={value}>
                  {t.training.types[value]}
                </option>
              ))}
            </Select>
          </FormField>

          <div className="sm:col-span-2">
            <FormField label={f.title} error={errors.title} required>
              <Input
                name="title"
                defaultValue={defaults.title}
                placeholder={f.titlePlaceholder}
                maxLength={120}
              />
            </FormField>
          </div>

          <FormField label={f.date} error={errors.date} required>
            <Input type="date" name="date" defaultValue={defaults.date} />
          </FormField>

          <FormField label={f.startTime} error={errors.startTime} required>
            <Input type="time" name="startTime" defaultValue={defaults.startTime} />
          </FormField>

          <FormField label={f.duration} error={errors.durationMinutes} required>
            <Input
              type="number"
              inputMode="numeric"
              min={5}
              max={480}
              name="durationMinutes"
              defaultValue={defaults.durationMinutes}
            />
          </FormField>

          <FormField label={f.trainer} error={errors.trainerId} required>
            <Select name="trainerId" defaultValue={defaults.trainerId}>
              <option value="" disabled>
                {f.chooseTrainer}
              </option>
              {sortByLabel(trainers, (trainer) => tc(trainer.name), locale).map((trainer) => (
                <option key={trainer.id} value={trainer.id}>
                  {tc(trainer.name)}
                </option>
              ))}
            </Select>
          </FormField>

          <FormField label={f.status} error={errors.status} required>
            <Select name="status" defaultValue={defaults.status}>
              {sessionStatusValues.map((value) => (
                <option key={value} value={value}>
                  {t.training.sessionStatuses[value]}
                </option>
              ))}
            </Select>
          </FormField>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title={f.performance} description={f.performanceDescription} headingLevel={3} />
        <CardBody className="grid gap-4 sm:grid-cols-3">
          <FormField label={f.distance} error={errors.distanceKm}>
            <Input
              type="number"
              inputMode="decimal"
              step="0.1"
              min={0}
              name="distanceKm"
              defaultValue={defaults.distanceKm}
              placeholder={f.distancePlaceholder}
            />
          </FormField>

          <FormField label={f.avgSpeed} error={errors.avgSpeedKmh}>
            <Input
              type="number"
              inputMode="decimal"
              step="0.1"
              min={0}
              name="avgSpeedKmh"
              defaultValue={defaults.avgSpeedKmh}
              placeholder={f.avgSpeedPlaceholder}
            />
          </FormField>

          <FormField label={f.maxSpeed} error={errors.maxSpeedKmh}>
            <Input
              type="number"
              inputMode="decimal"
              step="0.1"
              min={0}
              name="maxSpeedKmh"
              defaultValue={defaults.maxSpeedKmh}
              placeholder={f.maxSpeedPlaceholder}
            />
          </FormField>

          <div className="sm:col-span-3">
            <FormField label={f.result} error={errors.result} hint={f.resultHint}>
              <Textarea
                name="result"
                defaultValue={defaults.result}
                rows={2}
                maxLength={300}
                placeholder={f.resultPlaceholder}
              />
            </FormField>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title={f.notes} headingLevel={3} />
        <CardBody className="grid gap-4 sm:grid-cols-2">
          <FormField label={f.trainerNotes} error={errors.trainerNotes}>
            <Textarea
              name="trainerNotes"
              defaultValue={defaults.trainerNotes}
              rows={3}
              maxLength={1000}
              placeholder={f.trainerNotesPlaceholder}
            />
          </FormField>

          <FormField label={f.additionalNotes} error={errors.notes}>
            <Textarea
              name="notes"
              defaultValue={defaults.notes}
              rows={3}
              maxLength={1000}
              placeholder={f.additionalNotesPlaceholder}
            />
          </FormField>
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
