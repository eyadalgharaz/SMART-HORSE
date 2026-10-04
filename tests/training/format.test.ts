import { describe, expect, it } from 'vitest';
import {
  activeTrainingFilterCount,
  filterTrainingSessions,
  formatDistance,
  formatDuration,
  formatSessionCount,
  formatSpeed,
  groupSessionsByYear,
  hasActiveTrainingFilters,
  horsesOf,
  progressSeries,
  sortSessionsNewestFirst,
  sortSessionsSoonestFirst,
  summarizeHorseTraining,
  summarizeTrainingOverview,
  trainersOf,
} from '@/features/training/format';
import {
  emptyTrainingSessionFilters,
  type TrainingProgram,
  type TrainingSession,
} from '@/features/training/types';

/** Fixed "today" so every date-dependent rule is deterministic. */
const NOW = new Date(2026, 8, 20); // 20 Sep 2026

function day(offset: number, hour = 9): string {
  return new Date(2026, 8, 20 + offset, hour).toISOString();
}

function session(overrides: Partial<TrainingSession> = {}): TrainingSession {
  return {
    id: 'ts-x',
    horseId: 'luna',
    horseName: 'Luna',
    programId: null,
    trainingType: 'flatwork',
    title: 'Sample session',
    date: day(-5),
    durationMinutes: 45,
    trainerId: 'trainer-farida',
    trainerName: 'Farida El-Sayed',
    status: 'completed',
    distanceKm: null,
    avgSpeedKmh: null,
    maxSpeedKmh: null,
    result: null,
    trainerNotes: null,
    notes: null,
    createdAt: day(-5, 12),
    ...overrides,
  };
}

function program(overrides: Partial<TrainingProgram> = {}): TrainingProgram {
  return {
    id: 'prog-x',
    name: 'Sample Program',
    description: null,
    horseId: 'luna',
    horseName: 'Luna',
    trainerId: 'trainer-farida',
    trainerName: 'Farida El-Sayed',
    startDate: day(-30),
    endDate: null,
    status: 'active',
    goals: null,
    notes: null,
    ...overrides,
  };
}

describe('formatting', () => {
  it('formats duration under and over an hour', () => {
    expect(formatDuration(45)).toBe('45 min');
    expect(formatDuration(60)).toBe('1 hr');
    expect(formatDuration(75)).toBe('1 hr 15 min');
  });

  it('formats distance and speed with one decimal, or null when absent', () => {
    expect(formatDistance(8.4)).toBe('8.4 km');
    expect(formatDistance(null)).toBeNull();
    expect(formatSpeed(12)).toBe('12.0 km/h');
    expect(formatSpeed(null)).toBeNull();
  });

  it('formats a session count with and without active filters', () => {
    expect(formatSessionCount(40, 40)).toBe('40 sessions');
    expect(formatSessionCount(1, 1)).toBe('1 session');
    expect(formatSessionCount(3, 40)).toBe('Showing 3 of 40 sessions');
  });
});

describe('sorting and grouping', () => {
  it('sorts sessions newest first', () => {
    const sessions = [session({ id: 'a', date: day(-10) }), session({ id: 'b', date: day(-1) })];
    expect(sortSessionsNewestFirst(sessions).map((s) => s.id)).toEqual(['b', 'a']);
  });

  it('sorts sessions soonest first', () => {
    const sessions = [session({ id: 'a', date: day(5) }), session({ id: 'b', date: day(1) })];
    expect(sortSessionsSoonestFirst(sessions).map((s) => s.id)).toEqual(['b', 'a']);
  });

  it('groups sessions by calendar year, newest year first', () => {
    const sessions = [
      session({ id: 'a', date: new Date(2025, 5, 1).toISOString() }),
      session({ id: 'b', date: new Date(2026, 5, 1).toISOString() }),
      session({ id: 'c', date: new Date(2026, 2, 1).toISOString() }),
    ];
    const sorted = sortSessionsNewestFirst(sessions);
    const groups = groupSessionsByYear(sorted);
    expect(groups.map((g) => g.year)).toEqual([2026, 2025]);
  });

  it('derives distinct horse and trainer option lists', () => {
    const sessions = [
      session({ horseId: 'luna', horseName: 'Luna', trainerId: 't1', trainerName: 'A' }),
      session({ horseId: 'luna', horseName: 'Luna', trainerId: 't2', trainerName: 'B' }),
      session({ horseId: 'storm', horseName: 'Storm', trainerId: 't1', trainerName: 'A' }),
    ];
    expect(horsesOf(sessions).map((h) => h.id)).toEqual(['luna', 'storm']);
    expect(
      trainersOf(sessions)
        .map((t) => t.id)
        .sort(),
    ).toEqual(['t1', 't2']);
  });
});

