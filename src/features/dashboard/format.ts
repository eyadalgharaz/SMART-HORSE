/**
 * Display formatting for dashboard data. Pure functions only, so labels are
 * trivially testable. Relative wording ("Today", "10 minutes ago") is measured
 * from the snapshot's `generatedAt` rather than the browser clock, which keeps
 * a rendered snapshot internally consistent.
 *
 * Phase J adds a locale-aware variant of each function the Dashboard itself
 * renders, taking the active locale's translation dictionary (and, where a
 * weekday/month name is involved, the `Locale` for `Intl`) so the whole
 * dashboard — not just its static labels — renders in the selected language.
 * Numbers and dates use the Latin numbering system in both languages
 * (`-u-nu-latn`) so figures stay quickly readable in Arabic too, matching how
 * most bilingual commercial software presents numerals.
 *
 * The ORIGINAL English-only `formatRelativeTime`/`pluralize` are kept
 * unchanged and still exported: `features/notifications/format.ts` and
 * `features/settings/format.ts` already import them for their own
 * "time ago" wording, and localizing those two modules is outside this
 * phase's scope (the Dashboard). Changing their signature would have been an
 * unrelated breaking change to modules this phase doesn't otherwise touch.
 */

import type { Dictionary, Locale } from '@/i18n';
import type { DashboardNotification, UpcomingTask } from './types';

const MINUTE_MS = 60_000;
const HOUR_MS = 60 * MINUTE_MS;

function intlLocale(locale: Locale): string {
  return locale === 'ar' ? 'ar-u-nu-latn' : 'en-US';
}

/** "Ahmed Hassan" → "Ahmed". Null when there is no usable name. */
export function firstNameOf(fullName: string | null | undefined): string | null {
  const first = fullName?.trim().split(/\s+/)[0];
  return first ? first : null;
}

