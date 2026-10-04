import { describe, expect, it } from 'vitest';
import {
  activeTaskFilterCount,
  deriveDueState,
  filterTasks,
  formatDueRelative,
  formatTaskCount,
  hasActiveTaskFilters,
  isOverdue,
  sortTasksByUrgency,
  summarizeTasks,
  tasksForTab,
} from '@/features/tasks/format';
import { emptyTaskFilters, type Task } from '@/features/tasks/types';

const NOW = new Date(2026, 8, 20); // 20 Sep 2026

function day(offset: number, hour = 9): string {
  return new Date(2026, 8, 20 + offset, hour).toISOString();
}

function task(overrides: Partial<Task> = {}): Task {
  return {
    id: 'tk-x',
    title: 'Sample task',
    description: null,
    category: 'care',
    horseId: 'luna',
    horseName: 'Luna',
    assigneeId: 'assignee-yara',
    assigneeName: 'Yara Mostafa',
    dueAt: day(0),
    priority: 'medium',
    status: 'pending',
    recurrence: { frequency: 'none' },
    notes: null,
    createdAt: day(-5),
    completedAt: null,
    ...overrides,
  };
}

describe('deriveDueState', () => {
  it('derives overdue, due-today and upcoming from the due date', () => {
    expect(deriveDueState(task({ dueAt: day(-1) }), NOW)).toBe('overdue');
    expect(deriveDueState(task({ dueAt: day(0) }), NOW)).toBe('due-today');
    expect(deriveDueState(task({ dueAt: day(3) }), NOW)).toBe('upcoming');
  });

  it('treats a task with no due date as no-date', () => {
    expect(deriveDueState(task({ dueAt: null }), NOW)).toBe('no-date');
  });

  it('never reports overdue or due-today for a completed or cancelled task', () => {
    expect(deriveDueState(task({ dueAt: day(-5), status: 'completed' }), NOW)).toBe('no-date');
    expect(deriveDueState(task({ dueAt: day(-5), status: 'cancelled' }), NOW)).toBe('no-date');
  });

  it('isOverdue matches the derived state', () => {
    expect(isOverdue(task({ dueAt: day(-2) }), NOW)).toBe(true);
    expect(isOverdue(task({ dueAt: day(2) }), NOW)).toBe(false);
    expect(isOverdue(task({ dueAt: day(-2), status: 'completed' }), NOW)).toBe(false);
  });
});

describe('formatDueRelative', () => {
  it('describes today, tomorrow, and overdue by day count', () => {
    expect(formatDueRelative(day(0), NOW)).toBe('Due today');
    expect(formatDueRelative(day(1), NOW)).toBe('Due tomorrow');
    expect(formatDueRelative(day(-1), NOW)).toBe('1 day overdue');
    expect(formatDueRelative(day(-4), NOW)).toBe('4 days overdue');
    expect(formatDueRelative(day(5), NOW)).toBe('Due in 5 days');
  });
});

describe('sortTasksByUrgency', () => {
  it('orders overdue, then due today, then upcoming, then no-date, with done tasks last', () => {
    const tasks = [
      task({ id: 'no-date', dueAt: null }),
      task({ id: 'upcoming', dueAt: day(4) }),
      task({ id: 'done', dueAt: day(-10), status: 'completed', completedAt: day(-9) }),
      task({ id: 'overdue', dueAt: day(-2) }),
      task({ id: 'today', dueAt: day(0) }),
    ];
    expect(sortTasksByUrgency(tasks, NOW).map((t) => t.id)).toEqual([
      'overdue',
      'today',
      'upcoming',
      'no-date',
      'done',
    ]);
  });

  it('sorts same-urgency tasks by soonest due date', () => {
    const tasks = [task({ id: 'later', dueAt: day(5) }), task({ id: 'sooner', dueAt: day(2) })];
    expect(sortTasksByUrgency(tasks, NOW).map((t) => t.id)).toEqual(['sooner', 'later']);
  });
});

