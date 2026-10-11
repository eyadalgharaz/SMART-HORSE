'use client';

import { Button } from '@/components/ui/button';
import { ErrorState } from '@/components/ui/error-state';
import { useTranslations } from '@/i18n';
import { useRoles } from '../hooks/use-roles';
import { RoleCard } from './role-card';
import { SettingsSectionLayout } from './settings-section-layout';
import { RolesSkeleton } from './settings-skeletons';

/**
 * Container for /settings/roles. The five roles are fixed — there is no
 * "create role" here, because the app does not support one. Each role's
 * member count is derived from the live team roster (`useRoles`), so it can
 * never disagree with who is actually assigned that role.
 */
export function RolesPage() {
  const { roles, memberCounts, isPending, isError, isRefetching, refetch } = useRoles();
  const t = useTranslations();
  const r = t.settings.roles;

  return (
    <SettingsSectionLayout title={t.settings.sections.roles.title} description={r.pageDescription}>
      <div className="space-y-4">
        {isError ? (
          <ErrorState
            title={r.loadErrorTitle}
            description={r.loadErrorDescription}
            action={
              <Button variant="secondary" onClick={() => refetch()} loading={isRefetching}>
                {t.common.tryAgain}
              </Button>
            }
          />
        ) : isPending ? (
          <RolesSkeleton />
        ) : (
          <>
            <p className="text-sm text-stone-600">{r.note}</p>
            <ul className="grid gap-4 sm:grid-cols-2">
              {roles.map((role) => (
                <li key={role.id}>
                  <RoleCard role={role} memberCount={memberCounts[role.id] ?? 0} />
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </SettingsSectionLayout>
  );
}
