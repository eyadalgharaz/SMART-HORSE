import { farmRoleValues, type FarmRole } from '@/features/auth/roles';
import { useTranslations } from './locale-provider';

/**
 * Localized role labels/descriptions for the UI. `FarmRole` itself, and the
 * canonical English `farmRoleLabels`/`farmRoleDescriptions`/`farmRoleValues`,
 * are unchanged and still live in `features/auth/roles.ts` — this only reads
 * the active locale's wording for the same five identifiers, it does not
 * redefine or rename them.
 */
export function useRoleLabel(role: FarmRole): string {
  return useTranslations().roles[role].label;
}

export function useRoleDescription(role: FarmRole): string {
  return useTranslations().roles[role].description;
}

/** `{value, label}` pairs for the active locale, same shape as `farmRoleOptions`. */
export function useRoleOptions(): { value: FarmRole; label: string }[] {
  const t = useTranslations();
  return farmRoleValues.map((value) => ({ value, label: t.roles[value].label }));
}
