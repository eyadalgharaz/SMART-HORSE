import { describe, expect, it } from 'vitest';
import { buildFarmMock } from '@/features/settings/mock/farm-mock-data';
import { buildTeamMemberMocks } from '@/features/settings/mock/team-mock-data';
import { buildRoleMocks } from '@/features/settings/mock/role-mock-data';
import { farmRoleValues } from '@/features/settings/vocabulary';

describe('buildFarmMock', () => {
  it('matches the farm id and name already embedded in the Dashboard mock', () => {
    const farm = buildFarmMock();
    expect(farm.id).toBe('farm-green-valley');
    expect(farm.name).toBe('Green Valley Farm');
  });

  it('has a name and a valid farm type', () => {
    const farm = buildFarmMock();
    expect(farm.name.trim()).not.toBe('');
    expect(farm.type).toBeTruthy();
  });
});

describe('buildTeamMemberMocks', () => {
  const members = buildTeamMemberMocks();

  it('produces a realistic, non-trivial roster with unique ids', () => {
    expect(members.length).toBeGreaterThanOrEqual(8);
    expect(new Set(members.map((m) => m.id)).size).toBe(members.length);
  });

  it('covers active, invited and suspended statuses', () => {
    expect(members.some((m) => m.status === 'active')).toBe(true);
    expect(members.some((m) => m.status === 'invited')).toBe(true);
    expect(members.some((m) => m.status === 'suspended')).toBe(true);
  });

  it('only uses roles from the existing FarmRole model', () => {
    for (const member of members) {
      expect(farmRoleValues).toContain(member.role);
    }
  });

  it('gives an invited member no last-active timestamp', () => {
    for (const member of members) {
      if (member.status === 'invited') expect(member.lastActiveAt).toBeNull();
    }
  });

  it('has unique, plausible email addresses', () => {
    const emails = members.map((m) => m.email.toLowerCase());
    expect(new Set(emails).size).toBe(emails.length);
    for (const email of emails) expect(email).toMatch(/^[^@]+@[^@]+\.[^@]+$/);
  });
});

describe('buildRoleMocks', () => {
  const roles = buildRoleMocks();

  it('defines exactly the five existing FarmRole values — no invented role hierarchy', () => {
    expect(roles.map((role) => role.id).sort()).toEqual([...farmRoleValues].sort());
  });

  it('gives every role a description and a full permission summary', () => {
    for (const role of roles) {
      expect(role.description.trim()).not.toBe('');
      expect(role.permissions.length).toBeGreaterThan(0);
    }
  });

  it('gives the Farm Owner full access everywhere', () => {
    const owner = roles.find((role) => role.id === 'FarmOwner')!;
    expect(owner.permissions.every((permission) => permission.access === 'Full')).toBe(true);
  });
});
