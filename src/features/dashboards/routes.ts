import type { FarmRole } from '@/features/auth/roles';

/**
 * The one place that maps a `FarmRole` to its dashboard route. This is the
 * only file every role's routing depends on, and it is intentionally
 * finished as of this phase — adding a sixth role would touch it, but
 * building out an existing role's dashboard never does.
 *
 * `FarmRole` itself is NOT redefined here — it comes from
 * `features/auth/roles.ts`, the single source of truth for the role model.
 */
export const roleDashboardSlugs: Record<FarmRole, string> = {
  FarmOwner: 'farm-owner',
  StableManager: 'stable-manager',
  Trainer: 'trainer',
  Worker: 'worker',
  Doctor: 'doctor',
};

/** `/dashboard/<role-slug>` for the given role, e.g. `roleDashboardPath('Trainer') === '/dashboard/trainer'`. */
export function roleDashboardPath(role: FarmRole): string {
  return `/dashboard/${roleDashboardSlugs[role]}`;
}
