import { toDateInputValue } from '@/features/horses/format';
import { z } from 'zod';
import type { Task, TaskInput } from './types';
import {
  MAX_DESCRIPTION_LENGTH,
  MAX_NOTES_LENGTH,
  MAX_TITLE_LENGTH,
  recurrenceFrequencyValues,
  taskCategoryValues,
  taskPriorityValues,
  taskStatusValues,
} from './vocabulary';

/**
 * Client-side validation only — it exists to give fast, clear feedback. The
 * backend will re-validate everything.
 *
 * The schema describes the raw form values, which are all strings;
 * `toTaskInput` turns a validated set into the task the service stores. A
 * task's due date is optional — a task can exist with no fixed due date — but
 * a recurring task always needs one, since "repeat" has no meaning without a
 * starting point.
 */

const isValidDay = (value: string) => !Number.isNaN(new Date(value).getTime());

const optionalText = (max: number) => z.string().trim().max(max, `Use ${max} characters or fewer.`);

export const taskFormSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(3, 'Enter a short title (at least 3 characters).')
      .max(MAX_TITLE_LENGTH, `Use ${MAX_TITLE_LENGTH} characters or fewer.`),
    description: optionalText(MAX_DESCRIPTION_LENGTH),
    category: z.enum(taskCategoryValues, { error: 'Choose a category.' }),
    horseId: z.string(),
    assigneeId: z.string(),
    dueDate: z.string().refine((value) => value === '' || isValidDay(value), 'Enter a valid date.'),
    dueTime: z.string(),
    priority: z.enum(taskPriorityValues, { error: 'Choose a priority.' }),
    status: z.enum(taskStatusValues, { error: 'Choose a status.' }),
    recurrenceFrequency: z.enum(recurrenceFrequencyValues, {
      error: 'Choose how often this repeats.',
    }),
    notes: optionalText(MAX_NOTES_LENGTH),
  })
  .superRefine((values, ctx) => {
    const fail = (path: string, message: string) =>
      ctx.addIssue({ code: 'custom', path: [path], message });

    if (values.recurrenceFrequency !== 'none' && values.dueDate === '') {
      fail('dueDate', 'A repeating task needs a starting due date.');
    }
    if (values.dueDate !== '' && values.dueTime === '') {
      fail('dueTime', 'Enter a due time, or clear the due date.');
    }
  });

export type TaskFormValues = z.infer<typeof taskFormSchema>;

/** "2026-09-18" + "09:30" → the start of that local minute, as an ISO instant. */
export function combineDateAndTime(dateValue: string, timeValue: string): string {
  const [year, month, day] = dateValue.split('-').map(Number);
  const [hour, minute] = timeValue.split(':').map(Number);
  return new Date(year ?? 0, (month ?? 1) - 1, day ?? 1, hour ?? 0, minute ?? 0).toISOString();
}

/** Validated form values → the task the service stores. */
export function toTaskInput(values: TaskFormValues): TaskInput {
  return {
    title: values.title,
    description: values.description || null,
    category: values.category,
    horseId: values.horseId || null,
    assigneeId: values.assigneeId || null,
    dueAt: values.dueDate ? combineDateAndTime(values.dueDate, values.dueTime || '09:00') : null,
    priority: values.priority,
    status: values.status,
    recurrence: { frequency: values.recurrenceFrequency },
    notes: values.notes || null,
  };
}

/** An existing task → the form's starting values. */
export function defaultsFromTask(task: Task | undefined): TaskFormValues {
  if (!task) {
    return {
      title: '',
      description: '',
      category: 'care',
      horseId: '',
      assigneeId: '',
      dueDate: '',
      dueTime: '09:00',
      priority: 'medium',
      status: 'pending',
      recurrenceFrequency: 'none',
      notes: '',
    };
  }

  const date = task.dueAt ? new Date(task.dueAt) : null;
  const dueTime = date
    ? `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
    : '09:00';

  return {
    title: task.title,
    description: task.description ?? '',
    category: task.category,
    horseId: task.horseId ?? '',
    assigneeId: task.assigneeId ?? '',
    dueDate: task.dueAt ? toDateInputValue(task.dueAt) : '',
    dueTime,
    priority: task.priority,
    status: task.status,
    recurrenceFrequency: task.recurrence.frequency,
    notes: task.notes ?? '',
  };
}
