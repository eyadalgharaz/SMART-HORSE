import type {
  AttachmentType,
  HealthStatus,
  MedicalRecordStatus,
  MedicalRecordType,
  UpcomingEventKind,
  VaccinationStatus,
} from './vocabulary';

export type {
  AttachmentType,
  HealthStatus,
  MedicalRecordStatus,
  MedicalRecordType,
  UpcomingEventKind,
  VaccinationStatus,
};

/**
 * Medical read and write models.
 *
 * The Health module owns a horse's medical history (Module Specifications v1.0
 * §3); the horse's identity stays with the Horses module, so a record points at
 * a horse by id and never carries its photo, breed or owner.
 *
 * These types describe what the UI needs, in a shape a future
 * `GET /api/v1/medical/...` response can satisfy. Dates are ISO 8601 strings and
 * the UI does all display formatting. Optional information is `null` rather than
 * absent, so "not recorded" is an explicit answer instead of a missing key.
 */

export interface MedicalAttachment {
  id: string;
  fileName: string;
  type: AttachmentType;
  sizeBytes: number;
  /** ISO 8601 date-time the file was added to the record. */
  addedAt: string;
}

/** Only present on a vaccination record. */
export interface VaccineDetails {
  name: string;
  /** ISO 8601 date-time the next dose is due. Null when no further dose is planned. */
  nextDueDate: string | null;
}

export interface MedicalRecord {
  id: string;
  horseId: string;
  /** Denormalised so lists can show the horse without a second request. */
  horseName: string;
  recordType: MedicalRecordType;
  /** When the visit, dose or event took place — or will, for a scheduled record. */
  date: string;
  title: string;
  diagnosis: string | null;
  treatment: string | null;
  medication: string | null;
  /** Null when no vet attended, e.g. a dewormer given by yard staff. */
  veterinarian: string | null;
  status: MedicalRecordStatus;
  notes: string | null;
  attachments: MedicalAttachment[];
  followUpDate: string | null;
  followUpNotes: string | null;
  vaccine: VaccineDetails | null;
  createdAt: string;
}

/** Everything a person can set on the Add and Edit forms. */
export interface MedicalRecordInput {
  recordType: MedicalRecordType;
  status: MedicalRecordStatus;
  date: string;
  title: string;
  veterinarian: string | null;
  diagnosis: string | null;
  treatment: string | null;
  medication: string | null;
  notes: string | null;
  followUpDate: string | null;
  followUpNotes: string | null;
  /** Only sent for a vaccination; null for every other record type. */
  vaccine: VaccineDetails | null;
  /** Metadata only — nothing is uploaded in this phase. */
  attachments: MedicalAttachment[];
}

/**
 * A horse's health status. Entered by a person, never inferred: this phase has
 * no health analysis of any kind.
 */
export interface HorseHealth {
  horseId: string;
  horseName: string;
  status: HealthStatus;
  /** A short line from whoever set the status, e.g. "Box rest until Friday's recheck." */
  note: string | null;
  updatedAt: string;
}

export interface HorseMedicalHistory {
  horseId: string;
  /** Null when no one has recorded a health status for this horse yet. */
  health: HorseHealth | null;
  /** Newest first. */
  records: MedicalRecord[];
}

/**
 * The latest dose of one vaccine for one horse. Status is deliberately not a
 * field: it is calculated from the dates against today (see `vaccinationStatus`),
 * so it can never disagree with them.
 */
export interface Vaccination {
  id: string;
  horseId: string;
  horseName: string;
  vaccineName: string;
  /** Null when no dose has been given yet and the first one is only booked. */
  administeredOn: string | null;
  nextDueDate: string | null;
  /** A booked appointment for the next dose, when there is one. */
  scheduledFor: string | null;
  veterinarian: string | null;
  /** The record that documents this dose (or the booking), for "View record". */
  recordId: string | null;
}

export interface UpcomingMedicalEvent {
  id: string;
  horseId: string;
  horseName: string;
  kind: UpcomingEventKind;
  title: string;
  date: string;
  /** True for an appointment or follow-up someone has set; false for a bare due date. */
  booked: boolean;
  veterinarian: string | null;
  /** The record behind this event, when one exists. */
  recordId: string | null;
}

/** What the records list filters on. Empty string and null both mean "any". */
export interface MedicalRecordFilters {
  search: string;
  horseId: string | null;
  recordType: MedicalRecordType | null;
  status: MedicalRecordStatus | null;
  /** "YYYY-MM-DD" from a date input, or an empty string for no lower bound. */
  dateFrom: string;
  /** "YYYY-MM-DD" from a date input, or an empty string for no upper bound. */
  dateTo: string;
}

export const emptyMedicalRecordFilters: MedicalRecordFilters = {
  search: '',
  horseId: null,
  recordType: null,
  status: null,
  dateFrom: '',
  dateTo: '',
};

export interface VaccinationFilters {
  horseId: string | null;
  status: VaccinationStatus | null;
}

export const emptyVaccinationFilters: VaccinationFilters = { horseId: null, status: null };

/** A horse as the filters see it: only what the option list needs. */
export interface HorseOption {
  id: string;
  name: string;
}

/**
 * The only contract the Medical UI depends on. Phase D ships a mock
 * implementation; a later phase swaps in an HTTP client against /api/v1 without
 * touching any component.
 */
export interface MedicalService {
  listRecords(): Promise<MedicalRecord[]>;
  getRecord(id: string): Promise<MedicalRecord>;
  getHorseHistory(horseId: string): Promise<HorseMedicalHistory>;
  listHorseHealth(): Promise<HorseHealth[]>;
  listVaccinations(scope?: { horseId?: string }): Promise<Vaccination[]>;
  listUpcomingEvents(scope?: { horseId?: string }): Promise<UpcomingMedicalEvent[]>;
  createRecord(horseId: string, input: MedicalRecordInput): Promise<MedicalRecord>;
  updateRecord(id: string, input: MedicalRecordInput): Promise<MedicalRecord>;
}

/** Failure the UI renders as an error state with "Try again". */
export class MedicalError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MedicalError';
  }
}

/** A record id that does not exist. Rendered as the not-found state, not an error. */
export class MedicalRecordNotFoundError extends MedicalError {
  constructor(id: string) {
    super(`No medical record with id "${id}".`);
    this.name = 'MedicalRecordNotFoundError';
  }
}

export function isMedicalRecordNotFound(error: unknown): boolean {
  return error instanceof MedicalRecordNotFoundError;
}
