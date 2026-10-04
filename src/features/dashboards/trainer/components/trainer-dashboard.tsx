'use client';

import { EmptyState } from '@/components/ui/empty-state';
import { PageHeader } from '@/components/layout/page-header';
import { useAuth } from '@/features/auth/auth-provider';
import { useTranslations } from '@/i18n';

/**
 * Owned by the Trainer dashboard developer: everything under
 * `features/dashboards/trainer/` is this role's to build. This container is
 * a placeholder proving the routing works end to end — see
 * `docs/ROLE_DASHBOARD_DEVELOPMENT.md` before replacing it.
 *
 * Expected to consume the existing `features/training`, `features/horses`
 * and `features/tasks` seams rather than duplicating them.
 */
export function TrainerDashboard() {
  const { user } = useAuth();
  const t = useTranslations();

  return (
    <div>
      <PageHeader
        title={t.dashboards.trainerTitle}
        description={user ? t.dashboards.signedInAs(user.fullName) : undefined}
      />
      <EmptyState
        title={t.dashboards.readyForImplementation(t.roles.Trainer.label)}
        description={t.dashboards.placeholderNote}
      />
    </div>
  );
}
