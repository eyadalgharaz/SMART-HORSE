import { describe, expect, it } from 'vitest';
import { en } from '@/i18n/dictionaries/en';
import { ar } from '@/i18n/dictionaries/ar';
import { farmRoleValues } from '@/features/auth/roles';

function keyPaths(value: unknown, prefix = ''): string[] {
  if (value === null || typeof value !== 'object') return [prefix];
  return Object.entries(value as Record<string, unknown>).flatMap(([key, v]) =>
    keyPaths(v, prefix ? `${prefix}.${key}` : key),
  );
}

describe('translation dictionaries', () => {
  it('ar has exactly the same key paths as en — no missing or extra translation keys', () => {
    expect(keyPaths(ar).sort()).toEqual(keyPaths(en).sort());
  });

  it('every string/function leaf in ar actually differs in type from a placeholder, i.e. is populated', () => {
    for (const path of keyPaths(ar)) {
      const value = path.split('.').reduce<unknown>((obj, key) => (obj as never)[key], ar);
      if (typeof value === 'string') expect(value.length).toBeGreaterThan(0);
    }
  });

  it('has a roles entry, matching farmRoleValues exactly, for both locales', () => {
    expect(Object.keys(en.roles).sort()).toEqual([...farmRoleValues].sort());
    expect(Object.keys(ar.roles).sort()).toEqual([...farmRoleValues].sort());
  });

  it('resolves nav labels for every configured nav key', () => {
    const navKeys: (keyof typeof en.shell.nav)[] = [
      'dashboard',
      'horses',
      'health',
      'training',
      'tasks',
      'notifications',
      'settings',
    ];
    for (const key of navKeys) {
      expect(en.shell.nav[key]).toBeTruthy();
      expect(ar.shell.nav[key]).toBeTruthy();
    }
  });
});
