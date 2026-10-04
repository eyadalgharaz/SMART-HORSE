import { mockDashboardService } from './mock/mock-dashboard-service';
import type { DashboardService } from './types';

/**
 * Single seam between the Dashboard UI and its data.
 *
 * Phase B: mock implementation in the browser.
 * Later:   `export const dashboardService: DashboardService = httpDashboardService;`
 *          backed by `GET /api/v1/dashboard`.
 *
 * Components must never import the mock directly.
 */
export const dashboardService: DashboardService = mockDashboardService;
