import { authService } from '@/features/auth/auth-service';
import {
  SettingsError,
  type AccountInput,
  type AccountPreferences,
  type AccountService,
  type ChangePasswordInput,
} from '../types';

/**
 * Temporary, in-browser stand-in for `/api/v1/account` so Account Settings
 * can be built and reviewed before the backend exists.
 *
 * Unlike Farm, Team and Roles, this service does not own its identity: a
 * person's name, email and farm role already live in the signed-in session
 * (`authService.getSession()`), and inventing a second, disconnected copy
 * here would let the Account page show a different name than the topbar —
 * exactly the kind of contradictory mock data the rest of the app avoids.
 * Only what the session does not track — phone number and preferences — is
 * genuinely new mock state.
 *
 * A profile edit is kept as a local override layered on top of the session
 * (`overrides.fullName`/`overrides.email`), so this service's own
 * `getAccount()` reflects a save immediately. Keeping the topbar and
 * Dashboard greeting in sync with that same edit is the calling page's job,
 * via `useAuth().updateUser(...)` — see `account-profile-form.tsx`.
 *
 * Review switches (mock only — append to /settings/account):
 *   ?mock=error   the request fails      → error state
 *   ?mock=slow    the request takes ~4 s → loading skeleton
 *
 * `?mock=empty` has no effect here: an account always exists once signed in.
 */

const LATENCY_MS = 350;
const SLOW_LATENCY_MS = 4000;
const WRITE_LATENCY_MS = 500;

type Scenario = 'default' | 'error' | 'slow';

interface Overrides {
  fullName: string | null;
  email: string | null;
  phone: string | null;
}

let overrides: Overrides = { fullName: null, email: null, phone: null };
let preferences: AccountPreferences = {
  emailNotifications: true,
  dateFormat: 'dmy',
  timeFormat: '12h',
};

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function currentScenario(): Scenario {
  if (typeof window === 'undefined') return 'default';
  const value = new URLSearchParams(window.location.search).get('mock');
  return value === 'error' || value === 'slow' ? value : 'default';
}

async function guard(latency: number): Promise<void> {
  const scenario = currentScenario();
  await delay(scenario === 'slow' ? SLOW_LATENCY_MS : latency);
  if (scenario === 'error') throw new SettingsError('The account could not be loaded.');
}

/** Test helper: forget any edit made during a spec. */
export function resetMockAccount(): void {
  overrides = { fullName: null, email: null, phone: null };
  preferences = { emailNotifications: true, dateFormat: 'dmy', timeFormat: '12h' };
}

export const mockAccountService: AccountService = {
  async getAccount() {
    await guard(LATENCY_MS);
    const session = await authService.getSession();
    if (!session) throw new SettingsError('No account is signed in.');
    return {
      id: session.user.id,
      fullName: overrides.fullName ?? session.user.fullName,
      email: overrides.email ?? session.user.email,
      phone: overrides.phone,
      farmRole: session.user.farmRole,
    };
  },

  async updateAccount(input: AccountInput) {
    await guard(WRITE_LATENCY_MS);
    overrides = { fullName: input.fullName, email: input.email, phone: input.phone };
    const session = await authService.getSession();
    return {
      id: session?.user.id ?? 'mock-user',
      fullName: input.fullName,
      email: input.email,
      phone: input.phone,
      farmRole: session?.user.farmRole ?? null,
    };
  },

  async changePassword(input: ChangePasswordInput) {
    await guard(WRITE_LATENCY_MS);
    // Mock only — nothing is logged, stored, or sent anywhere. A short
    // current-password check gives the "wrong password" state something to
    // show during review; a real check happens on the backend.
    if (input.currentPassword.length < 8) {
      throw new SettingsError('Your current password is incorrect.');
    }
  },

  async getPreferences() {
    await guard(LATENCY_MS);
    return { ...preferences };
  },

  async updatePreferences(input: AccountPreferences) {
    await guard(WRITE_LATENCY_MS);
    preferences = { ...input };
    return { ...preferences };
  },
};
