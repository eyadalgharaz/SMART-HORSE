import type { ActivityDay, DashboardNotification, DashboardOverview, UpcomingTask } from '../types';

/**
 * Realistic, self-consistent sample data for a mid-sized stable.
 *
 * Every date is built relative to `now`, so labels such as "Today" and
 * "Tomorrow" stay true whenever the page is opened. The figures agree with each
 * other on purpose (for example the summary's 8 vaccinations equal the health
 * overview's), because a dashboard that contradicts itself reads as broken.
 *
 * This file is fake data only — nothing here implies a backend exists.
 */

const MINUTE_MS = 60_000;

/** Local calendar day `offset` days from `now`, at the given clock time. */
function localTime(now: Date, offset: number, hour = 0, minute = 0): Date {
  return new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset, hour, minute);
}

function minutesAgo(now: Date, minutes: number): string {
  return new Date(now.getTime() - minutes * MINUTE_MS).toISOString();
}

/**
 * Typical sessions per weekday, indexed by `Date#getDay()` (Sunday first).
 * Weekends are quieter, as on a working yard. Any seven consecutive days sum to 71.
 */
const SESSIONS_BY_WEEKDAY = [4, 11, 13, 10, 14, 12, 7] as const;
const PREVIOUS_PERIOD_SESSIONS = 64;
const ACTIVITY_WINDOW_DAYS = 7;

function buildActivityDays(now: Date): ActivityDay[] {
  return Array.from({ length: ACTIVITY_WINDOW_DAYS }, (_, index) => {
    const day = localTime(now, index - (ACTIVITY_WINDOW_DAYS - 1));
    return { date: day.toISOString(), sessions: SESSIONS_BY_WEEKDAY[day.getDay()] ?? 0 };
  });
}

function buildTasks(now: Date): UpcomingTask[] {
  return [
    {
      id: 'task-farrier-duke',
      type: 'farrier',
      horseName: 'Duke',
      dueAt: localTime(now, -1, 14, 0).toISOString(),
      status: 'overdue',
      priority: 'normal',
    },
    {
      id: 'task-vaccination-luna',
      type: 'vaccination',
      horseName: 'Luna',
      dueAt: localTime(now, 0, 10, 0).toISOString(),
      status: 'due-today',
      priority: 'high',
    },
    {
      id: 'task-training-shadow',
      type: 'training',
      horseName: 'Shadow',
      dueAt: localTime(now, 0, 16, 0).toISOString(),
      status: 'due-today',
      priority: 'normal',
    },
    {
      id: 'task-veterinary-thunder',
      type: 'veterinary',
      horseName: 'Thunder',
      dueAt: localTime(now, 1, 9, 30).toISOString(),
      status: 'upcoming',
      priority: 'normal',
    },
    {
      id: 'task-feeding-willow',
      type: 'feeding',
      horseName: 'Willow',
      dueAt: localTime(now, 3, 8, 0).toISOString(),
      status: 'upcoming',
      priority: 'low',
    },
  ];
}

function buildNotifications(now: Date): DashboardNotification[] {
  return [
    {
      id: 'note-vaccination-luna',
      category: 'vaccination',
      horseName: 'Luna',
      createdAt: minutesAgo(now, 10),
      read: false,
    },
    {
      id: 'note-appointment-thunder',
      category: 'appointment',
      horseName: 'Thunder',
      createdAt: minutesAgo(now, 60),
      read: false,
    },
    {
      id: 'note-training-shadow',
      category: 'training',
      horseName: 'Shadow',
      createdAt: minutesAgo(now, 120),
      read: true,
    },
    {
      id: 'note-task-duke',
      category: 'task',
      horseName: 'Duke',
      taskType: 'farrier',
      createdAt: minutesAgo(now, 20 * 60),
      read: true,
    },
  ];
}

export function buildDashboardMock(now: Date = new Date()): DashboardOverview {
  return {
    generatedAt: now.toISOString(),
    farm: { id: 'farm-green-valley', name: 'Green Valley Farm' },
    summary: {
      totalHorses: { value: 42, previousMonthValue: 40 },
      upcomingVisits: { value: 5, nextAt: localTime(now, 1, 9, 30).toISOString() },
      vaccinations: { value: 8, dueThisWeek: 3 },
      pendingTasks: { value: 12, dueToday: 4 },
    },
    activity: {
      days: buildActivityDays(now),
      previousPeriodTotal: PREVIOUS_PERIOD_SESSIONS,
    },
    upcomingTasks: buildTasks(now),
    health: {
      vaccinations: { count: 8, dueThisWeek: 3 },
      medicalVisits: { count: 5, nextAt: localTime(now, 1, 9, 30).toISOString() },
      activeTreatments: { count: 3, horsesAffected: 3 },
      followUps: { count: 2, dueThisWeek: 1 },
      vaccinationCoverage: { upToDate: 34, total: 42 },
    },
    notifications: buildNotifications(now),
  };
}

/** A farm with no horses yet: every figure is zero and every list is empty. */
export function buildEmptyDashboardMock(now: Date = new Date()): DashboardOverview {
  const base = buildDashboardMock(now);
  return {
    ...base,
    summary: {
      totalHorses: { value: 0, previousMonthValue: null },
      upcomingVisits: { value: 0, nextAt: null },
      vaccinations: { value: 0, dueThisWeek: 0 },
      pendingTasks: { value: 0, dueToday: 0 },
    },
    activity: {
      days: base.activity.days.map((day) => ({ ...day, sessions: 0 })),
      previousPeriodTotal: 0,
    },
    upcomingTasks: [],
    health: {
      vaccinations: { count: 0, dueThisWeek: 0 },
      medicalVisits: { count: 0, nextAt: null },
      activeTreatments: { count: 0, horsesAffected: 0 },
      followUps: { count: 0, dueThisWeek: 0 },
      vaccinationCoverage: { upToDate: 0, total: 0 },
    },
    notifications: [],
  };
}
