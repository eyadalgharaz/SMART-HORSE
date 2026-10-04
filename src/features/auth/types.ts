/**
 * Auth types mirror the Identity module's vocabulary (Module Specifications v1.0 §6)
 * and the farm roles owned by the Farms module (§7). Nothing here is a business rule;
 * the backend remains the authority for identity and authorization.
 */

/** The five official roles, their labels/descriptions and role-check helpers live in `./roles`. */
import type { FarmRole } from './roles';
export type { FarmRole };

export interface AuthenticatedUser {
  id: string;
  fullName: string;
  email: string;
  /** Role within the currently selected farm, when the user belongs to one. */
  farmRole: FarmRole | null;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  fullName: string;
  email: string;
  password: string;
  /** Chosen on the registration form; belongs to the account from creation onward. */
  farmRole: FarmRole;
}

export interface ResetPasswordInput {
  token: string;
  password: string;
}

export interface Session {
  user: AuthenticatedUser;
}

/**
 * The only contract the UI is allowed to depend on. Phase A ships a mock
 * implementation; a later phase swaps in an HTTP client against /api/v1
 * without touching any component.
 */
export interface AuthService {
  login(input: LoginInput): Promise<Session>;
  register(input: RegisterInput): Promise<Session>;
  requestPasswordReset(email: string): Promise<void>;
  resetPassword(input: ResetPasswordInput): Promise<void>;
  logout(): Promise<void>;
  /** Restores a session on page load, or null when there is none. */
  getSession(): Promise<Session | null>;
}

/** Errors the UI is expected to render as a form-level message. */
export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthError';
  }
}
