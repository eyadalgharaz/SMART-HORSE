import type { Metadata } from 'next';
import { DashboardRoleRedirect } from '@/features/dashboards/components/dashboard-role-redirect';

export const metadata: Metadata = { title: 'Dashboard' };

/**
 * Role-aware entry point (Phase I). This route has no dashboard content of
 * its own — it detects the signed-in user's role and sends them on to
 * `/dashboard/<role>`. See `docs/ROLE_DASHBOARD_DEVELOPMENT.md`.
 */
export default function Page() {
  return <DashboardRoleRedirect />;
}
