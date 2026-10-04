import { mockFarmService } from './mock/mock-farm-service';
import type { FarmService } from './types';

/**
 * Single seam between the Farm Profile UI and its data.
 *
 * Phase G: mock implementation in the browser.
 * Later:   `export const farmService: FarmService = httpFarmService;`
 *          backed by `/api/v1/farm`.
 *
 * Components must never import the mock directly.
 */
export const farmService: FarmService = mockFarmService;
