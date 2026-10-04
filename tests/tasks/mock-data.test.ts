import { describe, expect, it } from 'vitest';
import { buildHorseMocks } from '@/features/horses/mock/horse-mock-data';
import { buildAssigneeMocks, buildTaskMocks } from '@/features/tasks/mock/task-mock-data';
import {
  recurrenceFrequencyValues,
  taskCategoryValues,
  taskPriorityValues,
  taskStatusValues,
} from '@/features/tasks/vocabulary';

describe('buildTaskMocks', () => {
  const tasks = buildTaskMocks();
  const horseIds = new Set(buildHorseMocks().map((horse) => horse.id));

  it('produces a dataset large enough to review filters, tabs and the summary', () => {
    expect(tasks.length).toBeGreaterThanOrEqual(50);
    expect(new Set(tasks.map((task) => task.id)).size).toBe(tasks.length);
  });

  it('only references horses that Horse Management actually has', () => {
    for (const task of tasks) {
      if (task.horseId !== null) expect(horseIds.has(task.horseId)).toBe(true);
    }
  });

  it('agrees with Horse Management about every horse name', () => {
    const names = new Map(buildHorseMocks().map((horse) => [horse.id, horse.name]));
    for (const task of tasks) {
      if (task.horseId !== null) expect(task.horseName).toBe(names.get(task.horseId));
    }
  });

  it('covers every category, priority, status and recurrence option', () => {
    expect(new Set(tasks.map((task) => task.category))).toEqual(new Set(taskCategoryValues));
    expect(new Set(tasks.map((task) => task.priority))).toEqual(new Set(taskPriorityValues));
    expect(new Set(tasks.map((task) => task.status))).toEqual(new Set(taskStatusValues));
    expect(new Set(tasks.map((task) => task.recurrence.frequency))).toEqual(
      new Set(recurrenceFrequencyValues),
    );
  });

  it('includes tasks with no horse, no assignee and no due date', () => {
    expect(tasks.some((task) => task.horseId === null)).toBe(true);
    expect(tasks.some((task) => task.assigneeId === null)).toBe(true);
    expect(tasks.some((task) => task.dueAt === null)).toBe(true);
  });

  it('includes overdue and due-today candidates (past/today due dates on open tasks)', () => {
    const now = Date.now();
    const open = tasks.filter((task) => task.status === 'pending' || task.status === 'in-progress');
    expect(open.some((task) => task.dueAt !== null && new Date(task.dueAt).getTime() < now)).toBe(
      true,
    );
  });

  it('gives every completed task a completedAt and every other task none', () => {
    for (const task of tasks) {
      if (task.status === 'completed') expect(task.completedAt).not.toBeNull();
      else expect(task.completedAt).toBeNull();
    }
  });
});

describe('buildAssigneeMocks', () => {
  it('returns a stable set of named team members', () => {
    const assignees = buildAssigneeMocks();
    expect(assignees.length).toBeGreaterThanOrEqual(3);
    expect(new Set(assignees.map((assignee) => assignee.id)).size).toBe(assignees.length);
    for (const assignee of assignees) expect(assignee.name.trim()).not.toBe('');
  });
});
