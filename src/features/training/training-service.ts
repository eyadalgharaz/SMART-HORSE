import { mockTrainingService } from './mock/mock-training-service';
import type { TrainingService } from './types';

/**
 * Single seam between the Training UI and its data.
 *
 * Phase E: mock implementation in the browser.
 * Later:   `export const trainingService: TrainingService = httpTrainingService;`
 *          backed by `/api/v1/training`.
 *
 * Components must never import the mock directly.
 */
export const trainingService: TrainingService = mockTrainingService;
