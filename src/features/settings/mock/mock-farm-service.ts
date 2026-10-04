import { SettingsError, type Farm, type FarmInput, type FarmService } from '../types';
import { buildFarmMock } from './farm-mock-data';

/**
 * Temporary, in-browser stand-in for `/api/v1/farm` so Farm Profile can be
 * built and reviewed before the backend exists.
 *
 * Deliberately thin: one in-memory object, no fake endpoints, no fake
 * database. Saving changes that object so the profile page and its summary
 * visibly update during review; everything resets on reload.
 *
 * Review switches (mock only — append to /settings/farm):
 *   ?mock=error   the request fails   → error state
 *   ?mock=slow    the request takes ~4 s → loading skeleton
 *
 * `?mock=empty` has no effect here: a farm workspace always has exactly one
 * farm, so there is no "no data" state for this page to show.
 */

const LATENCY_MS = 400;
const SLOW_LATENCY_MS = 4000;
const WRITE_LATENCY_MS = 500;

type Scenario = 'default' | 'error' | 'slow';

let store: Farm | null = null;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function currentScenario(): Scenario {
  if (typeof window === 'undefined') return 'default';
  const value = new URLSearchParams(window.location.search).get('mock');
  return value === 'error' || value === 'slow' ? value : 'default';
}

function data(): Farm {
  if (store === null) store = buildFarmMock();
  return store;
}

/** Test helper: forget any edit made during a spec. */
export function resetMockFarm(): void {
  store = null;
}

async function guard(latency: number): Promise<void> {
  const scenario = currentScenario();
  await delay(scenario === 'slow' ? SLOW_LATENCY_MS : latency);
  if (scenario === 'error') throw new SettingsError('The farm profile could not be loaded.');
}

export const mockFarmService: FarmService = {
  async getFarm() {
    await guard(LATENCY_MS);
    return { ...data() };
  },

  async updateFarm(input: FarmInput) {
    await guard(WRITE_LATENCY_MS);
    store = { ...data(), ...input };
    return { ...store };
  },
};
