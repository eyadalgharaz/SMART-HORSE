import { DashboardPage } from '@/features/dashboard/components/dashboard-page';

/**
 * The Farm Owner's dashboard is the existing farm-wide overview
 * (`features/dashboard`, Phase B) — it already gives an owner everything
 * this role needs (horses, tasks, health, activity, notifications), so this
 * container consumes it rather than duplicating it. See "Where each role
 * lives" in `docs/ROLE_DASHBOARD_DEVELOPMENT.md` for why Farm Owner and
 * Stable Manager both start from this shared view.
 */
export function FarmOwnerDashboard() {
  return <DashboardPage />;
}
