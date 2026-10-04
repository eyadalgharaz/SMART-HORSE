import { DashboardError, type DashboardService } from '../types';
import { buildDashboardMock, buildEmptyDashboardMock } from './dashboard-mock-data';

/**
 * Temporary, in-browser stand-in for `GET /api/v1/dashboard` so the Dashboard
 * can be built and reviewed before the backend exists.
 *
 * Like the Phase A auth mock it is deliberately thin: no fake endpoints, no
 * fake database. Deleting `mock/` and pointing `dashboardService` at an HTTP
 * client is the whole migration.
 *
 * Review switches (mock only — append to /dashboard):
 *   ?mock=error   the request fails            → error state
 *   ?mock=empty   a farm with no data yet      → empty states
 *   ?mock=slow    the request takes ~4 seconds → loading skeleton
 */

const LATENCY_MS = 700;
const SLOW_LATENCY_MS = 4000;

type Scenario = 'default' | 'error' | 'empty' | 'slow';

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function currentScenario(): Scenario {
  if (typeof window === 'undefined') return 'default';
  const value = new URLSearchParams(window.location.search).get('mock');
  return value === 'error' || value === 'empty' || value === 'slow' ? value : 'default';
}

export const mockDashboardService: DashboardService = {
  async getOverview() {
    const scenario = currentScenario();
    await delay(scenario === 'slow' ? SLOW_LATENCY_MS : LATENCY_MS);

    if (scenario === 'error') {
      throw new DashboardError('The dashboard data could not be loaded.');
    }
    return scenario === 'empty' ? buildEmptyDashboardMock() : buildDashboardMock();
  },
};
