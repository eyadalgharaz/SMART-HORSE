import { calendarDayDifference } from '@/features/dashboard/format';
import { matchesAnyField, toDateInputValue } from '@/features/horses/format';
import { getDictionary } from '@/i18n/dictionaries';
import { formatClockTime, formatDate } from '@/i18n/format';
import type { Locale } from '@/i18n/locale';
import type { Assignee, HorseOption, Task, TaskFilters } from './types';
import type { DueState } from './vocabulary';

/**
 * Display formatting, due-state derivation, filtering and derived figures for
 * task data. Pure functions only, so every rule is testable without
 * rendering anything. Anything that depends on "today" takes a `reference`
 * date, which defaults to now and is fixed in tests.
 */

/* ------------------------------------------------------------------ */
/* Due-date state — derived, never stored                              */
/* ------------------------------------------------------------------ */

/**
 * A task's due-date state, derived from its due date and stored status.
 * A completed or cancelled task is never "overdue": the due-date state only
 * describes work that still needs doing.
 */
export function deriveDueState(
  task: Pick<Task, 'dueAt' | 'status'>,
  reference: Date = new Date(),
): DueState {
  if (task.dueAt === null) return 'no-date';
  if (task.status === 'completed' || task.status === 'cancelled') return 'no-date';

  const offset = calendarDayDifference(new Date(task.dueAt), reference);
  if (offset < 0) return 'overdue';
  if (offset === 0) return 'due-today';
  return 'upcoming';
}

export function isOverdue(
  task: Pick<Task, 'dueAt' | 'status'>,
  reference: Date = new Date(),
): boolean {
  return deriveDueState(task, reference) === 'overdue';
}

/* ------------------------------------------------------------------ */
/* Dates                                                                */
/* ------------------------------------------------------------------ */

/** "18 Sep 2026" ("18 سبتمبر 2026" in Arabic) */
export function formatDueDate(iso: string, locale: Locale = 'en'): string {
  return formatDate(iso, locale);
}

/** "9:30" ("9:30 ص" in Arabic) */
export function formatDueTime(iso: string, locale: Locale = 'en'): string {
  return formatClockTime(iso, locale);
}

/** "Today, 9:30", "Tomorrow, 9:30", "Yesterday, 9:30", or "18 Sep 2026, 9:30". */
export function formatDueLabel(
  iso: string,
  reference: Date = new Date(),
  locale: Locale = 'en',
): string {
  const time = getDictionary(locale).time;
  const offset = calendarDayDifference(new Date(iso), reference);
  const day =
    offset === 0
      ? time.today
      : offset === 1
        ? time.tomorrow
        : offset === -1
          ? time.yesterday
          : formatDueDate(iso, locale);
  return time.dateWithTime(day, formatDueTime(iso, locale));
}

/** "3 days overdue", "Due today", "Due tomorrow", "Due in 4 days". */
export function formatDueRelative(
  iso: string,
  reference: Date = new Date(),
  locale: Locale = 'en',
): string {
  const due = getDictionary(locale).tasks.due;
  const offset = calendarDayDifference(new Date(iso), reference);
  if (offset === 0) return due.dueToday;
  if (offset === 1) return due.dueTomorrow;
  if (offset === -1) return due.oneDayOverdue;
  if (offset < 0) return due.daysOverdue(Math.abs(offset));
  return due.dueInDays(offset);
}

/* ------------------------------------------------------------------ */
/* Sorting and option lists                                            */
/* ------------------------------------------------------------------ */

/**
 * The order the task list reads in: overdue first, then due today, then
 * upcoming by soonest due date, then tasks with no due date, with completed
 * and cancelled tasks last (newest-completed first). Nothing here is stored —
 * it is recomputed from `status` and `dueAt` every time.
 */
export function sortTasksByUrgency(tasks: Task[], reference: Date = new Date()): Task[] {
  const rank: Record<DueState, number> = { overdue: 0, 'due-today': 1, upcoming: 2, 'no-date': 3 };

  return [...tasks].sort((a, b) => {
    const aDone = a.status === 'completed' || a.status === 'cancelled';
    const bDone = b.status === 'completed' || b.status === 'cancelled';
    if (aDone !== bDone) return aDone ? 1 : -1;
    if (aDone && bDone) {
      return (
        new Date(b.completedAt ?? b.createdAt).getTime() -
        new Date(a.completedAt ?? a.createdAt).getTime()
      );
    }

    const aState = deriveDueState(a, reference);
    const bState = deriveDueState(b, reference);
    if (rank[aState] !== rank[bState]) return rank[aState] - rank[bState];
    if (a.dueAt === null || b.dueAt === null) return 0;
    return new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime();
  });
}

