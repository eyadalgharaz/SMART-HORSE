import type { RecurrenceFrequency, TaskCategory, TaskPriority, TaskStatus } from './vocabulary';

export type { RecurrenceFrequency, TaskCategory, TaskPriority, TaskStatus };

/**
 * Task read and write models.
 *
 * These describe what the UI needs, in a shape a future `GET /api/v1/tasks`
 * response can satisfy. Dates are ISO 8601 strings and the UI does all display
 * formatting. Optional information is `null` rather than absent, so "not set"
 * is an explicit answer instead of a missing key.
 *
 * A task's due-date state (overdue / due today / upcoming) is never stored —
 * see `format.ts` — so it can never disagree with the due date beside it.
 */

/**
 * A team member, as Tasks currently knows them: a lightweight reference, not
 * a real membership record. A future backend can replace this with a real
 * Farm membership reference without changing how the UI reads a name.
 */
export interface Assignee {
  id: string;
  name: string;
  role: string | null;
}

export interface Recurrence {
  frequency: RecurrenceFrequency;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  category: TaskCategory;
  horseId: string | null;
  /** Denormalised so lists can show the horse without a second request. */
  horseName: string | null;
  assigneeId: string | null;
  /** Denormalised so lists can show the assignee without a second request. */
  assigneeName: string | null;
  /** ISO 8601 date-time the task is due. Null for a task with no fixed due date. */
  dueAt: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  recurrence: Recurrence;
  notes: string | null;
  createdAt: string;
  completedAt: string | null;
}

/** Everything a person can set on the Add and Edit forms. */
export interface TaskInput {
  title: string;
  description: string | null;
  category: TaskCategory;
  horseId: string | null;
  assigneeId: string | null;
  dueAt: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  recurrence: Recurrence;
  notes: string | null;
}

/** What the task list filters on. Empty string and null both mean "any". */
export interface TaskFilters {
  search: string;
  horseId: string | null;
  assigneeId: string | null;
  category: TaskCategory | null;
  priority: TaskPriority | null;
  status: TaskStatus | null;
  /** true = only recurring tasks, false = only one-time, null = either. */
  recurring: boolean | null;
}

export const emptyTaskFilters: TaskFilters = {
  search: '',
  horseId: null,
  assigneeId: null,
  category: null,
  priority: null,
  status: null,
  recurring: null,
};

/** A horse as the filters see it: only what the option list needs. */
export interface HorseOption {
  id: string;
  name: string;
}

/**
 * The only contract the Tasks UI depends on. Phase F ships a mock
 * implementation; a later phase swaps in an HTTP client against /api/v1
 * without touching any component.
 */
export interface TaskService {
  listTasks(): Promise<Task[]>;
  getTask(id: string): Promise<Task>;
  listAssignees(): Promise<Assignee[]>;
  createTask(input: TaskInput): Promise<Task>;
  updateTask(id: string, input: TaskInput): Promise<Task>;
  /** Convenience for the one-tap "Mark complete" / "Start" actions. */
  setTaskStatus(id: string, status: TaskStatus): Promise<Task>;
}

/** Failure the UI renders as an error state with "Try again". */
export class TaskError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TaskError';
  }
}

/** A task id that does not exist. Rendered as the not-found state, not an error. */
export class TaskNotFoundError extends TaskError {
  constructor(id: string) {
    super(`No task with id "${id}".`);
    this.name = 'TaskNotFoundError';
  }
}

export function isTaskNotFound(error: unknown): boolean {
  return error instanceof TaskNotFoundError;
}
