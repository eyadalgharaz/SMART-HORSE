/**
 * Query keys for Settings, in one file so the hooks and mutations agree on
 * them without importing each other. Farm, Team, Roles and Account each sit
 * under their own root, since editing one never needs to invalidate another —
 * unlike Tasks and Notifications, nothing here raises events across domains.
 */
export const farmKeys = {
  root: ['settings', 'farm'] as const,
};

export const teamKeys = {
  root: ['settings', 'team'] as const,
  list: ['settings', 'team', 'list'] as const,
};

export const roleKeys = {
  root: ['settings', 'roles'] as const,
  list: ['settings', 'roles', 'list'] as const,
};

export const accountKeys = {
  root: ['settings', 'account'] as const,
  profile: ['settings', 'account', 'profile'] as const,
  preferences: ['settings', 'account', 'preferences'] as const,
};
