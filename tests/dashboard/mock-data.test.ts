import { describe, expect, it } from 'vitest';
import {
  buildDashboardMock,
  buildEmptyDashboardMock,
} from '@/features/dashboard/mock/dashboard-mock-data';
import { calendarDayDifference } from '@/features/dashboard/format';

const NOW = new Date(2026, 8, 19, 9, 0);

describe('dashboard mock data', () => {
  const data = buildDashboardMock(NOW);

  it('keeps figures consistent between the summary and the health overview', () => {
    expect(data.summary.vaccinations.value).toBe(data.health.vaccinations.count);
    expect(data.summary.vaccinations.dueThisWeek).toBe(data.health.vaccinations.dueThisWeek);
    expect(data.summary.upcomingVisits.value).toBe(data.health.medicalVisits.count);
    expect(data.summary.upcomingVisits.nextAt).toBe(data.health.medicalVisits.nextAt);
    expect(data.health.vaccinationCoverage.total).toBe(data.summary.totalHorses.value);
  });

  it('gives every task a status that matches its due date', () => {
    for (const task of data.upcomingTasks) {
      const days = calendarDayDifference(new Date(task.dueAt), NOW);
      if (task.status === 'overdue') expect(days).toBeLessThan(0);
      if (task.status === 'due-today') expect(days).toBe(0);
      if (task.status === 'upcoming') expect(days).toBeGreaterThan(0);
    }
  });

  it('lists the most urgent tasks first', () => {
    const order = ['overdue', 'due-today', 'upcoming'];
    const ranks = data.upcomingTasks.map((task) => order.indexOf(task.status));
    expect(ranks).toEqual([...ranks].sort((a, b) => a - b));
  });

  it('orders notifications newest first', () => {
    const times = data.notifications.map((n) => new Date(n.createdAt).getTime());
    expect(times).toEqual([...times].sort((a, b) => b - a));
  });

  it('covers seven days ending today, with the same weekly total on any day', () => {
    for (let offset = 0; offset < 7; offset += 1) {
      const now = new Date(2026, 8, 19 + offset, 9, 0);
      const { activity } = buildDashboardMock(now);
      expect(activity.days).toHaveLength(7);
      expect(calendarDayDifference(new Date(activity.days[6]!.date), now)).toBe(0);
      expect(activity.days.reduce((sum, day) => sum + day.sessions, 0)).toBe(71);
    }
  });

  it('describes a farm with nothing in it when asked for the empty scenario', () => {
    const empty = buildEmptyDashboardMock(NOW);
    expect(empty.summary.totalHorses.value).toBe(0);
    expect(empty.upcomingTasks).toEqual([]);
    expect(empty.notifications).toEqual([]);
    expect(empty.activity.days.every((day) => day.sessions === 0)).toBe(true);
    expect(empty.health.vaccinationCoverage.total).toBe(0);
  });
});
