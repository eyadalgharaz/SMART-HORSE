import {
  TrainingError,
  TrainingSessionNotFoundError,
  type TrainingProgram,
  type TrainingService,
  type TrainingSession,
  type TrainingSessionInput,
} from '../types';
import { sortSessionsNewestFirst } from '../format';
import { buildHorseMocks } from '@/features/horses/mock/horse-mock-data';
import {
  buildProgramMocks,
  buildTrainerMocks,
  buildTrainingSessionMocks,
} from './training-mock-data';

/**
 * Temporary, in-browser stand-in for `/api/v1/training` so the Training
 * module can be built and reviewed before the backend exists.
 *
 * Like the Phase A/B/C/D mocks it is deliberately thin: in-memory arrays, no
 * fake endpoints, no fake database. Adds and edits change those arrays so the
 * overview, the horse's timeline and its progress chart visibly update during
 * review; everything resets on reload, which is all a frontend review needs.
 *
 * Review switches (mock only — append to /training):
 *   ?mock=error   the request fails            → error state
 *   ?mock=empty   a farm with no training data → empty state
 *   ?mock=slow    the request takes ~4 s       → loading skeleton
 */

const LATENCY_MS = 450;
const SLOW_LATENCY_MS = 4000;
const WRITE_LATENCY_MS = 600;

type Scenario = 'default' | 'error' | 'empty' | 'slow';

interface Store {
  sessions: TrainingSession[];
  programs: TrainingProgram[];
}

let store: Store | null = null;
let scenarioAtLoad: Scenario | null = null;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function currentScenario(): Scenario {
  if (typeof window === 'undefined') return 'default';
  const value = new URLSearchParams(window.location.search).get('mock');
  return value === 'error' || value === 'empty' || value === 'slow' ? value : 'default';
}

/**
 * The store is created on first use for the scenario in force at that
 * moment, so `?mock=empty` starts from nothing while the default starts from
 * the sample history. Switching scenario rebuilds it, which also discards
 * anything added during review — the same thing a reload would do.
 */
function data(): Store {
  const scenario = currentScenario();
  const seed = scenario === 'slow' || scenario === 'error' ? 'default' : scenario;
  if (store === null || scenarioAtLoad !== seed) {
    store =
      seed === 'empty'
        ? { sessions: [], programs: [] }
        : { sessions: buildTrainingSessionMocks(), programs: buildProgramMocks() };
    scenarioAtLoad = seed;
  }
  return store;
}

/** Test helper: forget anything added or edited during a spec. */
export function resetMockTraining(): void {
  store = null;
  scenarioAtLoad = null;
}

async function guard(latency: number): Promise<void> {
  const scenario = currentScenario();
  await delay(scenario === 'slow' ? SLOW_LATENCY_MS : latency);
  if (scenario === 'error') throw new TrainingError('The training data could not be loaded.');
}

function clone(session: TrainingSession): TrainingSession {
  return { ...session };
}

function nextId(sessions: TrainingSession[]): string {
  const highest = sessions.reduce((max, session) => {
    const match = /^ts-(\d+)$/.exec(session.id);
    return match ? Math.max(max, Number(match[1])) : max;
  }, 0);
  return `ts-${String(highest + 1).padStart(3, '0')}`;
}

/**
 * Horse names come from Horse Management, never from anything Training
 * invents: the horse's existing sessions first, then the stable itself for a
 * horse whose first session this is. In production the server resolves the
 * name (or the client sends only `horseId` and the response carries it back).
 */
function horseNameFor(horseId: string, sessions: TrainingSession[]): string {
  const fromHistory = sessions.find((session) => session.horseId === horseId)?.horseName;
  if (fromHistory) return fromHistory;
  return buildHorseMocks().find((horse) => horse.id === horseId)?.name ?? horseId;
}

function applyInput(
  input: TrainingSessionInput,
  base: Pick<TrainingSession, 'id' | 'horseId' | 'horseName' | 'createdAt'>,
): TrainingSession {
  return {
    ...base,
    programId: input.programId,
    trainingType: input.trainingType,
    title: input.title.trim(),
    date: input.date,
    durationMinutes: input.durationMinutes,
    trainerId: input.trainerId,
    trainerName: input.trainerName,
    status: input.status,
    distanceKm: input.distanceKm,
    avgSpeedKmh: input.avgSpeedKmh,
    maxSpeedKmh: input.maxSpeedKmh,
    result: input.result,
    trainerNotes: input.trainerNotes,
    notes: input.notes,
  };
}

export const mockTrainingService: TrainingService = {
  async listSessions() {
    await guard(LATENCY_MS);
    return sortSessionsNewestFirst(data().sessions).map(clone);
  },

  async getSession(id) {
    await guard(LATENCY_MS);
    const session = data().sessions.find((candidate) => candidate.id === id);
    if (!session) throw new TrainingSessionNotFoundError(id);
    return clone(session);
  },

  async getHorseSessions(horseId) {
    await guard(LATENCY_MS);
    return sortSessionsNewestFirst(
      data().sessions.filter((session) => session.horseId === horseId),
    ).map(clone);
  },

  async listPrograms() {
    await guard(LATENCY_MS);
    return data().programs.map((program) => ({ ...program }));
  },

  async listTrainers() {
    await guard(LATENCY_MS);
    return buildTrainerMocks();
  },

  async createSession(horseId, input) {
    await guard(WRITE_LATENCY_MS);
    const current = data();
    const created = applyInput(input, {
      id: nextId(current.sessions),
      horseId,
      horseName: horseNameFor(horseId, current.sessions),
      createdAt: new Date().toISOString(),
    });
    current.sessions.unshift(created);
    return clone(created);
  },

  async updateSession(id, input) {
    await guard(WRITE_LATENCY_MS);
    const current = data();
    const index = current.sessions.findIndex((candidate) => candidate.id === id);
    const previous = current.sessions[index];
    if (index === -1 || !previous) throw new TrainingSessionNotFoundError(id);

    const updated = applyInput(input, {
      id: previous.id,
      horseId: previous.horseId,
      horseName: previous.horseName,
      createdAt: previous.createdAt,
    });
    current.sessions[index] = updated;
    return clone(updated);
  },
};
