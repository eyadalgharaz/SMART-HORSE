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
import { defaultsFromTask, taskFormSchema, toTaskInput } from '../schemas';
import type { Assignee, HorseOption, Task, TaskInput } from '../types';
import {
  recurrenceFrequencyOptions,
  taskCategoryOptions,
  taskPriorityOptions,
  taskStatusOptions,
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
  const defaults = defaultsFromTask(task);
  const { errors, validate } = useFormErrors(taskFormSchema);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const data = new FormData(event.currentTarget);
    const read = (name: string) => String(data.get(name) ?? '');

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
      setFormError(error instanceof Error ? error.message : 'Could not save this task.');
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {formError ? <Alert tone="error">{formError}</Alert> : null}

      <Card>
        <CardHeader title="Task details" headingLevel={3} />
        <CardBody className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <FormField label="Title" error={errors.title} required>
              <Input
                name="title"
                defaultValue={defaults.title}
                placeholder="e.g. Morning feed round"
                maxLength={120}
              />
            </FormField>
          </div>

          <div className="sm:col-span-2">
            <FormField label="Description" error={errors.description} hint="Optional.">
              <Textarea
                name="description"
                defaultValue={defaults.description}
                rows={2}
                maxLength={500}
              />
            </FormField>
          </div>

          <FormField label="Category" error={errors.category} required>
            <Select name="category" defaultValue={defaults.category}>
              {taskCategoryOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </FormField>

          <FormField label="Horse" hint="Optional — leave blank for a farm-wide task.">
            <Select name="horseId" defaultValue={defaults.horseId}>
              <option value="">No horse (farm-wide)</option>
              {horses.map((horse) => (
                <option key={horse.id} value={horse.id}>
                  {horse.name}
                </option>
              ))}
            </Select>
          </FormField>
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="Assignment"
          description="Optional — a task can stay unassigned."
          headingLevel={3}
        />
        <CardBody>
          <FormField label="Assignee">
            <Select name="assigneeId" defaultValue={defaults.assigneeId}>
              <option value="">Unassigned</option>
              {assignees.map((assignee) => (
                <option key={assignee.id} value={assignee.id}>
                  {assignee.name}
                  {assignee.role ? ` (${assignee.role})` : ''}
                </option>
              ))}
            </Select>
          </FormField>
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="Schedule"
          description="Leave the due date blank for a task with no fixed deadline."
          headingLevel={3}
        />
        <CardBody className="grid gap-4 sm:grid-cols-3">
          <FormField label="Due date" error={errors.dueDate}>
            <Input type="date" name="dueDate" defaultValue={defaults.dueDate} />
          </FormField>

          <FormField label="Due time" error={errors.dueTime}>
            <Input type="time" name="dueTime" defaultValue={defaults.dueTime} />
          </FormField>

          <FormField label="Repeat" error={errors.recurrenceFrequency}>
            <Select name="recurrenceFrequency" defaultValue={defaults.recurrenceFrequency}>
              {recurrenceFrequencyOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </FormField>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Priority & status" headingLevel={3} />
        <CardBody className="grid gap-4 sm:grid-cols-2">
          <FormField label="Priority" error={errors.priority} required>
            <Select name="priority" defaultValue={defaults.priority}>
              {taskPriorityOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </FormField>

          <FormField label="Status" error={errors.status} required>
            <Select name="status" defaultValue={defaults.status}>
              {taskStatusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </FormField>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Notes" headingLevel={3} />
        <CardBody>
          <FormField label="Notes" error={errors.notes}>
            <Textarea name="notes" defaultValue={defaults.notes} rows={3} maxLength={1000} />
          </FormField>
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
