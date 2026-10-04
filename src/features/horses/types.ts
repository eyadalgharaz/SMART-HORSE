/**
 * Horse read and write models.
 *
 * The Horses module owns horse identity (Module Specifications v1.0 §3): the
 * record itself, its identifiers and who currently holds it. Health, training,
 * tasks and marketplace records live in their own modules and are not part of
 * this shape.
 *
 * These types describe what the UI needs, in a shape a future
 * `GET /api/v1/horses` response can satisfy. Dates are ISO 8601 strings and the
 * UI does all display formatting, so the server never sends display text.
 * Optional information is `null` rather than absent, so "not recorded" is an
 * explicit answer instead of a missing key.
 */

export type HorseGender = 'mare' | 'stallion' | 'gelding' | 'filly' | 'colt';

export type HorseStatus = 'active' | 'in-training' | 'resting' | 'sold';

export interface HorseOwner {
  id: string;
  name: string;
}

export interface Horse {
  id: string;
  name: string;
  breed: string;
  gender: HorseGender;
  /** ISO 8601 date-time at the start of the day the horse was born. */
  birthDate: string;
  color: string;
  /** Studbook or national registration number. Null when never recorded. */
  registrationNumber: string | null;
  /** ISO 11784/11785 transponder code. Null when the horse is not chipped. */
  microchipNumber: string | null;
  /** Photo of the horse. Null falls back to a monogram tile. */
  imageUrl: string | null;
  /** Current holder of the record. Null when ownership is unassigned. */
  owner: HorseOwner | null;
  status: HorseStatus;
  /** When the record was last changed; shown as provenance on the profile. */
  updatedAt: string;
}

/** Everything a person can set on the Add and Edit forms. */
export interface HorseInput {
  name: string;
  breed: string;
  gender: HorseGender;
  birthDate: string;
  color: string;
  registrationNumber: string | null;
  microchipNumber: string | null;
  ownerName: string | null;
  status: HorseStatus;
  /** Local object URL or data URL only — nothing is uploaded in this phase. */
  imageUrl: string | null;
}

/** What the list screen filters on. Empty string and null both mean "any". */
export interface HorseFilters {
  search: string;
  breed: string | null;
  gender: HorseGender | null;
  status: HorseStatus | null;
}

export const emptyHorseFilters: HorseFilters = {
  search: '',
  breed: null,
  gender: null,
  status: null,
};

/**
 * The only contract the Horses UI depends on. Phase C ships a mock
 * implementation; a later phase swaps in an HTTP client against /api/v1
 * without touching any component.
 */
export interface HorseService {
  listHorses(): Promise<Horse[]>;
  getHorse(id: string): Promise<Horse>;
  createHorse(input: HorseInput): Promise<Horse>;
  updateHorse(id: string, input: HorseInput): Promise<Horse>;
}

/** Failure the UI renders as the horse list / profile error state. */
export class HorseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'HorseError';
  }
}

/** A horse id that does not exist. Rendered as the not-found state, not an error. */
export class HorseNotFoundError extends HorseError {
  constructor(id: string) {
    super(`No horse with id "${id}".`);
    this.name = 'HorseNotFoundError';
  }
}

export function isHorseNotFound(error: unknown): boolean {
  return error instanceof HorseNotFoundError;
}
