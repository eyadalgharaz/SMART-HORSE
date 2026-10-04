'use client';

import { Button } from '@/components/ui/button';
import { ErrorState } from '@/components/ui/error-state';
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

  return (
    <SettingsSectionLayout
      title="Roles & Permissions"
      description="Review roles and the access associated with them."
    >
      <div className="space-y-4">
        {isError ? (
          <ErrorState
            title="We couldn't load roles"
            description="Something went wrong while loading roles. Check your connection and try again."
            action={
              <Button variant="secondary" onClick={() => refetch()} loading={isRefetching}>
                Try again
              </Button>
            }
          />
        ) : isPending ? (
          <RolesSkeleton />
        ) : (
          <>
            <p className="text-sm text-stone-600">
              Permissions are shown here for reference. Access is enforced by the backend, not by
              hiding these controls.
            </p>
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
