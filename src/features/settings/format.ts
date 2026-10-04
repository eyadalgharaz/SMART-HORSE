import { formatRelativeTime } from '@/features/dashboard/format';
import { toDateInputValue } from '@/features/horses/format';
import type { Role, TeamMember, TeamMemberFilters } from './types';

/**
 * Display formatting, filtering and derived figures for Settings data. Pure
 * functions only, so every rule is testable without rendering anything.
 */

export { toDateInputValue };

/* ------------------------------------------------------------------ */
/* Dates                                                                */
/* ------------------------------------------------------------------ */

/** "18 Sep 2026" */
export function formatSettingsDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/** "3 hours ago" for a recent moment, otherwise "Never" for a member who has not signed in. */
export function formatLastActive(
  iso: string | null,
  reference: string = new Date().toISOString(),
): string {
  if (iso === null) return 'Never';
  return formatRelativeTime(iso, reference);
}

/* ------------------------------------------------------------------ */
/* Team member search and filters                                       */
/* ------------------------------------------------------------------ */

function matchesSearch(member: TeamMember, search: string): boolean {
  const term = search.trim().toLowerCase();
  if (!term) return true;
  return member.fullName.toLowerCase().includes(term) || member.email.toLowerCase().includes(term);
}

/**
 * Applies every active filter — they narrow the list together, never instead
 * of each other. When the API arrives this rule moves into the query string;
 * the hook keeps the same signature, so no component changes.
 */
export function filterTeamMembers(members: TeamMember[], filters: TeamMemberFilters): TeamMember[] {
  return members.filter(
    (member) =>
      matchesSearch(member, filters.search) &&
      (filters.role === null || member.role === filters.role) &&
      (filters.status === null || member.status === filters.status),
  );
}

export function hasActiveTeamFilters(filters: TeamMemberFilters): boolean {
  return Boolean(filters.search.trim() || filters.role !== null || filters.status !== null);
}

export function activeTeamFilterCount(filters: TeamMemberFilters): number {
  return [filters.role, filters.status].filter((value) => value !== null).length;
}

/** "8 members", "1 member", or "Showing 3 of 8 members" while filters are on. */
export function formatMemberCount(shown: number, total: number): string {
  const noun = total === 1 ? 'member' : 'members';
  return shown === total ? `${total} ${noun}` : `Showing ${shown} of ${total} ${noun}`;
}

/** Newest-invited/joined first. */
export function sortMembersNewestFirst(members: TeamMember[]): TeamMember[] {
  return [...members].sort(
    (a, b) => new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime(),
  );
}

/* ------------------------------------------------------------------ */
/* Roles                                                                */
/* ------------------------------------------------------------------ */

/**
 * How many team members currently hold each role, derived from the team
 * list rather than stored on the role — so it can never drift out of sync
 * with the people actually on the roster.
 */
export function countMembersByRole(roles: Role[], members: TeamMember[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const role of roles) counts[role.id] = 0;
  for (const member of members) {
    if (member.status !== 'suspended') counts[member.role] = (counts[member.role] ?? 0) + 1;
  }
  return counts;
}
