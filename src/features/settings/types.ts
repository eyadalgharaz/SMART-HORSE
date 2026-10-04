import type { FarmRole } from '@/features/auth/types';
import type {
  DateFormatPreference,
  FarmType,
  TeamMemberStatus,
  TimeFormatPreference,
} from './vocabulary';

export type { FarmRole, FarmType, TeamMemberStatus };

/**
 * Settings read and write models, shaped for a future `/api/v1` the same way
 * every other module's types are: dates are ISO 8601 strings, the UI does all
 * display formatting, and optional information is `null` rather than absent.
 *
 * Four small domains share this file rather than four separate ones, because
 * Settings is one area a person visits for one reason — managing this
 * farm — even though Farm Profile, Team, Roles and Account are read and
 * written independently underneath.
 */

/* ------------------------------------------------------------------ */
/* Farm                                                                  */
/* ------------------------------------------------------------------ */

export interface Farm {
  id: string;
  name: string;
  type: FarmType;
  description: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  createdAt: string;
}

/** Everything the Farm Profile form can set. */
export interface FarmInput {
  name: string;
  type: FarmType;
  description: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
}

export interface FarmService {
  getFarm(): Promise<Farm>;
  updateFarm(input: FarmInput): Promise<Farm>;
}

/* ------------------------------------------------------------------ */
/* Team                                                                  */
/* ------------------------------------------------------------------ */

export interface TeamMember {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  role: FarmRole;
  status: TeamMemberStatus;
  /** ISO 8601 date the invitation was sent, or the member joined. */
  joinedAt: string;
  /** Null for an invited member who has never signed in. */
  lastActiveAt: string | null;
}

/** What Invite Member submits. */
export interface InviteTeamMemberInput {
  fullName: string;
  email: string;
  role: FarmRole;
  message: string | null;
}

/** What the team list filters on. Empty string and null both mean "any". */
export interface TeamMemberFilters {
  search: string;
  role: FarmRole | null;
  status: TeamMemberStatus | null;
}

export const emptyTeamMemberFilters: TeamMemberFilters = {
  search: '',
  role: null,
  status: null,
};

export interface TeamService {
  listMembers(): Promise<TeamMember[]>;
  inviteMember(input: InviteTeamMemberInput): Promise<TeamMember>;
  updateMemberRole(id: string, role: FarmRole): Promise<TeamMember>;
  setMemberStatus(id: string, status: TeamMemberStatus): Promise<TeamMember>;
  removeMember(id: string): Promise<void>;
}

/* ------------------------------------------------------------------ */
/* Roles & permissions                                                  */
/* ------------------------------------------------------------------ */

/** One module's access level under a role, for the permission summary. */
export interface RolePermission {
  area: string;
  access: 'Full' | 'Manage' | 'View only' | 'None';
}

export interface Role {
  id: FarmRole;
  name: string;
  description: string;
  permissions: RolePermission[];
}

export interface RoleService {
  listRoles(): Promise<Role[]>;
}

/* ------------------------------------------------------------------ */
/* Account                                                              */
/* ------------------------------------------------------------------ */

export interface Account {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  farmRole: FarmRole | null;
}

export interface AccountInput {
  fullName: string;
  email: string;
  phone: string | null;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export interface AccountPreferences {
  emailNotifications: boolean;
  dateFormat: DateFormatPreference;
  timeFormat: TimeFormatPreference;
}

export interface AccountService {
  getAccount(): Promise<Account>;
  updateAccount(input: AccountInput): Promise<Account>;
  changePassword(input: ChangePasswordInput): Promise<void>;
  getPreferences(): Promise<AccountPreferences>;
  updatePreferences(input: AccountPreferences): Promise<AccountPreferences>;
}

/* ------------------------------------------------------------------ */
/* Shared failure type                                                  */
/* ------------------------------------------------------------------ */

/** Failure the UI renders as an error state with "Try again". */
export class SettingsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SettingsError';
  }
}
