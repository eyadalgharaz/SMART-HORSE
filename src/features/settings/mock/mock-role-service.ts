import { SettingsError, type Role, type RoleService } from '../types';
import { buildRoleMocks } from './role-mock-data';

/**
 * Temporary, in-browser stand-in for `/api/v1/roles` so Roles & Permissions
 * can be built and reviewed before the backend exists.
 *
 * The five roles are fixed (they are `FarmRole` from `features/auth/types.ts`),
 * so there is nothing to create, edit or delete here — this service only
 * reads. Member counts are not part of this data; they are derived from the
 * team list in `format.ts` so a count can never disagree with the roster.
 *
 * Review switches (mock only — append to /settings/roles):
 *   ?mock=error   the request fails      → error state
 *   ?mock=slow    the request takes ~4 s → loading skeleton
 *
 * `?mock=empty` has no effect here: the role list is fixed and is never empty.
 */

const LATENCY_MS = 350;
const SLOW_LATENCY_MS = 4000;

type Scenario = 'default' | 'error' | 'slow';

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function currentScenario(): Scenario {
  if (typeof window === 'undefined') return 'default';
  const value = new URLSearchParams(window.location.search).get('mock');
  return value === 'error' || value === 'slow' ? value : 'default';
}

async function guard(): Promise<void> {
  const scenario = currentScenario();
  await delay(scenario === 'slow' ? SLOW_LATENCY_MS : LATENCY_MS);
  if (scenario === 'error') throw new SettingsError('The roles could not be loaded.');
}

export const mockRoleService: RoleService = {
  async listRoles(): Promise<Role[]> {
    await guard();
    return buildRoleMocks();
  },
};
