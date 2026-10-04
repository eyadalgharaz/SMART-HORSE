import type { Role } from '../types';
import { farmRoleDescriptions, farmRoleLabels, farmRoleValues } from '../vocabulary';

/**
 * The permission summary shown on `/settings/roles`.
 *
 * The five roles themselves are not defined here — they are `FarmRole` from
 * `features/auth/roles.ts`, the Identity/Farms role model the rest of the
 * app already authenticates against. This file only describes, for each of
 * those five existing roles, what it can do in each area of the product —
 * informational for now, since the frontend cannot enforce access; the
 * backend is the real authority.
 *
 * This file is fake/illustrative data only — nothing here implies a backend
 * exists, and nothing here is enforced anywhere in the app.
 */

const AREAS = [
  'Horses',
  'Medical',
  'Training',
  'Tasks',
  'Notifications',
  'Farm',
  'Team',
  'Settings',
] as const;

type Access = Role['permissions'][number]['access'];

const MATRIX: Record<(typeof farmRoleValues)[number], Access[]> = {
  // Horses, Medical, Training, Tasks, Notifications, Farm, Team, Settings
  FarmOwner: ['Full', 'Full', 'Full', 'Full', 'Full', 'Full', 'Full', 'Full'],
  StableManager: [
    'Manage',
    'Manage',
    'Manage',
    'Manage',
    'Full',
    'View only',
    'Manage',
    'View only',
  ],
  Trainer: ['View only', 'View only', 'Manage', 'Manage', 'Full', 'None', 'None', 'None'],
  Worker: ['View only', 'View only', 'View only', 'Manage', 'Full', 'None', 'None', 'None'],
  Doctor: ['View only', 'Manage', 'View only', 'Manage', 'Full', 'None', 'None', 'None'],
};

export function buildRoleMocks(): Role[] {
  return farmRoleValues.map((role) => ({
    id: role,
    name: farmRoleLabels[role],
    description: farmRoleDescriptions[role],
    permissions: AREAS.map((area, index) => ({ area, access: MATRIX[role][index]! })),
  }));
}
