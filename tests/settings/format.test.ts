import { describe, expect, it } from 'vitest';
import {
  activeTeamFilterCount,
  countMembersByRole,
  filterTeamMembers,
  formatLastActive,
  formatMemberCount,
  hasActiveTeamFilters,
  sortMembersNewestFirst,
} from '@/features/settings/format';
import { emptyTeamMemberFilters, type Role, type TeamMember } from '@/features/settings/types';

function member(overrides: Partial<TeamMember> = {}): TeamMember {
  return {
    id: 'team-x',
    fullName: 'Sample Person',
    email: 'sample@example.com',
    phone: null,
    role: 'Worker',
    status: 'active',
    joinedAt: new Date(2026, 0, 1).toISOString(),
    lastActiveAt: null,
    ...overrides,
  };
}

function role(overrides: Partial<Role> = {}): Role {
  return { id: 'Worker', name: 'Worker', description: 'desc', permissions: [], ...overrides };
}

describe('filterTeamMembers', () => {
  const members = [
    member({
      id: 'a',
      fullName: 'Farida El-Sayed',
      email: 'farida@x.com',
      role: 'Trainer',
      status: 'active',
    }),
    member({
      id: 'b',
      fullName: 'Omar Khalil',
      email: 'omar@x.com',
      role: 'Trainer',
      status: 'invited',
    }),
    member({
      id: 'c',
      fullName: 'Salma Youssef',
      email: 'salma@x.com',
      role: 'Doctor',
      status: 'suspended',
    }),
  ];

  it('matches search across name and email', () => {
    expect(
      filterTeamMembers(members, { ...emptyTeamMemberFilters, search: 'farida' }).map((m) => m.id),
    ).toEqual(['a']);
    expect(
      filterTeamMembers(members, { ...emptyTeamMemberFilters, search: 'salma@x.com' }).map(
        (m) => m.id,
      ),
    ).toEqual(['c']);
  });

  it('filters by role and status independently', () => {
    expect(
      filterTeamMembers(members, { ...emptyTeamMemberFilters, role: 'Trainer' })
        .map((m) => m.id)
        .sort(),
    ).toEqual(['a', 'b']);
    expect(
      filterTeamMembers(members, { ...emptyTeamMemberFilters, status: 'suspended' }).map(
        (m) => m.id,
      ),
    ).toEqual(['c']);
  });

  it('combines filters together, not instead of each other', () => {
    const result = filterTeamMembers(members, {
      ...emptyTeamMemberFilters,
      role: 'Trainer',
      status: 'invited',
    });
    expect(result.map((m) => m.id)).toEqual(['b']);
  });

  it('reports active filters and counts them', () => {
    expect(hasActiveTeamFilters(emptyTeamMemberFilters)).toBe(false);
    const active = {
      ...emptyTeamMemberFilters,
      role: 'Trainer' as const,
      status: 'active' as const,
    };
    expect(hasActiveTeamFilters(active)).toBe(true);
    expect(activeTeamFilterCount(active)).toBe(2);
  });
});

describe('formatMemberCount', () => {
  it('formats a plain or narrowed count', () => {
    expect(formatMemberCount(8, 8)).toBe('8 members');
    expect(formatMemberCount(1, 1)).toBe('1 member');
    expect(formatMemberCount(2, 8)).toBe('Showing 2 of 8 members');
  });
});

describe('sortMembersNewestFirst', () => {
  it('sorts by joinedAt descending', () => {
    const members = [
      member({ id: 'old', joinedAt: new Date(2025, 0, 1).toISOString() }),
      member({ id: 'new', joinedAt: new Date(2026, 5, 1).toISOString() }),
    ];
    expect(sortMembersNewestFirst(members).map((m) => m.id)).toEqual(['new', 'old']);
  });
});

describe('formatLastActive', () => {
  it('reports "Never" for a null lastActiveAt', () => {
    expect(formatLastActive(null)).toBe('Never');
  });

  it('formats a real timestamp relative to a reference time', () => {
    const reference = new Date(2026, 8, 20, 12).toISOString();
    const threeHoursAgo = new Date(2026, 8, 20, 9).toISOString();
    expect(formatLastActive(threeHoursAgo, reference)).toBe('3 hours ago');
  });
});

describe('countMembersByRole', () => {
  it('counts active members per role and excludes suspended members', () => {
    const roles = [
      role({ id: 'Trainer', name: 'Trainer' }),
      role({ id: 'Worker', name: 'Worker' }),
    ];
    const members = [
      member({ id: 'a', role: 'Trainer', status: 'active' }),
      member({ id: 'b', role: 'Trainer', status: 'invited' }),
      member({ id: 'c', role: 'Trainer', status: 'suspended' }),
      member({ id: 'd', role: 'Worker', status: 'active' }),
    ];
    const counts = countMembersByRole(roles, members);
    expect(counts['Trainer']).toBe(2); // a (active) + b (invited); c is suspended and excluded
    expect(counts['Worker']).toBe(1);
  });

  it('reports zero for a role nobody currently holds', () => {
    const roles = [role({ id: 'Doctor', name: 'Doctor' })];
    expect(countMembersByRole(roles, []).Doctor).toBe(0);
  });
});
