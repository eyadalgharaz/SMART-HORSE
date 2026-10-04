import type { AuthenticatedUser } from '@/features/auth/types';

/**
 * The contract every role dashboard container is built against. It isn't
 * passed as props today — each role container calls `useAuth()` itself,
 * the same pattern the rest of the authenticated app already uses — but
 * writing it down here makes the assumption explicit instead of tribal
 * knowledge:
 *
 * - By the time a role dashboard renders, `useAuth().user` is guaranteed
 *   non-null. `RequireAuth` (Phase A, `app/(app)/layout.tsx`) already keeps
 *   signed-out visitors out of the whole `(app)` route group, and
 *   `/dashboard`'s role redirect (`DashboardRoleRedirect`) only ever sends a
 *   signed-in user to their own role's route.
 * - `user.farmRole` matches the role that owns the dashboard the developer
 *   is building — a Trainer's dashboard is only ever reached by a user whose
 *   `farmRole` is `'Trainer'`.
 * - This is a UX/routing guarantee, not a security one. Nothing here
 *   enforces access; the backend is the only real authority once it exists
 *   (see the Security note in the project README).
 */
export interface RoleDashboardContext {
  user: AuthenticatedUser;
}
