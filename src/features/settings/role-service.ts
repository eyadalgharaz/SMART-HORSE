import { mockRoleService } from './mock/mock-role-service';
import type { RoleService } from './types';

/**
 * Single seam between the Roles & Permissions UI and its data.
 *
 * Phase G: mock implementation in the browser.
 * Later:   `export const roleService: RoleService = httpRoleService;`
 *          backed by `/api/v1/roles`.
 *
 * Components must never import the mock directly.
 */
export const roleService: RoleService = mockRoleService;
