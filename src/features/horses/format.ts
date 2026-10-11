import { getDictionary } from '@/i18n/dictionaries';
import { formatDate } from '@/i18n/format';
import type { Locale } from '@/i18n/locale';
import type { Horse, HorseFilters } from './types';
import { genderLabels } from './vocabulary';

/**
 * Display formatting and list filtering for horse data. Pure functions only, so
 * every label and every filter rule is testable without rendering anything.
 *
 * Age is always derived from the birth date rather than stored, so a record can
 * never disagree with itself.
 */

/** Whole years lived at `reference`, counting an unreached birthday as not yet. */
export function ageInYears(birthDateIso: string, reference: Date = new Date()): number {
  const birth = new Date(birthDateIso);
  let age = reference.getFullYear() - birth.getFullYear();
  const monthDelta = reference.getMonth() - birth.getMonth();
  if (monthDelta < 0 || (monthDelta === 0 && reference.getDate() < birth.getDate())) age -= 1;
  return Math.max(age, 0);
}

/** "7 years", "1 year", and months for a foal in its first year ("7 سنوات" in Arabic). */
export function formatAge(
  birthDateIso: string,
  reference: Date = new Date(),
  locale: Locale = 'en',
): string {
  const age = getDictionary(locale).horses.age;
  const years = ageInYears(birthDateIso, reference);
  if (years >= 1) return age.years(years);

  const birth = new Date(birthDateIso);
  const months = Math.max(
    (reference.getFullYear() - birth.getFullYear()) * 12 +
      (reference.getMonth() - birth.getMonth()) -
      (reference.getDate() < birth.getDate() ? 1 : 0),
    0,
  );
  return age.months(months);
}

/** "14 Mar 2019" ("14 مارس 2019" in Arabic) */
export function formatBirthDate(birthDateIso: string, locale: Locale = 'en'): string {
  return formatDate(birthDateIso, locale);
}

/** Value of a date input ("2019-03-14") for an ISO date-time. */
export function toDateInputValue(iso: string): string {
  const date = new Date(iso);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

/** Start of the given calendar day, in the viewer's own time zone. */
export function fromDateInputValue(value: string): string {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year ?? 0, (month ?? 1) - 1, day ?? 1).toISOString();
}

export function formatGender(horse: Pick<Horse, 'gender'>, locale: Locale = 'en'): string {
  return locale === 'en'
    ? genderLabels[horse.gender]
    : getDictionary(locale).horses.genderLabels[horse.gender];
}

/** "Mare · 7 years" — the one-line identity summary used in headers and cards. */
export function formatIdentityLine(horse: Horse, reference?: Date, locale: Locale = 'en'): string {
  return `${formatGender(horse, locale)} · ${formatAge(horse.birthDate, reference, locale)}`;
}

/** Breeds present in the current data, alphabetical — the filter's option list. */
export function breedsOf(horses: Horse[]): string[] {
  return [...new Set(horses.map((horse) => horse.breed))].sort((a, b) => a.localeCompare(b));
}

/**
 * Matches a search term against a record's text fields. `localize`, when
 * given, also matches each field's displayed translation — so a search typed
 * in Arabic finds "ليلى" just as a search in English finds "Luna".
 */
export function matchesAnyField(
  fields: (string | null | undefined)[],
  search: string,
  localize?: (text: string) => string,
): boolean {
  const term = search.trim().toLowerCase();
  if (!term) return true;
  return fields.some((field) => {
    if (!field) return false;
    if (field.toLowerCase().includes(term)) return true;
    return localize ? localize(field).toLowerCase().includes(term) : false;
  });
}

function matchesSearch(horse: Horse, search: string, localize?: (text: string) => string): boolean {
  return matchesAnyField(
    [
      horse.name,
      horse.breed,
      horse.color,
      horse.registrationNumber,
      horse.microchipNumber,
      horse.owner?.name,
    ],
    search,
    localize,
  );
}

/**
 * Applies every active filter — they narrow the list together, never instead of
 * each other. When the API arrives this rule moves into the query string; the
 * hook keeps the same signature, so no component changes.
 */
export function filterHorses(
  horses: Horse[],
  filters: HorseFilters,
  localize?: (text: string) => string,
): Horse[] {
  return horses.filter(
    (horse) =>
      matchesSearch(horse, filters.search, localize) &&
      (filters.breed === null || horse.breed === filters.breed) &&
      (filters.gender === null || horse.gender === filters.gender) &&
      (filters.status === null || horse.status === filters.status),
  );
}

export function hasActiveFilters(filters: HorseFilters): boolean {
  return Boolean(
    filters.search.trim() || filters.breed !== null || filters.gender || filters.status,
  );
}

/** "42 horses", "1 horse", or "Showing 8 of 42 horses" while filters are on. */
export function formatHorseCount(shown: number, total: number, locale: Locale = 'en'): string {
  return getDictionary(locale).horses.count(shown, total);
}
