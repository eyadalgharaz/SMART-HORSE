import type { Locale } from '../locale';
import { ar } from './ar';
import { en, type Dictionary } from './en';

export type { Dictionary };

export const dictionaries: Record<Locale, Dictionary> = { en, ar };

/**
 * The full dictionary for a locale, for pure (non-React) formatting code.
 * Components use `useTranslations()` / `useI18n()` instead.
 */
export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}
