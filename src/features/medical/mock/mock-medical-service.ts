import {
  MedicalError,
  MedicalRecordNotFoundError,
  type HorseHealth,
  type MedicalRecord,
  type MedicalRecordInput,
  type MedicalService,
} from '../types';
import { sortRecordsNewestFirst } from '../format';
import { buildHorseMocks } from '@/features/horses/mock/horse-mock-data';
import { buildHealthMocks, buildMedicalMocks } from './medical-mock-data';
import { deriveUpcomingEvents, deriveVaccinations } from './derive';

/**
 * Temporary, in-browser stand-in for `/api/v1/medical` so the Health module can
 * be built and reviewed before the backend exists.
 *
 * Like the Phase A auth mock and the Phase B/C mocks it is deliberately thin:
 * in-memory arrays, no fake endpoints, no fake database. Adds and edits change
 * those arrays so the list, the timeline, the vaccination register and the
 * upcoming events visibly update during review; everything resets on reload,
 * which is all a frontend review needs.
 *
 * Vaccinations and upcoming events are derived from the records on every read
 * rather than stored, which is why saving a record immediately changes them.
 *
 * Review switches (mock only — append to /medical):
 *   ?mock=error   the request fails            → error state
 *   ?mock=empty   a farm with no medical data  → empty state
 *   ?mock=slow    the request takes ~4 s       → loading skeleton
 */

const LATENCY_MS = 450;
const SLOW_LATENCY_MS = 4000;
const WRITE_LATENCY_MS = 600;

type Scenario = 'default' | 'error' | 'empty' | 'slow';

interface Store {
  records: MedicalRecord[];
  health: HorseHealth[];
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
 * The store is created on first use for the scenario in force at that moment,
 * so `?mock=empty` starts from nothing while the default starts from the sample
 * history. Switching scenario rebuilds it, which also discards anything added
 * during review — the same thing a reload would do.
 */
function data(): Store {
  const scenario = currentScenario();
  const seed = scenario === 'slow' || scenario === 'error' ? 'default' : scenario;
  if (store === null || scenarioAtLoad !== seed) {
    store =
      seed === 'empty'
        ? { records: [], health: [] }
        : { records: buildMedicalMocks(), health: buildHealthMocks() };
    scenarioAtLoad = seed;
  }
  return store;
}

/** Test helper: forget anything added or edited during a spec. */
export function resetMockMedical(): void {
  store = null;
  scenarioAtLoad = null;
}

async function guard(latency: number): Promise<void> {
  const scenario = currentScenario();
  await delay(scenario === 'slow' ? SLOW_LATENCY_MS : latency);
  if (scenario === 'error') throw new MedicalError('The medical records could not be loaded.');
}

function clone(record: MedicalRecord): MedicalRecord {
  return {
    ...record,
    attachments: record.attachments.map((attachment) => ({ ...attachment })),
    vaccine: record.vaccine ? { ...record.vaccine } : null,
  };
}

function nextId(records: MedicalRecord[]): string {
  const highest = records.reduce((max, record) => {
    const match = /^mr-(\d+)$/.exec(record.id);
    return match ? Math.max(max, Number(match[1])) : max;
  }, 0);
  return `mr-${String(highest + 1).padStart(3, '0')}`;
}

/**
 * Horse names come from Horse Management, never from anything Medical invents:
 * the horse's existing records first, then the stable itself for a horse whose
 * first record this is. In production the server resolves the name (or the
 * client sends only `horseId` and the response carries it back).
 */
function horseNameFor(horseId: string, records: MedicalRecord[]): string {
  const fromHistory = records.find((record) => record.horseId === horseId)?.horseName;
  if (fromHistory) return fromHistory;
  return buildHorseMocks().find((horse) => horse.id === horseId)?.name ?? horseId;
}

function applyInput(
  input: MedicalRecordInput,
  base: Pick<MedicalRecord, 'id' | 'horseId' | 'horseName' | 'createdAt'>,
): MedicalRecord {
  return {
    ...base,
    recordType: input.recordType,
    date: input.date,
    title: input.title.trim(),
    diagnosis: input.diagnosis,
    treatment: input.treatment,
    medication: input.medication,
    veterinarian: input.veterinarian,
    status: input.status,
    notes: input.notes,
    attachments: input.attachments.map((attachment) => ({ ...attachment })),
    followUpDate: input.followUpDate,
    followUpNotes: input.followUpNotes,
    vaccine: input.vaccine ? { ...input.vaccine } : null,
  };
}

export const mockMedicalService: MedicalService = {
  async listRecords() {
    await guard(LATENCY_MS);
    return sortRecordsNewestFirst(data().records).map(clone);
  },

  async getRecord(id) {
    await guard(LATENCY_MS);
    const record = data().records.find((candidate) => candidate.id === id);
    if (!record) throw new MedicalRecordNotFoundError(id);
    return clone(record);
  },

  async getHorseHistory(horseId) {
    await guard(LATENCY_MS);
    const { records, health } = data();
    return {
      horseId,
      health: health.find((entry) => entry.horseId === horseId) ?? null,
      records: sortRecordsNewestFirst(records.filter((record) => record.horseId === horseId)).map(
        clone,
      ),
    };
  },

  async listHorseHealth() {
    await guard(LATENCY_MS);
    return data().health.map((entry) => ({ ...entry }));
  },

  async listVaccinations(scope) {
    await guard(LATENCY_MS);
    const vaccinations = deriveVaccinations(data().records);
    return scope?.horseId
      ? vaccinations.filter((vaccination) => vaccination.horseId === scope.horseId)
      : vaccinations;
  },

  async listUpcomingEvents(scope) {
    await guard(LATENCY_MS);
    const { records } = data();
    const events = deriveUpcomingEvents(records, deriveVaccinations(records));
    return scope?.horseId ? events.filter((event) => event.horseId === scope.horseId) : events;
  },

  async createRecord(horseId, input) {
    await guard(WRITE_LATENCY_MS);
    const current = data();
    const created = applyInput(input, {
      id: nextId(current.records),
      horseId,
      horseName: horseNameFor(horseId, current.records),
      createdAt: new Date().toISOString(),
    });
    current.records.unshift(created);
    return clone(created);
  },

  async updateRecord(id, input) {
    await guard(WRITE_LATENCY_MS);
    const current = data();
    const index = current.records.findIndex((candidate) => candidate.id === id);
    const previous = current.records[index];
    if (index === -1 || !previous) throw new MedicalRecordNotFoundError(id);

    const updated = applyInput(input, {
      id: previous.id,
      horseId: previous.horseId,
      horseName: previous.horseName,
      createdAt: previous.createdAt,
    });
    current.records[index] = updated;
    return clone(updated);
  },
};