function startOfDay(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

/** Whole calendar days from `reference` to `target`, in local time (tomorrow = 1). */
export function calendarDayDifference(target: Date, reference: Date): number {
  return Math.round((startOfDay(target) - startOfDay(reference)) / (24 * HOUR_MS));
}

/** Signed whole-number percentage change, or null when there is no baseline. */
export function percentChange(current: number, previous: number): number | null {
  if (previous <= 0) return null;
  return Math.round(((current - previous) / previous) * 100);
}

/** "session" / "sessions" — generic English pluralizer, unchanged; shared by other modules. */
export function pluralize(count: number, singular: string, plural = `${singular}s`): string {
  return count === 1 ? singular : plural;
}

/** "10 minutes ago", "1 hour ago", "Yesterday", "3 days ago" — English only; shared by other modules. */
export function formatRelativeTime(createdAtIso: string, referenceIso: string): string {
  const elapsed = new Date(referenceIso).getTime() - new Date(createdAtIso).getTime();
  const minutes = Math.floor(elapsed / MINUTE_MS);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;

  const hours = Math.floor(elapsed / HOUR_MS);
  if (hours < 24) return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;

  const days = Math.floor(hours / 24);
  return days === 1 ? 'Yesterday' : `${days} days ago`;
}

/* ------------------------------------------------------------------ */
/* Locale-aware variants — used by the Dashboard's own components only */
/* ------------------------------------------------------------------ */

export function greetingFor(now: Date, t: Dictionary): string {
  const hour = now.getHours();
  if (hour < 12) return t.dashboard.greeting.morning;
  if (hour < 18) return t.dashboard.greeting.afternoon;
  return t.dashboard.greeting.evening;
}

/** Looks up a demo horse's localized display name; any other name passes through unchanged. */
export function localizedHorseName(name: string, t: Dictionary): string {
  return t.horseNames[name] ?? name;
}

export function formatTime(date: Date, locale: Locale): string {
  return date.toLocaleTimeString(intlLocale(locale), { hour: 'numeric', minute: '2-digit' });
}

/** "Today", "Tomorrow", "Yesterday", otherwise a localized short date. */
export function formatDayLabel(
  target: Date,
  reference: Date,
  t: Dictionary,
  locale: Locale,
): string {
  const difference = calendarDayDifference(target, reference);
  if (difference === 0) return t.dashboard.relativeDay.today;
  if (difference === 1) return t.dashboard.relativeDay.tomorrow;
  if (difference === -1) return t.dashboard.relativeDay.yesterday;
  return target.toLocaleDateString(intlLocale(locale), {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

/** "Today · 10:00 AM" ("اليوم · ١٠:٠٠" shaped, with Latin digits, in Arabic). */
export function formatDueLabel(
  dueAtIso: string,
  referenceIso: string,
  t: Dictionary,
  locale: Locale,
): string {
  const due = new Date(dueAtIso);
  return `${formatDayLabel(due, new Date(referenceIso), t, locale)} · ${formatTime(due, locale)}`;
}

/** Locale-aware "10 minutes ago" / "Yesterday" / "3 days ago", for the Dashboard's own panels. */
export function formatRelativeTimeLocalized(
  createdAtIso: string,
  referenceIso: string,
  t: Dictionary,
): string {
  const elapsed = new Date(referenceIso).getTime() - new Date(createdAtIso).getTime();
  const minutes = Math.floor(elapsed / MINUTE_MS);
  if (minutes < 1) return t.dashboard.relativeTime.justNow;
  if (minutes < 60) return t.dashboard.relativeTime.minutesAgo(minutes);

  const hours = Math.floor(elapsed / HOUR_MS);
  if (hours < 24) return t.dashboard.relativeTime.hoursAgo(hours);

  const days = Math.floor(hours / 24);
  return days === 1 ? t.dashboard.relativeDay.yesterday : t.dashboard.relativeTime.daysAgo(days);
}

export function formatWeekdayShort(dateIso: string, locale: Locale): string {
  return new Date(dateIso).toLocaleDateString(intlLocale(locale), { weekday: 'short' });
}

export function formatWeekdayLong(dateIso: string, locale: Locale): string {
  return new Date(dateIso).toLocaleDateString(intlLocale(locale), { weekday: 'long' });
}

/** "+2" / "−2", using the minus sign that matches each language's number display. */
export function formatSignedChange(change: number): string {
  const sign = change >= 0 ? '+' : '−';
  return `${sign}${Math.abs(change)}`;
}

/** "N session" / "N sessions" ("جلسة" / "جلسات" in Arabic). */
export function pluralizeSessions(count: number, t: Dictionary): string {
  return count === 1 ? t.dashboard.activity.session : t.dashboard.activity.sessions;
}

/** Localized task title, derived from `type` alone so it can never drift from the status badge. */
export function taskTitle(type: UpcomingTask['type'], t: Dictionary): string {
  return t.dashboard.taskTypes[type];
}

/**
 * The notification's title and message, built from its category (and, for a
 * task notification, its task type) rather than stored as English text — so
 * the same mock record renders correctly in either language.
 */
export function notificationContent(
  notification: DashboardNotification,
  t: Dictionary,
): { title: string; message: string } {
  const horseName = localizedHorseName(notification.horseName, t);
  const templates = t.dashboard.notificationTemplates;

  switch (notification.category) {
    case 'vaccination':
      return {
        title: templates.vaccinationReminder.title,
        message: templates.vaccinationReminder.message(horseName),
      };
    case 'appointment':
      return {
        title: templates.appointmentScheduled.title,
        message: templates.appointmentScheduled.message(horseName),
      };
    case 'training':
      return {
        title: templates.trainingReminder.title,
        message: templates.trainingReminder.message(horseName),
      };
    case 'task': {
      const typeLabel = notification.taskType ? t.dashboard.taskTypes[notification.taskType] : '';
      return {
        title: templates.taskOverdue.title,
        message: templates.taskOverdue.message(typeLabel, horseName),
      };
    }
    case 'health':
      return {
        title: templates.healthUpdate.title,
        message: templates.healthUpdate.message(horseName),
      };
  }
}
