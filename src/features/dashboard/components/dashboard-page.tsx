'use client';

import { useAuth } from '@/features/auth/auth-provider';
import { firstNameOf } from '../format';
import { useDashboard } from '../use-dashboard';
import { DashboardContent } from './dashboard-content';
import { DashboardError } from './dashboard-error';
import { DashboardHeader } from './dashboard-header';
import { DashboardSkeleton } from './dashboard-skeleton';

/**
 * Container for the /dashboard route: fetches through the service seam and
 * chooses between loading, error and content. All display lives in the
 * presentational components, which only ever receive plain data.
 */
export function DashboardPage() {
  const { user } = useAuth();
  const query = useDashboard();

  return (
    <div className="space-y-6">
      <DashboardHeader
        firstName={firstNameOf(user?.fullName)}
        farmName={query.data?.farm.name ?? null}
        farmLoading={query.isPending}
        summary={
          query.data
            ? {
                upcomingVisits: query.data.summary.upcomingVisits.value,
                pendingTasks: query.data.summary.pendingTasks.value,
              }
            : null
        }
      />

      {query.isPending ? (
        <DashboardSkeleton />
      ) : query.isError ? (
        <DashboardError onRetry={() => void query.refetch()} retrying={query.isRefetching} />
      ) : (
        <DashboardContent data={query.data} />
      )}
    </div>
  );
}
