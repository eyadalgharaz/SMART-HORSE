import type { Locale } from './locale';

/**
 * Locale-aware formatting shared by every feature module.
 *
 * English output is byte-for-byte what the modules produced before
 * localization (`en-GB` day-month-year dates, e.g. "18 Sep 2026"), so the
 * English interface is unchanged. Arabic uses Arabic month and weekday names
 * with the Latin numbering system (`ar-u-nu-latn`) — the same convention the
 * Dashboard already established, and the one most bilingual Arabic business
 * software uses so figures, times and IDs stay quick to scan.
 *
 * Pure functions only (no React), so `format.ts` files and their tests can
 * call them directly.
 */

/** BCP 47 tag `Intl` should use for a locale. `english` lets a caller keep its historical English tag. */
export function intlLocale(locale: Locale, english: string = 'en-GB'): string {
  return locale === 'ar' ? 'ar-u-nu-latn' : english;
}

/** "18 Sep 2026" / "18 سبتمبر 2026" */
export function formatDate(iso: string, locale: Locale = 'en'): string {
  return new Date(iso).toLocaleDateString(intlLocale(locale), {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/** "18 Sep" / "18 سبتمبر" — for rows grouped under a year heading. */
export function formatDayMonth(iso: string, locale: Locale = 'en'): string {
  return new Date(iso).toLocaleDateString(intlLocale(locale), { day: 'numeric', month: 'short' });
}

/** "9:30" / "9:30 ص" */
export function formatClockTime(iso: string, locale: Locale = 'en'): string {
  return new Date(iso).toLocaleTimeString(intlLocale(locale), {
    hour: 'numeric',
    minute: '2-digit',
  });
}

/** Fixed-decimal number. Latin digits in both languages, matching the rest of the app. */
export function formatDecimal(value: number, digits = 1): string {
  return value.toFixed(digits);
}

/* ------------------------------------------------------------------ */
/* Arabic counting                                                       */
/* ------------------------------------------------------------------ */

/**
 * The six Arabic plural forms. Each form is a template where `{n}` is
 * replaced with the number, because natural Arabic does not always show the
 * number: "سجل واحد" (one record), "سجلان" (two records), "3 سجلات",
 * "11 سجلًا", "100 سجل".
 */
export interface ArabicPluralForms {
  zero?: string;
  one: string;
  two: string;
  few: string;
  many: string;
  other: string;
}

const arabicRules = new Intl.PluralRules('ar');

/** Picks the correct Arabic plural form for `count` and fills in `{n}`. */
export function arabicPlural(count: number, forms: ArabicPluralForms): string {
  const category = arabicRules.select(count) as keyof ArabicPluralForms;
  const template =
    (category === 'zero' ? (forms.zero ?? forms.other) : forms[category]) ?? forms.other;
  return template.replace('{n}', String(count));
}

/** English singular/plural with `{n}`. */
export function englishPlural(count: number, one: string, other: string): string {
  return (count === 1 ? one : other).replace('{n}', String(count));
}

/**
 * Option lists (horses, trainers, assignees…) sorted by the label actually
 * shown, in the active language's collation — so an Arabic list reads
 * alphabetically in Arabic rather than in the order of the English names.
 */
export function sortByLabel<T>(
  items: readonly T[],
  label: (item: T) => string,
  locale: Locale,
): T[] {
  // English lists already arrive sorted by their English names.
  if (locale === 'en') return [...items];
  const collator = new Intl.Collator('ar');
  return [...items].sort((a, b) => collator.compare(label(a), label(b)));
}
