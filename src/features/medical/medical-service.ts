import { mockMedicalService } from './mock/mock-medical-service';
import type { MedicalService } from './types';

/**
 * Single seam between the Medical UI and its data.
 *
 * Phase D: mock implementation in the browser.
 * Later:   `export const medicalService: MedicalService = httpMedicalService;`
 *          backed by `/api/v1/medical`.
 *
 * Components must never import the mock directly.
 */
export const medicalService: MedicalService = mockMedicalService;
