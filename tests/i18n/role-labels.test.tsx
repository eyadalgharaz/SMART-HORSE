import { describe, expect, it } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useLocale, useRoleLabel, useRoleOptions } from '@/i18n';
import { farmRoleValues, type FarmRole } from '@/features/auth/roles';
import { LocaleProvider } from '@/i18n';
import type { ReactNode } from 'react';

function wrapper({ children }: { children: ReactNode }) {
  return <LocaleProvider>{children}</LocaleProvider>;
}

function useProbe(role: FarmRole) {
  const locale = useLocale();
  const label = useRoleLabel(role);
  const options = useRoleOptions();
  return { locale, label, options };
}

describe('role label localization', () => {
  it('renders English role labels by default, matching the internal FarmRole identifiers exactly', () => {
    const { result } = renderHook(() => useProbe('StableManager'), { wrapper });
    expect(result.current.label).toBe('Stable Manager');
    // The identifier itself is untouched — still the internal FarmRole string.
    expect(farmRoleValues).toContain('StableManager');
  });

  it('switches the role label to Arabic when the locale changes, without changing FarmRole values', () => {
    const { result } = renderHook(() => useProbe('Doctor'), { wrapper });

    expect(result.current.label).toBe('Doctor');

    act(() => result.current.locale.setLocale('ar'));

    expect(result.current.label).toBe('الطبيب البيطري');
    // Internal identifiers are exactly the five original values, unchanged.
    expect(farmRoleValues).toEqual(['FarmOwner', 'StableManager', 'Trainer', 'Worker', 'Doctor']);
  });

  it('useRoleOptions returns one localized option per official role, keyed by the unchanged FarmRole value', () => {
    const { result } = renderHook(() => useProbe('Trainer'), { wrapper });
    expect(result.current.options.map((o) => o.value)).toEqual(farmRoleValues);
    expect(result.current.options.find((o) => o.value === 'Trainer')?.label).toBe('Trainer');

    act(() => result.current.locale.setLocale('ar'));

    expect(result.current.options.find((o) => o.value === 'Trainer')?.label).toBe('المدرب');
  });
});
