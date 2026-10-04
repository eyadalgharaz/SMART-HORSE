import { describe, expect, it } from 'vitest';
import {
  farmRoleDescriptions,
  farmRoleLabels,
  farmRoleOptions,
  farmRoleValues,
  hasAnyRole,
  hasRole,
  isFarmRole,
  type FarmRole,
} from '@/features/auth/roles';

describe('farm role vocabulary', () => {
  it('has exactly the five official roles, in order', () => {
    expect(farmRoleValues).toEqual(['FarmOwner', 'StableManager', 'Trainer', 'Worker', 'Doctor']);
  });

  it('gives every role a user-facing label, none of them the banned internal names', () => {
    const labels = Object.values(farmRoleLabels);
    expect(labels).toEqual(['Farm Owner', 'Stable Manager', 'Trainer', 'Worker', 'Doctor']);
    expect(labels.join(' ')).not.toMatch(/\bgroom\b/i);
    expect(labels.join(' ')).not.toMatch(/\bveterinarian\b/i);
  });

  it('gives every role a short description', () => {
    for (const role of farmRoleValues) {
      expect(farmRoleDescriptions[role]).toBeTruthy();
    }
  });

  it('builds options as {value, label} pairs matching the labels', () => {
    expect(farmRoleOptions).toEqual(
      farmRoleValues.map((value) => ({ value, label: farmRoleLabels[value] })),
    );
  });

  it('isFarmRole narrows valid values and rejects anything else', () => {
    expect(isFarmRole('Doctor')).toBe(true);
    expect(isFarmRole('Groom')).toBe(false);
    expect(isFarmRole('Veterinarian')).toBe(false);
    expect(isFarmRole('')).toBe(false);
    expect(isFarmRole(undefined)).toBe(false);
  });
});

describe('hasRole / hasAnyRole', () => {
  function user(farmRole: FarmRole | null) {
    return { farmRole };
  }

  it('hasRole matches only the exact role', () => {
    expect(hasRole(user('FarmOwner'), 'FarmOwner')).toBe(true);
    expect(hasRole(user('Trainer'), 'FarmOwner')).toBe(false);
    expect(hasRole(null, 'FarmOwner')).toBe(false);
    expect(hasRole(user(null), 'FarmOwner')).toBe(false);
  });

  it('hasAnyRole matches when the role is anywhere in the list', () => {
    expect(hasAnyRole(user('StableManager'), ['FarmOwner', 'StableManager'])).toBe(true);
    expect(hasAnyRole(user('Worker'), ['FarmOwner', 'StableManager'])).toBe(false);
    expect(hasAnyRole(null, ['FarmOwner'])).toBe(false);
    expect(hasAnyRole(user(null), ['FarmOwner'])).toBe(false);
  });
});
