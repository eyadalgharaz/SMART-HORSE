/**
 * Single source of truth for the SmartHorse farm role model: the five
 * official roles, their user-facing labels and short descriptions, and
 * small helpers for role-aware UI.
 *
 * This mirrors the Identity module's vocabulary (Module Specifications v1.0
 * §6) and the farm roles owned by the Farms module (§7). Everywhere a role
 * is shown or checked — Auth, Settings, or a future module — imports from
 * here, so the five roles are only ever defined once.
 *
 * This is a frontend UX convenience only. It enforces nothing: `hasRole` and
 * `hasAnyRole` are for showing or hiding UI, never a security boundary. Real
 * authorization is the backend's job (Master Prompt v1.0 §4).
 */

export type FarmRole = 'FarmOwner' | 'StableManager' | 'Trainer' | 'Worker' | 'Doctor';

export const farmRoleValues: FarmRole[] = [
  'FarmOwner',
  'StableManager',
  'Trainer',
  'Worker',
  'Doctor',
];

export const farmRoleLabels: Record<FarmRole, string> = {
  FarmOwner: 'Farm Owner',
  StableManager: 'Stable Manager',
  Trainer: 'Trainer',
  Worker: 'Worker',
  Doctor: 'Doctor',
};

export const farmRoleDescriptions: Record<FarmRole, string> = {
  FarmOwner: 'Full access to every part of the farm, including team and settings.',
  StableManager: 'Runs day-to-day operations: horses, tasks, and the team roster.',
  Trainer: 'Plans and records training programs and sessions.',
  Worker: 'Handles day-to-day stable work: feeding, grooming and daily care tasks.',
  Doctor: "Manages horses' medical records and health history.",
};

export const farmRoleOptions = farmRoleValues.map((value) => ({
  value,
  label: farmRoleLabels[value],
}));

/** Narrows an unknown value (e.g. raw form data) to a valid `FarmRole`. */
export function isFarmRole(value: unknown): value is FarmRole {
  return typeof value === 'string' && (farmRoleValues as string[]).includes(value);
}

/** Minimal shape `hasRole`/`hasAnyRole` need — avoids importing `AuthenticatedUser` here. */
interface RoleBearer {
  farmRole: FarmRole | null;
}

/**
 * True when `user` has exactly this role. UX/visibility only — never use this
 * to gate anything that actually needs to be secure; the backend enforces that.
 */
export function hasRole(user: RoleBearer | null | undefined, role: FarmRole): boolean {
  return user?.farmRole === role;
}

/** True when `user`'s role is one of `roles`. UX/visibility only — see `hasRole`. */
export function hasAnyRole(user: RoleBearer | null | undefined, roles: FarmRole[]): boolean {
  return user?.farmRole != null && roles.includes(user.farmRole);
}
