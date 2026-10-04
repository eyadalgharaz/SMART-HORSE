'use client';

import { useQuery } from '@tanstack/react-query';
import { dashboardService } from './dashboard-service';

export const dashboardQueryKey = ['dashboard', 'overview'] as const;

/**
 * Loads the dashboard snapshot through TanStack Query (wired in providers.tsx),
 * so loading, error and retry behaviour are the same for mock and real data.
 */
export function useDashboard() {
  return useQuery({
    queryKey: dashboardQueryKey,
    queryFn: () => dashboardService.getOverview(),
  });
}
