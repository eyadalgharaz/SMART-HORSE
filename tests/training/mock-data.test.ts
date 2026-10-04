import { describe, expect, it } from 'vitest';
import { buildHorseMocks } from '@/features/horses/mock/horse-mock-data';
import {
  buildProgramMocks,
  buildTrainerMocks,
  buildTrainingSessionMocks,
} from '@/features/training/mock/training-mock-data';
import {
  programStatusValues,
  sessionStatusValues,
  trainingTypeValues,
} from '@/features/training/vocabulary';

describe('buildTrainingSessionMocks', () => {
  const sessions = buildTrainingSessionMocks();
  const horseIds = new Set(buildHorseMocks().map((horse) => horse.id));

  it('produces a dataset large enough to review filters, paging and the timeline', () => {
    expect(sessions.length).toBeGreaterThanOrEqual(40);
    expect(new Set(sessions.map((session) => session.id)).size).toBe(sessions.length);
  });

  it('only ever references horses that Horse Management actually has', () => {
    for (const session of sessions) {
      expect(horseIds.has(session.horseId)).toBe(true);
    }
  });

  it('agrees with Horse Management about every horse name', () => {
    const names = new Map(buildHorseMocks().map((horse) => [horse.id, horse.name]));
    for (const session of sessions) {
      expect(session.horseName).toBe(names.get(session.horseId));
    }
  });

  it('covers every training type and every session status', () => {
    expect(new Set(sessions.map((session) => session.trainingType))).toEqual(
      new Set(trainingTypeValues),
    );
    expect(new Set(sessions.map((session) => session.status))).toEqual(
      new Set(sessionStatusValues),
    );
  });

  it('spans several horses and several trainers', () => {
    expect(new Set(sessions.map((session) => session.horseId)).size).toBeGreaterThanOrEqual(15);
    expect(new Set(sessions.map((session) => session.trainerId)).size).toBeGreaterThanOrEqual(3);
  });

  it('includes sessions with missing optional metrics, for the "not tracked" path', () => {
    expect(sessions.some((session) => session.distanceKm === null)).toBe(true);
    expect(sessions.some((session) => session.avgSpeedKmh === null)).toBe(true);
    expect(sessions.some((session) => session.result === null)).toBe(true);
    expect(sessions.some((session) => session.trainerNotes === null)).toBe(true);
  });

  it('includes sessions with full performance metrics tracked', () => {
    expect(
      sessions.some(
        (session) =>
          session.distanceKm !== null &&
          session.avgSpeedKmh !== null &&
          session.maxSpeedKmh !== null,
      ),
    ).toBe(true);
  });

  it('dates only scheduled sessions in the future', () => {
    const now = Date.now();
    for (const session of sessions) {
      if (session.status === 'scheduled') continue;
      expect(new Date(session.date).getTime()).toBeLessThanOrEqual(now);
    }
    expect(sessions.some((session) => new Date(session.date).getTime() > now)).toBe(true);
  });

  it('leaves some horses with no training sessions at all, for the empty-history path', () => {
    const trained = new Set(sessions.map((session) => session.horseId));
    expect(trained.size).toBeLessThan(buildHorseMocks().length);
  });

  it('links some sessions to a program and leaves others standalone', () => {
    expect(sessions.some((session) => session.programId !== null)).toBe(true);
    expect(sessions.some((session) => session.programId === null)).toBe(true);
  });
});

describe('buildProgramMocks', () => {
  const programs = buildProgramMocks();
  const horseIds = new Set(buildHorseMocks().map((horse) => horse.id));

  it('references only real horses and covers every program status', () => {
    for (const program of programs) expect(horseIds.has(program.horseId)).toBe(true);
    expect(new Set(programs.map((program) => program.status))).toEqual(
      new Set(programStatusValues),
    );
  });

  it('agrees with Horse Management about every horse name', () => {
    const names = new Map(buildHorseMocks().map((horse) => [horse.id, horse.name]));
    for (const program of programs) {
      expect(program.horseName).toBe(names.get(program.horseId));
    }
  });

  it('has unique ids', () => {
    expect(new Set(programs.map((program) => program.id)).size).toBe(programs.length);
  });
});

describe('buildTrainerMocks', () => {
  it('returns a stable set of named trainers', () => {
    const trainers = buildTrainerMocks();
    expect(trainers.length).toBeGreaterThanOrEqual(3);
    expect(new Set(trainers.map((trainer) => trainer.id)).size).toBe(trainers.length);
    for (const trainer of trainers) expect(trainer.name.trim()).not.toBe('');
  });
});
