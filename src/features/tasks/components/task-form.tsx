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
import { defaultsFromTask, taskFormSchema, toTaskInput } from '../schemas';
import type { Assignee, HorseOption, Task, TaskInput } from '../types';
import {
  recurrenceFrequencyValues,
  taskCategoryValues,
  taskPriorityValues,
  taskStatusValues,
} from '../vocabulary';

/**
 * Add and Edit are the same form: same fields, same validation, same layout.
 * The only differences are the starting values and what happens on submit,
 * both passed in by the page.
 *
 * Sectioned the way the spec describes a task: Task details, Assignment,
 * Schedule, Priority & status, Notes. Everything is uncontrolled and read
 * from the form on submit, the same approach the Horses/Medical/Training
 * forms use.
 */

interface TaskFormProps {
  /** Present for Edit, where the form is pre-populated; absent for Add. */
  task?: Task;
  horses: HorseOption[];
  assignees: Assignee[];
  submitLabel: string;
  submittingLabel: string;
  onSubmit: (input: TaskInput) => Promise<void>;
  onCancelHref: string;
}

export function TaskForm({
  task,
  horses,
  assignees,
  submitLabel,
  submittingLabel,
  onSubmit,
  onCancelHref,
}: TaskFormProps) {
  const { t, tc, tm, locale } = useI18n();
  const f = t.tasks.form;
  const stored = defaultsFromTask(task);
  // Free-text fields show stored demo content in the active language; an
  // unchanged field saves its stored value (see `restoreSource`).
  const textFields = ['title', 'description', 'notes'] as const;
  const defaults = { ...stored };
  for (const field of textFields) defaults[field] = stored[field] ? tc(stored[field]) : '';
  const { errors, validate } = useFormErrors(taskFormSchema);
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
      title: read('title'),
      description: read('description'),
      category: read('category'),
      horseId: read('horseId'),
      assigneeId: read('assigneeId'),
      dueDate: read('dueDate'),
      dueTime: read('dueTime'),
      priority: read('priority'),
      status: read('status'),
      recurrenceFrequency: read('recurrenceFrequency'),
      notes: read('notes'),
    });
    if (!values) return;

    setSubmitting(true);
    try {
      await onSubmit(toTaskInput(values));
    } catch (error) {
      setFormError(error instanceof Error ? error.message : f.saveError);
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {formError ? <Alert tone="error">{tm(formError)}</Alert> : null}

      <Card>
        <CardHeader title={f.details} headingLevel={3} />
        <CardBody className="grid gap-4 sm:grid-cols-2">
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

          <div className="sm:col-span-2">
            <FormField label={f.description} error={errors.description} hint={t.common.optional}>
              <Textarea
                name="description"
                defaultValue={defaults.description}
                rows={2}
                maxLength={500}
              />
            </FormField>
          </div>

          <FormField label={f.category} error={errors.category} required>
            <Select name="category" defaultValue={defaults.category}>
              {taskCategoryValues.map((value) => (
                <option key={value} value={value}>
                  {t.tasks.categories[value]}
                </option>
              ))}
            </Select>
          </FormField>

          <FormField label={f.horse} hint={f.horseHint}>
            <Select name="horseId" defaultValue={defaults.horseId}>
              <option value="">{f.noHorse}</option>
              {sortByLabel(horses, (horse) => tc(horse.name), locale).map((horse) => (
                <option key={horse.id} value={horse.id}>
                  {tc(horse.name)}
                </option>
              ))}
            </Select>
          </FormField>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title={f.assignment} description={f.assignmentDescription} headingLevel={3} />
        <CardBody>
          <FormField label={f.assignee}>
            <Select name="assigneeId" defaultValue={defaults.assigneeId}>
              <option value="">{t.common.unassigned}</option>
              {sortByLabel(assignees, (assignee) => tc(assignee.name), locale).map((assignee) => (
                <option key={assignee.id} value={assignee.id}>
                  {tc(assignee.name)}
                  {assignee.role ? ` (${tc(assignee.role)})` : ''}
                </option>
              ))}
            </Select>
          </FormField>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title={f.schedule} description={f.scheduleDescription} headingLevel={3} />
        <CardBody className="grid gap-4 sm:grid-cols-3">
          <FormField label={f.dueDate} error={errors.dueDate}>
            <Input type="date" name="dueDate" defaultValue={defaults.dueDate} />
          </FormField>

          <FormField label={f.dueTime} error={errors.dueTime}>
            <Input type="time" name="dueTime" defaultValue={defaults.dueTime} />
          </FormField>

          <FormField label={f.repeat} error={errors.recurrenceFrequency}>
            <Select name="recurrenceFrequency" defaultValue={defaults.recurrenceFrequency}>
              {recurrenceFrequencyValues.map((value) => (
                <option key={value} value={value}>
                  {t.tasks.recurrence[value]}
                </option>
              ))}
            </Select>
          </FormField>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title={f.priorityStatus} headingLevel={3} />
        <CardBody className="grid gap-4 sm:grid-cols-2">
          <FormField label={f.priority} error={errors.priority} required>
            <Select name="priority" defaultValue={defaults.priority}>
              {taskPriorityValues.map((value) => (
                <option key={value} value={value}>
                  {t.tasks.priorities[value]}
                </option>
              ))}
            </Select>
          </FormField>

          <FormField label={f.status} error={errors.status} required>
            <Select name="status" defaultValue={defaults.status}>
              {taskStatusValues.map((value) => (
                <option key={value} value={value}>
                  {t.tasks.statuses[value]}
                </option>
              ))}
            </Select>
          </FormField>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title={f.notes} headingLevel={3} />
        <CardBody>
          <FormField label={f.notes} error={errors.notes}>
            <Textarea name="notes" defaultValue={defaults.notes} rows={3} maxLength={1000} />
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
