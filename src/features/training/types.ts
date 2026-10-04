import type { TrainingProgramStatus, TrainingSessionStatus, TrainingType } from './vocabulary';

export type { TrainingProgramStatus, TrainingSessionStatus, TrainingType };

/**
 * Training read and write models.
 *
 * The Training module owns a horse's training programs and session history;
 * the horse's identity stays with the Horses module, so a session points at a
 * horse by id and never carries its photo, breed or owner.
 *
 * These types describe what the UI needs, in a shape a future
 * `GET /api/v1/training/...` response can satisfy. Dates are ISO 8601 strings
 * and the UI does all display formatting. Optional information is `null`
 * rather than absent, so "not recorded" is an explicit answer instead of a
 * missing key.
 */

/**
 * A trainer, as Training currently knows them: a lightweight reference, not a
 * user record. A future backend can replace this with a real user/member
 * reference without changing how the UI reads a trainer's name.
 */
export interface Trainer {
  id: string;
  name: string;
}

export interface TrainingSession {
  id: string;
  horseId: string;
  /** Denormalised so lists can show the horse without a second request. */
  horseName: string;
  programId: string | null;
  trainingType: TrainingType;
  title: string;
  /** ISO 8601 date-time the session starts (or started, or was scheduled for). */
  date: string;
  durationMinutes: number;
  trainerId: string;
  /** Denormalised so lists can show the trainer without a second request. */
  trainerName: string;
  status: TrainingSessionStatus;
  /** Total distance covered, in kilometres. Null when not tracked for this session. */
  distanceKm: number | null;
  /** Average speed over the session, in km/h. Null when not tracked. */
  avgSpeedKmh: number | null;
  /** Peak speed reached, in km/h. Null when not tracked or not applicable. */
  maxSpeedKmh: number | null;
  /** A short descriptive outcome, e.g. "Strong, controlled pace throughout." Never a score. */
  result: string | null;
  trainerNotes: string | null;
  notes: string | null;
  createdAt: string;
}

/** Everything a person can set on the Add and Edit forms. */
export interface TrainingSessionInput {
  horseId: string;
  programId: string | null;
  trainingType: TrainingType;
  title: string;
  date: string;
  durationMinutes: number;
  trainerId: string;
  trainerName: string;
  status: TrainingSessionStatus;
  distanceKm: number | null;
  avgSpeedKmh: number | null;
  maxSpeedKmh: number | null;
  result: string | null;
  trainerNotes: string | null;
  notes: string | null;
}

export interface TrainingProgram {
  id: string;
  name: string;
  description: string | null;
  horseId: string;
  horseName: string;
  trainerId: string | null;
  trainerName: string | null;
  /** ISO 8601 date-time at the start of the day the program begins. */
  startDate: string;
  /** Null while the program has no planned end. */
  endDate: string | null;
  status: TrainingProgramStatus;
  goals: string | null;
  notes: string | null;
}

/** What the session list filters on. Empty string and null both mean "any". */
export interface TrainingSessionFilters {
  search: string;
  horseId: string | null;
  trainerId: string | null;
  trainingType: TrainingType | null;
  status: TrainingSessionStatus | null;
  /** "YYYY-MM-DD" from a date input, or an empty string for no lower bound. */
  dateFrom: string;
  /** "YYYY-MM-DD" from a date input, or an empty string for no upper bound. */
  dateTo: string;
}

export const emptyTrainingSessionFilters: TrainingSessionFilters = {
  search: '',
  horseId: null,
  trainerId: null,
  trainingType: null,
  status: null,
  dateFrom: '',
  dateTo: '',
};

/** A horse as the filters see it: only what the option list needs. */
export interface HorseOption {
  id: string;
  name: string;
}

/**
 * The only contract the Training UI depends on. Phase E ships a mock
 * implementation; a later phase swaps in an HTTP client against /api/v1
 * without touching any component.
 */
export interface TrainingService {
  listSessions(): Promise<TrainingSession[]>;
  getSession(id: string): Promise<TrainingSession>;
  getHorseSessions(horseId: string): Promise<TrainingSession[]>;
  listPrograms(): Promise<TrainingProgram[]>;
  listTrainers(): Promise<Trainer[]>;
  createSession(horseId: string, input: TrainingSessionInput): Promise<TrainingSession>;
  updateSession(id: string, input: TrainingSessionInput): Promise<TrainingSession>;
}

/** Failure the UI renders as an error state with "Try again". */
export class TrainingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TrainingError';
  }
}

/** A session id that does not exist. Rendered as the not-found state, not an error. */
export class TrainingSessionNotFoundError extends TrainingError {
  constructor(id: string) {
    super(`No training session with id "${id}".`);
    this.name = 'TrainingSessionNotFoundError';
  }
}

export function isTrainingSessionNotFound(error: unknown): boolean {
  return error instanceof TrainingSessionNotFoundError;
}