describe('filterTasks', () => {
  const tasks = [
    task({
      id: 'a',
      horseId: 'luna',
      horseName: 'Luna',
      assigneeId: 'a1',
      assigneeName: 'Yara',
      category: 'feeding',
      priority: 'high',
      status: 'pending',
      recurrence: { frequency: 'daily' },
      title: 'Morning feed round',
    }),
    task({
      id: 'b',
      horseId: 'storm',
      horseName: 'Storm',
      assigneeId: 'a2',
      assigneeName: 'Omar',
      category: 'health',
      priority: 'urgent',
      status: 'in-progress',
      recurrence: { frequency: 'none' },
      title: 'Farrier follow-up',
    }),
    task({
      id: 'c',
      horseId: 'luna',
      horseName: 'Luna',
      assigneeId: 'a2',
      assigneeName: 'Omar',
      category: 'grooming',
      priority: 'low',
      status: 'completed',
      recurrence: { frequency: 'none' },
      title: 'Groom before lesson',
    }),
  ];

  it('matches search across title, horse and assignee', () => {
    expect(filterTasks(tasks, { ...emptyTaskFilters, search: 'farrier' }).map((t) => t.id)).toEqual(
      ['b'],
    );
    expect(
      filterTasks(tasks, { ...emptyTaskFilters, search: 'omar' })
        .map((t) => t.id)
        .sort(),
    ).toEqual(['b', 'c']);
  });

  it('filters by horse, assignee, category, priority, status and recurring independently', () => {
    expect(
      filterTasks(tasks, { ...emptyTaskFilters, horseId: 'luna' })
        .map((t) => t.id)
        .sort(),
    ).toEqual(['a', 'c']);
    expect(filterTasks(tasks, { ...emptyTaskFilters, assigneeId: 'a1' }).map((t) => t.id)).toEqual([
      'a',
    ]);
    expect(
      filterTasks(tasks, { ...emptyTaskFilters, category: 'health' }).map((t) => t.id),
    ).toEqual(['b']);
    expect(
      filterTasks(tasks, { ...emptyTaskFilters, priority: 'urgent' }).map((t) => t.id),
    ).toEqual(['b']);
    expect(
      filterTasks(tasks, { ...emptyTaskFilters, status: 'completed' }).map((t) => t.id),
    ).toEqual(['c']);
    expect(filterTasks(tasks, { ...emptyTaskFilters, recurring: true }).map((t) => t.id)).toEqual([
      'a',
    ]);
    expect(
      filterTasks(tasks, { ...emptyTaskFilters, recurring: false })
        .map((t) => t.id)
        .sort(),
    ).toEqual(['b', 'c']);
  });

  it('combines filters together, not instead of each other', () => {
    const result = filterTasks(tasks, {
      ...emptyTaskFilters,
      horseId: 'luna',
      status: 'completed',
    });
    expect(result.map((t) => t.id)).toEqual(['c']);
  });

  it('reports active filters and counts them', () => {
    expect(hasActiveTaskFilters(emptyTaskFilters)).toBe(false);
    const active = { ...emptyTaskFilters, horseId: 'luna', priority: 'high' as const };
    expect(hasActiveTaskFilters(active)).toBe(true);
    expect(activeTaskFilterCount(active)).toBe(2);
  });
});

describe('formatTaskCount', () => {
  it('formats a plain count or a narrowed count', () => {
    expect(formatTaskCount(50, 50)).toBe('50 tasks');
    expect(formatTaskCount(1, 1)).toBe('1 task');
    expect(formatTaskCount(3, 50)).toBe('Showing 3 of 50 tasks');
  });
});

describe('tasksForTab', () => {
  const tasks = [
    task({ id: 'overdue', dueAt: day(-2), status: 'pending' }),
    task({ id: 'today', dueAt: day(0), status: 'pending' }),
    task({ id: 'upcoming', dueAt: day(3), status: 'pending' }),
    task({ id: 'done', dueAt: day(-10), status: 'completed' }),
  ];

  it('slices the set correctly for each tab', () => {
    expect(
      tasksForTab(tasks, 'all', NOW)
        .map((t) => t.id)
        .sort(),
    ).toEqual(['done', 'overdue', 'today', 'upcoming'].sort());
    expect(tasksForTab(tasks, 'overdue', NOW).map((t) => t.id)).toEqual(['overdue']);
    expect(tasksForTab(tasks, 'today', NOW).map((t) => t.id)).toEqual(['today']);
    expect(tasksForTab(tasks, 'upcoming', NOW).map((t) => t.id)).toEqual(['upcoming']);
    expect(tasksForTab(tasks, 'completed', NOW).map((t) => t.id)).toEqual(['done']);
  });
});

describe('summarizeTasks', () => {
  it('derives the four summary figures from the same task collection', () => {
    const tasks = [
      task({ id: 'a', dueAt: day(-1), status: 'pending' }),
      task({ id: 'b', dueAt: day(0), status: 'in-progress' }),
      task({ id: 'c', dueAt: day(2), status: 'in-progress' }),
      task({ id: 'd', dueAt: day(-5), status: 'completed' }),
      task({ id: 'e', dueAt: day(-3), status: 'cancelled' }),
    ];
    const summary = summarizeTasks(tasks, NOW);
    expect(summary.overdue).toBe(1); // a
    expect(summary.dueToday).toBe(1); // b
    expect(summary.inProgress).toBe(2); // b, c
    expect(summary.completed).toBe(1); // d
  });
});
