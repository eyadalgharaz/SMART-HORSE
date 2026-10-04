import { HorseError, HorseNotFoundError, type Horse, type HorseInput } from '../types';
import type { HorseService } from '../types';
import { buildHorseMocks } from './horse-mock-data';

/**
 * Temporary, in-browser stand-in for `/api/v1/horses` so the Horses module can
 * be built and reviewed before the backend exists.
 *
 * Like the Phase A auth mock and the Phase B dashboard mock it is deliberately
 * thin: one in-memory array, no fake endpoints, no fake database. Adds and edits
 * change that array so the list and profile visibly update during review; the
 * array resets on reload, which is all a frontend review needs.
 *
 * Review switches (mock only — append to /horses):
 *   ?mock=error   the request fails         → error state
 *   ?mock=empty   a farm with no horses yet → empty state
 *   ?mock=slow    the request takes ~4 s    → loading skeleton
 */

const LATENCY_MS = 450;
const SLOW_LATENCY_MS = 4000;
const WRITE_LATENCY_MS = 600;

type Scenario = 'default' | 'error' | 'empty' | 'slow';

let horses: Horse[] | null = null;
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
 * stable. Switching scenario rebuilds it, which also discards anything added
 * during review — the same thing a reload would do.
 */
function store(): Horse[] {
  const scenario = currentScenario();
  const seedScenario = scenario === 'slow' || scenario === 'error' ? 'default' : scenario;
  if (horses === null || scenarioAtLoad !== seedScenario) {
    horses = seedScenario === 'empty' ? [] : buildHorseMocks();
    scenarioAtLoad = seedScenario;
  }
  return horses;
}

/** Test helper: forget anything added or edited during a spec. */
export function resetMockHorses(): void {
  horses = null;
  scenarioAtLoad = null;
}

function slug(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'horse'
  );
}

function uniqueId(name: string, existing: Horse[]): string {
  const base = slug(name);
  if (!existing.some((horse) => horse.id === base)) return base;
  let suffix = 2;
  while (existing.some((horse) => horse.id === `${base}-${suffix}`)) suffix += 1;
  return `${base}-${suffix}`;
}

function trimmedOrNull(value: string | null): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

/** Owners are free text in this phase; the Ownership module will own the real list. */
function ownerFrom(input: HorseInput, previous: Horse | null): Horse['owner'] {
  const name = trimmedOrNull(input.ownerName);
  if (!name) return null;
  if (previous?.owner && previous.owner.name === name) return previous.owner;
  return { id: `owner-${slug(name)}`, name };
}

function applyInput(input: HorseInput, previous: Horse | null): Omit<Horse, 'id'> {
  return {
    name: input.name.trim(),
    breed: input.breed.trim(),
    gender: input.gender,
    birthDate: input.birthDate,
    color: input.color.trim(),
    registrationNumber: trimmedOrNull(input.registrationNumber),
    microchipNumber: trimmedOrNull(input.microchipNumber),
    imageUrl: input.imageUrl,
    owner: ownerFrom(input, previous),
    status: input.status,
    updatedAt: new Date().toISOString(),
  };
}

async function guard(latency: number): Promise<void> {
  const scenario = currentScenario();
  await delay(scenario === 'slow' ? SLOW_LATENCY_MS : latency);
  if (scenario === 'error') throw new HorseError('The horse records could not be loaded.');
}

export const mockHorseService: HorseService = {
  async listHorses() {
    await guard(LATENCY_MS);
    return store().map((horse) => ({ ...horse }));
  },

  async getHorse(id) {
    await guard(LATENCY_MS);
    const horse = store().find((candidate) => candidate.id === id);
    if (!horse) throw new HorseNotFoundError(id);
    return { ...horse };
  },

  async createHorse(input) {
    await guard(WRITE_LATENCY_MS);
    const horses = store();
    const created: Horse = { id: uniqueId(input.name, horses), ...applyInput(input, null) };
    horses.unshift(created);
    return { ...created };
  },

  async updateHorse(id, input) {
    await guard(WRITE_LATENCY_MS);
    const horses = store();
    const index = horses.findIndex((candidate) => candidate.id === id);
    const previous = horses[index];
    if (index === -1 || !previous) throw new HorseNotFoundError(id);

    const updated: Horse = { id: previous.id, ...applyInput(input, previous) };
    horses[index] = updated;
    return { ...updated };
  },
};