describe('filterTrainingSessions', () => {
  const sessions = [
    session({
      id: 'a',
      horseId: 'luna',
      horseName: 'Luna',
      trainerId: 't1',
      trainerName: 'Farida',
      trainingType: 'endurance',
      status: 'completed',
      date: day(-5),
    }),
    session({
      id: 'b',
      horseId: 'storm',
      horseName: 'Storm',
      trainerId: 't2',
      trainerName: 'Omar',
      trainingType: 'speed-work',
      status: 'scheduled',
      date: day(3),
    }),
    session({
      id: 'c',
      horseId: 'luna',
      horseName: 'Luna',
      trainerId: 't2',
      trainerName: 'Omar',
      trainingType: 'flatwork',
      status: 'cancelled',
      date: day(-20),
      title: 'Cancelled lesson',
    }),
  ];

  it('matches search across horse, trainer and title', () => {
    expect(
      filterTrainingSessions(sessions, { ...emptyTrainingSessionFilters, search: 'storm' }).map(
        (s) => s.id,
      ),
    ).toEqual(['b']);
    expect(
      filterTrainingSessions(sessions, { ...emptyTrainingSessionFilters, search: 'omar' })
        .map((s) => s.id)
        .sort(),
    ).toEqual(['b', 'c']);
    expect(
      filterTrainingSessions(sessions, {
        ...emptyTrainingSessionFilters,
        search: 'cancelled lesson',
      }).map((s) => s.id),
    ).toEqual(['c']);
  });

  it('filters by horse, trainer, type and status independently', () => {
    expect(
      filterTrainingSessions(sessions, { ...emptyTrainingSessionFilters, horseId: 'luna' })
        .map((s) => s.id)
        .sort(),
    ).toEqual(['a', 'c']);
    expect(
      filterTrainingSessions(sessions, { ...emptyTrainingSessionFilters, trainerId: 't2' })
        .map((s) => s.id)
        .sort(),
    ).toEqual(['b', 'c']);
    expect(
      filterTrainingSessions(sessions, {
        ...emptyTrainingSessionFilters,
        trainingType: 'speed-work',
      }).map((s) => s.id),
    ).toEqual(['b']);
    expect(
      filterTrainingSessions(sessions, { ...emptyTrainingSessionFilters, status: 'cancelled' }).map(
        (s) => s.id,
      ),
    ).toEqual(['c']);
  });

  it('combines filters together, not instead of each other', () => {
    const result = filterTrainingSessions(sessions, {
      ...emptyTrainingSessionFilters,
      horseId: 'luna',
      status: 'completed',
    });
    expect(result.map((s) => s.id)).toEqual(['a']);
  });

  it('filters by date range', () => {
    const result = filterTrainingSessions(sessions, {
      ...emptyTrainingSessionFilters,
      dateFrom: '2026-08-01',
      dateTo: '2026-09-10',
    });
    expect(result.map((s) => s.id)).toEqual(['c']);
  });

  it('reports whether filters are active and counts them', () => {
    expect(hasActiveTrainingFilters(emptyTrainingSessionFilters)).toBe(false);
    const active = {
      ...emptyTrainingSessionFilters,
      horseId: 'luna',
      status: 'completed' as const,
    };
    expect(hasActiveTrainingFilters(active)).toBe(true);
    expect(activeTrainingFilterCount(active)).toBe(2);
  });
});

describe('summarizeTrainingOverview', () => {
  it('derives the four overview figures from the same collections shown below', () => {
    const sessions = [
      session({ id: 'a', date: day(-1), status: 'completed' }),
      session({ id: 'b', date: day(2), status: 'scheduled' }),
      session({ id: 'c', date: day(2), status: 'cancelled' }),
      session({
        id: 'd',
        horseId: 'storm',
        horseName: 'Storm',
        date: day(-40),
        status: 'completed',
      }),
    ];
    const programs = [program({ status: 'active' }), program({ id: 'p2', status: 'completed' })];

    const summary = summarizeTrainingOverview({ sessions, programs }, NOW);

    expect(summary.activePrograms).toBe(1);
    expect(summary.completedSessions).toBe(2);
    // "b" is scheduled within the week window, "c" is cancelled and excluded.
    expect(summary.sessionsThisWeek).toBe(2);
    // "d" is 40 days ago and outside the "active in the last week" window.
    expect(summary.horsesInTraining).toBe(1);
  });
});

describe('summarizeHorseTraining', () => {
  it('derives per-horse totals, current program, last and next session', () => {
    const sessions = [
      session({ id: 'past', date: day(-3), status: 'completed' }),
      session({ id: 'future', date: day(4), status: 'scheduled' }),
      session({ id: 'cancelled', date: day(1), status: 'cancelled' }),
    ];
    const programs = [program({ status: 'active', name: 'Endurance Base Building' })];

    const summary = summarizeHorseTraining(sessions, programs, NOW);

    expect(summary.totalSessions).toBe(3);
    expect(summary.completedSessions).toBe(1);
    expect(summary.currentProgram?.name).toBe('Endurance Base Building');
    expect(summary.lastSession?.id).toBe('past');
    expect(summary.nextSession?.id).toBe('future');
  });

  it('reports no current program when none is active', () => {
    const summary = summarizeHorseTraining([], [program({ status: 'planned' })], NOW);
    expect(summary.currentProgram).toBeNull();
  });
});

describe('progressSeries', () => {
  it('plots only completed sessions with a tracked metric, oldest first', () => {
    const sessions = [
      session({ id: 'a', date: day(-10), status: 'completed', distanceKm: 5 }),
      session({ id: 'b', date: day(-5), status: 'completed', distanceKm: null, avgSpeedKmh: null }),
      session({ id: 'c', date: day(-1), status: 'completed', avgSpeedKmh: 12 }),
      session({ id: 'd', date: day(2), status: 'scheduled', distanceKm: 5 }),
    ];
    const points = progressSeries(sessions);
    expect(points.map((p) => p.sessionId)).toEqual(['a', 'c']);
  });

  it('caps the series to the most recent `limit` sessions', () => {
    const sessions = Array.from({ length: 15 }, (_, index) =>
      session({ id: `s${index}`, date: day(-index), status: 'completed', distanceKm: index }),
    );
    expect(progressSeries(sessions, 10)).toHaveLength(10);
  });
});
