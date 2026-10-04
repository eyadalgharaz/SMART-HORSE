import { AuthError, type AuthService, type Session } from '../types';
import type { FarmRole } from '../roles';

/**
 * Temporary, in-browser stand-in for the Identity API so the UI can be built
 * and reviewed before Phase 1 of the backend exists.
 *
 * It is deliberately thin: no fake endpoints, no fake database, no token
 * handling, no real password storage. Deleting this file and pointing
 * `authService` at an HTTP client is the whole migration.
 *
 * A small mock "account directory" (`ACCOUNTS_KEY`) is kept alongside the
 * session so a role chosen at registration is still there the next time that
 * same email signs in — without it, logging out and back in would forget the
 * account's role, which defeats the point of asking for one. This is a mock
 * convenience only: any email/password pair not already in the directory can
 * still sign in as a lightweight, unregistered demo account (see `login`
 * below), exactly like before this phase.
 */

const SESSION_KEY = 'smarthorse.mock-session';
const ACCOUNTS_KEY = 'smarthorse.mock-accounts';
const LATENCY_MS = 600;

interface MockAccount {
  id: string;
  fullName: string;
  email: string;
  farmRole: FarmRole;
}

function delay(ms = LATENCY_MS): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function persistSession(session: Session | null): void {
  if (typeof window === 'undefined') return;
  if (session) window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  else window.localStorage.removeItem(SESSION_KEY);
}

function loadAccounts(): MockAccount[] {
  if (typeof window === 'undefined') return [];
  const raw = window.localStorage.getItem(ACCOUNTS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as MockAccount[];
  } catch {
    return [];
  }
}

function saveAccount(account: MockAccount): void {
  if (typeof window === 'undefined') return;
  const accounts = loadAccounts().filter(
    (existing) => existing.email.toLowerCase() !== account.email.toLowerCase(),
  );
  accounts.push(account);
  window.localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

function findAccount(email: string): MockAccount | null {
  return loadAccounts().find((a) => a.email.toLowerCase() === email.toLowerCase()) ?? null;
}

function makeSession(account: MockAccount): Session {
  return { user: { ...account } };
}

function nameFromEmail(email: string): string {
  const local = email.split('@')[0] ?? 'user';
  return local
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export const mockAuthService: AuthService = {
  async login({ email, password }) {
    await delay();
    // One reserved address so the error state can be reviewed without a backend.
    if (email.toLowerCase() === 'locked@smarthorse.test') {
      throw new AuthError('That account is locked. Ask your farm owner to restore access.');
    }
    if (password.length < 8) {
      throw new AuthError('Email or password is incorrect.');
    }
    // A previously registered account keeps its own name and role. Any other
    // email/password is accepted as a lightweight demo sign-in, unchanged
    // from before this phase, defaulting to Farm Owner.
    const existing = findAccount(email);
    const account: MockAccount = existing ?? {
      id: email.toLowerCase(),
      fullName: nameFromEmail(email),
      email,
      farmRole: 'FarmOwner',
    };
    const session = makeSession(account);
    persistSession(session);
    return session;
  },

  async register({ fullName, email, farmRole }) {
    await delay();
    if (email.toLowerCase() === 'taken@smarthorse.test' || findAccount(email)) {
      throw new AuthError('An account already uses this email address.');
    }
    const account: MockAccount = { id: email.toLowerCase(), fullName, email, farmRole };
    saveAccount(account);
    const session = makeSession(account);
    persistSession(session);
    return session;
  },

  async requestPasswordReset(email) {
    await delay();
    // Never reveal whether an address exists (Module Specifications v1.0 §6).
    void email;
  },

  async resetPassword({ token }) {
    await delay();
    if (token === 'expired') {
      throw new AuthError('This reset link has expired. Request a new one.');
    }
  },

  async logout() {
    persistSession(null);
  },

  async getSession() {
    if (typeof window === 'undefined') return null;
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as Session;
    } catch {
      persistSession(null);
      return null;
    }
  },
};
