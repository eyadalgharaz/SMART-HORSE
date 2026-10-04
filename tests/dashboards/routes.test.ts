import { describe, expect, it } from 'vitest';
import { farmRoleValues } from '@/features/auth/roles';
import { roleDashboardPath, roleDashboardSlugs } from '@/features/dashboards/routes';

describe('role dashboard routes', () => {
  it('resolves every valid role to the correct dashboard route', () => {
    expect(roleDashboardPath('FarmOwner')).toBe('/dashboard/farm-owner');
    expect(roleDashboardPath('StableManager')).toBe('/dashboard/stable-manager');
    expect(roleDashboardPath('Trainer')).toBe('/dashboard/trainer');
    expect(roleDashboardPath('Worker')).toBe('/dashboard/worker');
    expect(roleDashboardPath('Doctor')).toBe('/dashboard/doctor');
  });

  it('has exactly one route slug per official role — no drift, no duplicate role list', () => {
    // roleDashboardSlugs is keyed by FarmRole, so a missing/extra role would
    // already be a TypeScript error; this also proves it at runtime and
    // guards against the two lists silently diverging in the future.
    expect(Object.keys(roleDashboardSlugs).sort()).toEqual([...farmRoleValues].sort());
  });

  it('produces a unique route for every role', () => {
    const paths = farmRoleValues.map(roleDashboardPath);
    expect(new Set(paths).size).toBe(farmRoleValues.length);
  });
});
