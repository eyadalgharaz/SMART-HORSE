import { mockHorseService } from './mock/mock-horse-service';
import type { HorseService } from './types';

/**
 * Single seam between the Horses UI and its data.
 *
 * Phase C: mock implementation in the browser.
 * Later:   `export const horseService: HorseService = httpHorseService;`
 *          backed by `/api/v1/horses`.
 *
 * Components must never import the mock directly.
 */
export const horseService: HorseService = mockHorseService;
