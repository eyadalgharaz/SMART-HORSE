import { DashboardPage } from '@/features/dashboard/components/dashboard-page';

/**
 * Stable Manager, like Farm Owner, starts from the existing farm-wide
 * overview (`features/dashboard`, Phase B) rather than a duplicate one.
 * See "Where each role lives" in `docs/ROLE_DASHBOARD_DEVELOPMENT.md`.
 */
export function StableManagerDashboard() {
  return <DashboardPage />;
}
