import { mockAuthService } from './mock/mock-auth-service';
import type { AuthService } from './types';

/**
 * Single seam between the UI and identity.
 *
 * Phase A: mock implementation in the browser.
 * Later:   `export const authService: AuthService = httpAuthService;`
 *          backed by the versioned REST API at /api/v1.
 *
 * Components must never import the mock directly.
 */
export const authService: AuthService = mockAuthService;