/** The horses named in a collection, alphabetical — a filter's option list. */
export function horsesOf(tasks: Task[]): HorseOption[] {
  const byId = new Map<string, string>();
  for (const task of tasks) {
    if (task.horseId && task.horseName) byId.set(task.horseId, task.horseName);
  }
  return [...byId.entries()]
    .map(([id, name]) => ({ id, name }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

/** The assignees named in a collection, alphabetical — a filter's option list. */
export function assigneesOf(tasks: Task[]): Pick<Assignee, 'id' | 'name'>[] {
  const byId = new Map<string, string>();
  for (const task of tasks) {
    if (task.assigneeId && task.assigneeName) byId.set(task.assigneeId, task.assigneeName);
  }
  return [...byId.entries()]
    .map(([id, name]) => ({ id, name }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

/* ------------------------------------------------------------------ */
/* Filtering                                                            */
/* ------------------------------------------------------------------ */

function matchesSearch(task: Task, search: string, localize?: (text: string) => string): boolean {
  return matchesAnyField(
    [task.title, task.horseName, task.assigneeName, task.description, task.notes],
    search,
    localize,
  );
}

/**
 * Applies every active filter — they narrow the list together, never instead
 * of each other. When the API arrives this rule moves into the query string;
 * the hook keeps the same signature, so no component changes.
 */
export function filterTasks(
  tasks: Task[],
  filters: TaskFilters,
  localize?: (text: string) => string,
): Task[] {
  return tasks.filter(
    (task) =>
      matchesSearch(task, filters.search, localize) &&
      (filters.horseId === null || task.horseId === filters.horseId) &&
      (filters.assigneeId === null || task.assigneeId === filters.assigneeId) &&
      (filters.category === null || task.category === filters.category) &&
      (filters.priority === null || task.priority === filters.priority) &&
      (filters.status === null || task.status === filters.status) &&
      (filters.recurring === null || (task.recurrence.frequency !== 'none') === filters.recurring),
  );
}

export function hasActiveTaskFilters(filters: TaskFilters): boolean {
  return Boolean(
    filters.search.trim() ||
    filters.horseId !== null ||
    filters.assigneeId !== null ||
    filters.category !== null ||
    filters.priority !== null ||
    filters.status !== null ||
    filters.recurring !== null,
  );
}

/** Filters behind the mobile "Filters" button — search is always visible, so it is not counted. */
export function activeTaskFilterCount(filters: TaskFilters): number {
  return [
    filters.horseId,
    filters.assigneeId,
    filters.category,
    filters.priority,
    filters.status,
    filters.recurring,
  ].filter((value) => value !== null).length;
}

/** "50 tasks", "1 task", or "Showing 8 of 50 tasks" while filters are on. */
export function formatTaskCount(shown: number, total: number, locale: Locale = 'en'): string {
  return getDictionary(locale).tasks.count(shown, total);
}

/* ------------------------------------------------------------------ */
/* Tabs                                                                 */
/* ------------------------------------------------------------------ */

export type TaskTab = 'all' | 'today' | 'upcoming' | 'overdue' | 'completed';

/** The subset of `tasks` a given tab shows. Applied after search and filters. */
export function tasksForTab(tasks: Task[], tab: TaskTab, reference: Date = new Date()): Task[] {
  switch (tab) {
    case 'all':
      return tasks;
    case 'today':
      return tasks.filter((task) => deriveDueState(task, reference) === 'due-today');
    case 'upcoming':
      return tasks.filter((task) => deriveDueState(task, reference) === 'upcoming');
    case 'overdue':
      return tasks.filter((task) => deriveDueState(task, reference) === 'overdue');
    case 'completed':
      return tasks.filter((task) => task.status === 'completed');
  }
}

/* ------------------------------------------------------------------ */
/* Farm-wide summary                                                    */
/* ------------------------------------------------------------------ */

export interface TaskOverviewSummary {
  dueToday: number;
  overdue: number;
  inProgress: number;
  completed: number;
}

/**
 * The four figures at the top of /tasks, derived from the same collection
 * the tabs below show, so a figure can never disagree with the list under it.
 */
export function summarizeTasks(tasks: Task[], reference: Date = new Date()): TaskOverviewSummary {
  let dueToday = 0;
  let overdue = 0;
  let inProgress = 0;
  let completed = 0;

  for (const task of tasks) {
    const state = deriveDueState(task, reference);
    if (state === 'due-today') dueToday += 1;
    if (state === 'overdue') overdue += 1;
    if (task.status === 'in-progress') inProgress += 1;
    if (task.status === 'completed') completed += 1;
  }

  return { dueToday, overdue, inProgress, completed };
}

/** Re-exported so callers of this module never need to reach into horses/format directly. */
export { toDateInputValue };
