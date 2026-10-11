import { getDictionary } from './dictionaries';
import { formatDate } from './format';
import type { Locale } from './locale';

/**
 * Relative calendar-day wording shared by Health, Training and Tasks.
 * Pure: `reference` defaults to now and is fixed in tests.
 */

function startOfDay(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

/** Whole calendar days from `reference` to `target`, in local time (tomorrow = 1). */
export function dayDifference(target: Date, reference: Date): number {
  return Math.round((startOfDay(target) - startOfDay(reference)) / 86_400_000);
}

/** "Today", "Tomorrow", "Yesterday", otherwise the localized date. */
export function relativeDateLabel(
  iso: string,
  reference: Date = new Date(),
  locale: Locale = 'en',
): string {
  const t = getDictionary(locale).time;
  const difference = dayDifference(new Date(iso), reference);
  if (difference === 0) return t.today;
  if (difference === 1) return t.tomorrow;
  if (difference === -1) return t.yesterday;
  return formatDate(iso, locale);
}

/**
 * "Today", "Tomorrow", "In 5 days", "3 weeks ago", "2 months ago" — coarser
 * the further away a date is, because "In 43 days" says less than "In 6 weeks".
 */
export function relativeDistanceLabel(
  iso: string,
  reference: Date = new Date(),
  locale: Locale = 'en',
): string {
  const t = getDictionary(locale).time;
  const difference = dayDifference(new Date(iso), reference);
  if (difference === 0) return t.today;
  if (difference === 1) return t.tomorrow;
  if (difference === -1) return t.yesterday;

  const future = difference > 0;
  const distance = Math.abs(difference);

  if (distance < 14) return future ? t.inDays(distance) : t.daysAgo(distance);
  if (distance < 60) {
    const weeks = Math.round(distance / 7);
    return future ? t.inWeeks(weeks) : t.weeksAgo(weeks);
  }
  if (distance < 730) {
    const months = Math.round(distance / 30.4);
    return future ? t.inMonths(months) : t.monthsAgo(months);
  }
  const years = Math.floor(distance / 365);
  return future ? t.inYears(years) : t.yearsAgo(years);
}
