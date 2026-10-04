import {
  farmRoleDescriptions,
  farmRoleLabels,
  farmRoleOptions,
  farmRoleValues,
  type FarmRole,
} from '@/features/auth/roles';

export type { FarmRole };

/**
 * One place for the words and controlled lists the Settings area uses.
 *
 * The farm role model is NOT defined here. `FarmRole` and its vocabulary
 * (labels, descriptions, the five values) live in `features/auth/roles.ts` —
 * it is the Identity/Farms role model the rest of the app authenticates
 * against and now also uses at registration, and Team Members and Roles &
 * Permissions both assign and describe those same five roles rather than
 * inventing a second hierarchy. This file re-exports that vocabulary so
 * existing Settings imports are unaffected, plus adds the controlled lists
 * that belong to Settings itself (farm type, team member status).
 */

/* ------------------------------------------------------------------ */
/* Farm role — re-exported from auth/roles, the single source of truth */
/* ------------------------------------------------------------------ */

export { farmRoleValues, farmRoleLabels, farmRoleDescriptions, farmRoleOptions };

export const farmTypeValues = [
  'boarding',
  'training',
  'breeding',
  'riding-school',
  'private',
  'mixed',
] as const;

export type FarmType = (typeof farmTypeValues)[number];

export const farmTypeLabels: Record<FarmType, string> = {
  boarding: 'Boarding stable',
  training: 'Training facility',
  breeding: 'Breeding farm',
  'riding-school': 'Riding school',
  private: 'Private farm',
  mixed: 'Mixed-use farm',
};

export const farmTypeOptions = farmTypeValues.map((value) => ({
  value,
  label: farmTypeLabels[value],
}));

/* ------------------------------------------------------------------ */
/* Team member status                                                   */
/* ------------------------------------------------------------------ */

export const teamMemberStatusValues = ['active', 'invited', 'suspended'] as const;

export type TeamMemberStatus = (typeof teamMemberStatusValues)[number];

type StatusTone = 'neutral' | 'pasture' | 'warning' | 'danger' | 'success';

export const teamMemberStatusPresentation: Record<
  TeamMemberStatus,
  { label: string; tone: StatusTone }
> = {
  active: { label: 'Active', tone: 'success' },
  invited: { label: 'Invited', tone: 'warning' },
  suspended: { label: 'Suspended', tone: 'danger' },
};

export const teamMemberStatusOptions = teamMemberStatusValues.map((value) => ({
  value,
  label: teamMemberStatusPresentation[value].label,
}));

/* ------------------------------------------------------------------ */
/* Preferences                                                          */
/* ------------------------------------------------------------------ */

export const dateFormatValues = ['dmy', 'mdy'] as const;
export type DateFormatPreference = (typeof dateFormatValues)[number];
export const dateFormatLabels: Record<DateFormatPreference, string> = {
  dmy: 'Day / Month / Year (18 Sep 2026)',
  mdy: 'Month / Day / Year (Sep 18, 2026)',
};

export const timeFormatValues = ['12h', '24h'] as const;
export type TimeFormatPreference = (typeof timeFormatValues)[number];
export const timeFormatLabels: Record<TimeFormatPreference, string> = {
  '12h': '12-hour (9:30 AM)',
  '24h': '24-hour (09:30)',
};

/* ------------------------------------------------------------------ */
/* Misc limits                                                          */
/* ------------------------------------------------------------------ */

export const MAX_FARM_NAME_LENGTH = 120;
export const MAX_DESCRIPTION_LENGTH = 600;
export const MAX_INVITE_MESSAGE_LENGTH = 400;
