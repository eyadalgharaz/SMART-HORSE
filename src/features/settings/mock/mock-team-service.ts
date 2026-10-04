import {
  SettingsError,
  type InviteTeamMemberInput,
  type TeamMember,
  type TeamMemberStatus,
  type TeamService,
} from '../types';
import { buildTeamMemberMocks } from './team-mock-data';

/**
 * Temporary, in-browser stand-in for `/api/v1/team` so Team Members can be
 * built and reviewed before the backend exists.
 *
 * Deliberately thin: an in-memory array, no fake endpoints, no fake
 * database. Inviting, changing a role, suspending/reactivating and removing
 * all mutate that array so the list and its counts visibly update during
 * review; everything resets on reload.
 *
 * Review switches (mock only — append to /settings/team):
 *   ?mock=error   the request fails            → error state
 *   ?mock=empty   a farm with no team yet      → empty state
 *   ?mock=slow    the request takes ~4 s       → loading skeleton
 */

const LATENCY_MS = 450;
const SLOW_LATENCY_MS = 4000;
const WRITE_LATENCY_MS = 500;

type Scenario = 'default' | 'error' | 'empty' | 'slow';

let store: TeamMember[] | null = null;
let scenarioAtLoad: Scenario | null = null;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function currentScenario(): Scenario {
  if (typeof window === 'undefined') return 'default';
  const value = new URLSearchParams(window.location.search).get('mock');
  return value === 'error' || value === 'empty' || value === 'slow' ? value : 'default';
}

function data(): TeamMember[] {
  const scenario = currentScenario();
  const seed = scenario === 'slow' || scenario === 'error' ? 'default' : scenario;
  if (store === null || scenarioAtLoad !== seed) {
    store = seed === 'empty' ? [] : buildTeamMemberMocks();
    scenarioAtLoad = seed;
  }
  return store;
}

/** Test helper: forget any invite, edit or removal made during a spec. */
export function resetMockTeam(): void {
  store = null;
  scenarioAtLoad = null;
}

async function guard(latency: number): Promise<void> {
  const scenario = currentScenario();
  await delay(scenario === 'slow' ? SLOW_LATENCY_MS : latency);
  if (scenario === 'error') throw new SettingsError('The team could not be loaded.');
}

function nextId(members: TeamMember[]): string {
  const highest = members.reduce((max, member) => {
    const match = /^team-invite-(\d+)$/.exec(member.id);
    return match ? Math.max(max, Number(match[1])) : max;
  }, 0);
  return `team-invite-${highest + 1}`;
}

export const mockTeamService: TeamService = {
  async listMembers() {
    await guard(LATENCY_MS);
    return data().map((member) => ({ ...member }));
  },

  async inviteMember(input: InviteTeamMemberInput) {
    await guard(WRITE_LATENCY_MS);
    const current = data();
    const created: TeamMember = {
      id: nextId(current),
      fullName: input.fullName.trim(),
      email: input.email.trim(),
      phone: null,
      role: input.role,
      status: 'invited',
      joinedAt: new Date().toISOString(),
      lastActiveAt: null,
    };
    current.unshift(created);
    return { ...created };
  },

  async updateMemberRole(id, role) {
    await guard(WRITE_LATENCY_MS);
    const current = data();
    const index = current.findIndex((member) => member.id === id);
    if (index === -1) throw new SettingsError(`No team member with id "${id}".`);
    current[index] = { ...current[index]!, role };
    return { ...current[index] };
  },

  async setMemberStatus(id, status: TeamMemberStatus) {
    await guard(WRITE_LATENCY_MS);
    const current = data();
    const index = current.findIndex((member) => member.id === id);
    if (index === -1) throw new SettingsError(`No team member with id "${id}".`);
    current[index] = { ...current[index]!, status };
    return { ...current[index] };
  },

  async removeMember(id) {
    await guard(WRITE_LATENCY_MS);
    const current = data();
    const index = current.findIndex((member) => member.id === id);
    if (index === -1) throw new SettingsError(`No team member with id "${id}".`);
    current.splice(index, 1);
  },
};
