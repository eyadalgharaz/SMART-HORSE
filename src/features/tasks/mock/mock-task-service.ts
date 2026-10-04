import {
  TaskError,
  TaskNotFoundError,
  type Task,
  type TaskInput,
  type TaskService,
} from '../types';
import { sortTasksByUrgency } from '../format';
import { pushNotification } from '@/features/notifications/mock/mock-notification-service';
import { buildHorseMocks } from '@/features/horses/mock/horse-mock-data';
import { buildAssigneeMocks, buildTaskMocks } from './task-mock-data';

/**
 * Temporary, in-browser stand-in for `/api/v1/tasks` so the Tasks module can
 * be built and reviewed before the backend exists.
 *
 * Like the other mocks it is deliberately thin: an in-memory array, no fake
 * endpoints, no fake database. Adds, edits and status changes mutate that
 * array so the overview list, the summary figures and the task's own detail
 * page visibly update during review; everything resets on reload.
 *
 * Assigning a task and completing a task also call straight into the mock
 * Notification service (`pushNotification`) so a notification appears the
 * same way a backend event would raise one — see that function's own comment
 * for why this is a direct call rather than a real event bus.
 *
 * Review switches (mock only — append to /tasks):
 *   ?mock=error   the request fails         → error state
 *   ?mock=empty   a farm with no tasks yet  → empty state
 *   ?mock=slow    the request takes ~4 s    → loading skeleton
 */

const LATENCY_MS = 450;
const SLOW_LATENCY_MS = 4000;
const WRITE_LATENCY_MS = 500;

type Scenario = 'default' | 'error' | 'empty' | 'slow';

let store: Task[] | null = null;
let scenarioAtLoad: Scenario | null = null;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function currentScenario(): Scenario {
  if (typeof window === 'undefined') return 'default';
  const value = new URLSearchParams(window.location.search).get('mock');
  return value === 'error' || value === 'empty' || value === 'slow' ? value : 'default';
}

function data(): Task[] {
  const scenario = currentScenario();
  const seed = scenario === 'slow' || scenario === 'error' ? 'default' : scenario;
  if (store === null || scenarioAtLoad !== seed) {
    store = seed === 'empty' ? [] : buildTaskMocks();
    scenarioAtLoad = seed;
  }
  return store;
}

/** Test helper: forget anything added or edited during a spec. */
export function resetMockTasks(): void {
  store = null;
  scenarioAtLoad = null;
}

async function guard(latency: number): Promise<void> {
  const scenario = currentScenario();
  await delay(scenario === 'slow' ? SLOW_LATENCY_MS : latency);
  if (scenario === 'error') throw new TaskError('The tasks could not be loaded.');
}

function clone(task: Task): Task {
  return { ...task, recurrence: { ...task.recurrence } };
}

function nextId(tasks: Task[]): string {
  const highest = tasks.reduce((max, task) => {
    const match = /^tk-(\d+)$/.exec(task.id);
    return match ? Math.max(max, Number(match[1])) : max;
  }, 0);
  return `tk-${String(highest + 1).padStart(3, '0')}`;
}

function horseNameFor(horseId: string | null): string | null {
  if (horseId === null) return null;
  // Horse identity belongs to Horse Management; a task only ever carries the
  // id it was given, so the name is looked up from the shared horse roster
  // the same way Training does, rather than inventing one.
  return buildHorseMocks().find((horse) => horse.id === horseId)?.name ?? horseId;
}

function assigneeNameFor(assigneeId: string | null): string | null {
  if (assigneeId === null) return null;
  return buildAssigneeMocks().find((assignee) => assignee.id === assigneeId)?.name ?? assigneeId;
}

function applyInput(input: TaskInput, base: Pick<Task, 'id' | 'createdAt' | 'completedAt'>): Task {
  const completedAt =
    input.status === 'completed' ? (base.completedAt ?? new Date().toISOString()) : null;

  return {
    ...base,
    title: input.title.trim(),
    description: input.description,
    category: input.category,
    horseId: input.horseId,
    horseName: horseNameFor(input.horseId),
    assigneeId: input.assigneeId,
    assigneeName: assigneeNameFor(input.assigneeId),
    dueAt: input.dueAt,
    priority: input.priority,
    status: input.status,
    recurrence: { ...input.recurrence },
    notes: input.notes,
    completedAt,
  };
}

function notifyAssigned(task: Task): void {
  if (!task.assigneeId) return;
  pushNotification({
    type: 'task-assigned',
    title: 'Task assigned to you',
    message: `${task.title} was assigned to ${task.assigneeName ?? 'a team member'}.`,
    relatedEntityType: 'task',
    relatedEntityId: task.id,
  });
}

function notifyCompleted(task: Task): void {
  pushNotification({
    type: 'task-completed',
    title: 'Task completed',
    message: `${task.title} was marked complete.`,
    relatedEntityType: 'task',
    relatedEntityId: task.id,
  });
}

export const mockTaskService: TaskService = {
  async listTasks() {
    await guard(LATENCY_MS);
    return sortTasksByUrgency(data()).map(clone);
  },

  async getTask(id) {
    await guard(LATENCY_MS);
    const task = data().find((candidate) => candidate.id === id);
    if (!task) throw new TaskNotFoundError(id);
    return clone(task);
  },

  async listAssignees() {
    await guard(LATENCY_MS);
    return buildAssigneeMocks();
  },

  async createTask(input) {
    await guard(WRITE_LATENCY_MS);
    const current = data();
    const created = applyInput(input, {
      id: nextId(current),
      createdAt: new Date().toISOString(),
      completedAt: null,
    });
    current.unshift(created);
    notifyAssigned(created);
    return clone(created);
  },

  async updateTask(id, input) {
    await guard(WRITE_LATENCY_MS);
    const current = data();
    const index = current.findIndex((candidate) => candidate.id === id);
    const previous = current[index];
    if (index === -1 || !previous) throw new TaskNotFoundError(id);

    const wasAssignedTo = previous.assigneeId;
    const wasCompleted = previous.status === 'completed';

    const updated = applyInput(input, {
      id: previous.id,
      createdAt: previous.createdAt,
      completedAt: previous.completedAt,
    });
    current[index] = updated;

    if (updated.assigneeId && updated.assigneeId !== wasAssignedTo) notifyAssigned(updated);
    if (updated.status === 'completed' && !wasCompleted) notifyCompleted(updated);

    return clone(updated);
  },

  async setTaskStatus(id, status) {
    await guard(WRITE_LATENCY_MS);
    const current = data();
    const index = current.findIndex((candidate) => candidate.id === id);
    const previous = current[index];
    if (index === -1 || !previous) throw new TaskNotFoundError(id);

    const wasCompleted = previous.status === 'completed';
    const updated: Task = {
      ...previous,
      status,
      completedAt:
        status === 'completed' ? (previous.completedAt ?? new Date().toISOString()) : null,
    };
    current[index] = updated;

    if (status === 'completed' && !wasCompleted) notifyCompleted(updated);

    return clone(updated);
  },
};
