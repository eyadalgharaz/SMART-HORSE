import { describe, expect, it } from 'vitest';
import { en } from '@/i18n/dictionaries/en';
import { ar } from '@/i18n/dictionaries/ar';
import {
  calendarDayDifference,
  firstNameOf,
  formatDayLabel,
  formatDueLabel,
  formatRelativeTime,
  formatRelativeTimeLocalized,
  formatSignedChange,
  formatTime,
  formatWeekdayLong,
  formatWeekdayShort,
  greetingFor,
  localizedHorseName,
  notificationContent,
  percentChange,
  pluralize,
  pluralizeSessions,
  taskTitle,
} from '@/features/dashboard/format';
import { axisCeiling, axisTicks, barPercent } from '@/features/dashboard/chart-scale';
import type { DashboardNotification } from '@/features/dashboard/types';

// Saturday 19 September 2026, 09:00 local time. Built with the local constructor so
// the expectations hold in any timezone.
const NOW = new Date(2026, 8, 19, 9, 0);
const at = (dayOffset: number, hour: number, minute = 0) =>
  new Date(2026, 8, 19 + dayOffset, hour, minute).toISOString();

describe('greeting and names', () => {
  it('greets by time of day, in either language', () => {
    expect(greetingFor(new Date(2026, 8, 19, 6), en)).toBe('Good morning');
    expect(greetingFor(new Date(2026, 8, 19, 12), en)).toBe('Good afternoon');
    expect(greetingFor(new Date(2026, 8, 19, 17, 59), en)).toBe('Good afternoon');
    expect(greetingFor(new Date(2026, 8, 19, 18), en)).toBe('Good evening');

    expect(greetingFor(new Date(2026, 8, 19, 6), ar)).toBe('صباح الخير');
    expect(greetingFor(new Date(2026, 8, 19, 18), ar)).toBe('طاب مساؤك');
  });

  it('takes the first name and tolerates missing names', () => {
    expect(firstNameOf('Ahmed Hassan')).toBe('Ahmed');
    expect(firstNameOf('  Layla  ')).toBe('Layla');
    expect(firstNameOf('')).toBeNull();
    expect(firstNameOf(undefined)).toBeNull();
  });

  it('localizes the curated demo horse names, and leaves any other name unchanged', () => {
    expect(localizedHorseName('Luna', en)).toBe('Luna');
    expect(localizedHorseName('Luna', ar)).toBe('ليلى');
    expect(localizedHorseName('Some Other Horse', ar)).toBe('Some Other Horse');
  });
});

describe('date and time labels', () => {
  it('formats clock times in 12-hour form, with Latin digits in both languages', () => {
    expect(formatTime(new Date(2026, 8, 19, 0, 5), 'en')).toBe('12:05 AM');
    expect(formatTime(new Date(2026, 8, 19, 9, 30), 'en')).toBe('9:30 AM');
    expect(formatTime(new Date(2026, 8, 19, 12, 0), 'en')).toBe('12:00 PM');
    // Latin numbering system: Arabic output contains Western digits, not Arabic-Indic ones.
    expect(formatTime(new Date(2026, 8, 19, 9, 30), 'ar')).toMatch(/9:30/);
  });

  it('counts calendar days, not 24-hour blocks', () => {
    expect(calendarDayDifference(new Date(2026, 8, 20, 0, 1), new Date(2026, 8, 19, 23, 59))).toBe(
      1,
    );
    expect(calendarDayDifference(new Date(2026, 8, 19, 23, 59), new Date(2026, 8, 19, 0, 1))).toBe(
      0,
    );
  });

  it('uses Today / Tomorrow / Yesterday (localized) and a short date beyond that', () => {
    expect(formatDayLabel(new Date(at(0, 15)), NOW, en, 'en')).toBe('Today');
    expect(formatDayLabel(new Date(at(1, 15)), NOW, en, 'en')).toBe('Tomorrow');
    expect(formatDayLabel(new Date(at(-1, 15)), NOW, en, 'en')).toBe('Yesterday');
    expect(formatDayLabel(new Date(at(3, 15)), NOW, en, 'en')).toBe('Tue, Sep 22');

    expect(formatDayLabel(new Date(at(0, 15)), NOW, ar, 'ar')).toBe('اليوم');
    expect(formatDayLabel(new Date(at(1, 15)), NOW, ar, 'ar')).toBe('غدًا');
    expect(formatDayLabel(new Date(at(-1, 15)), NOW, ar, 'ar')).toBe('أمس');
  });

  it('builds due labels as "day · time"', () => {
    const ref = NOW.toISOString();
    expect(formatDueLabel(at(0, 10), ref, en, 'en')).toBe('Today · 10:00 AM');
    expect(formatDueLabel(at(1, 9, 30), ref, en, 'en')).toBe('Tomorrow · 9:30 AM');
    expect(formatDueLabel(at(-1, 14), ref, en, 'en')).toBe('Yesterday · 2:00 PM');
    expect(formatDueLabel(at(0, 10), ref, ar, 'ar')).toMatch(/^اليوم ·/);
  });

  it('describes elapsed time in plain English words (shared with other modules, unchanged)', () => {
    const ref = NOW.toISOString();
    const ago = (minutes: number) => new Date(NOW.getTime() - minutes * 60_000).toISOString();
    expect(formatRelativeTime(ago(0), ref)).toBe('Just now');
    expect(formatRelativeTime(ago(1), ref)).toBe('1 minute ago');
    expect(formatRelativeTime(ago(10), ref)).toBe('10 minutes ago');
    expect(formatRelativeTime(ago(60), ref)).toBe('1 hour ago');
    expect(formatRelativeTime(ago(120), ref)).toBe('2 hours ago');
    expect(formatRelativeTime(ago(24 * 60), ref)).toBe('Yesterday');
    expect(formatRelativeTime(ago(3 * 24 * 60), ref)).toBe('3 days ago');
  });

  it('describes elapsed time in the active locale, for the dashboard itself', () => {
    const ref = NOW.toISOString();
    const ago = (minutes: number) => new Date(NOW.getTime() - minutes * 60_000).toISOString();
    expect(formatRelativeTimeLocalized(ago(0), ref, en)).toBe('Just now');
    expect(formatRelativeTimeLocalized(ago(10), ref, en)).toBe('10 minutes ago');
    expect(formatRelativeTimeLocalized(ago(24 * 60), ref, en)).toBe('Yesterday');

    expect(formatRelativeTimeLocalized(ago(0), ref, ar)).toBe('الآن');
    expect(formatRelativeTimeLocalized(ago(10), ref, ar)).toBe('منذ 10 دقائق');
    expect(formatRelativeTimeLocalized(ago(24 * 60), ref, ar)).toBe('أمس');
    expect(formatRelativeTimeLocalized(ago(3 * 24 * 60), ref, ar)).toBe('منذ 3 أيام');
  });

  it('formats weekday names in the active locale', () => {
    expect(formatWeekdayShort(at(0, 12), 'en')).toBe('Sat');
    expect(formatWeekdayLong(at(0, 12), 'en')).toBe('Saturday');
    expect(formatWeekdayShort(at(0, 12), 'ar')).toBeTruthy();
    expect(formatWeekdayLong(at(0, 12), 'ar')).toBeTruthy();
    // Never the English weekday name leaking into the Arabic rendering.
    expect(formatWeekdayLong(at(0, 12), 'ar')).not.toBe('Saturday');
  });
});

describe('numbers', () => {
  it('computes a rounded percentage change and refuses a zero baseline', () => {
    expect(percentChange(71, 64)).toBe(11);
    expect(percentChange(50, 100)).toBe(-50);
    expect(percentChange(10, 10)).toBe(0);
    expect(percentChange(5, 0)).toBeNull();
  });

  it('formats a signed change with a real minus sign', () => {
    expect(formatSignedChange(2)).toBe('+2');
    expect(formatSignedChange(-2)).toBe('−2');
    expect(formatSignedChange(0)).toBe('+0');
  });

  it('pluralizes generically (English, shared with other modules, unchanged)', () => {
    expect(pluralize(1, 'session')).toBe('session');
    expect(pluralize(2, 'session')).toBe('sessions');
    expect(pluralize(0, 'horse')).toBe('horses');
  });

  it('pluralizes sessions in the active locale', () => {
    expect(pluralizeSessions(1, en)).toBe('session');
    expect(pluralizeSessions(2, en)).toBe('sessions');
    expect(pluralizeSessions(1, ar)).toBe('جلسة');
    expect(pluralizeSessions(2, ar)).toBe('جلسات');
  });
});

describe('task and notification content', () => {
  it('derives a task title from its type alone, in the active locale', () => {
    expect(taskTitle('vaccination', en)).toBe('Vaccination');
    expect(taskTitle('farrier', en)).toBe('Farrier visit');
    expect(taskTitle('vaccination', ar)).toBe('تطعيم');
    expect(taskTitle('farrier', ar)).toBe('زيارة الحداد');
  });

  it('builds a notification title/message from category + horseName, in either language', () => {
    const vaccination: DashboardNotification = {
      id: 'n1',
      category: 'vaccination',
      horseName: 'Luna',
      createdAt: NOW.toISOString(),
      read: false,
    };
    expect(notificationContent(vaccination, en)).toEqual({
      title: 'Vaccination reminder',
      message: 'Luna is due for vaccination.',
    });
    expect(notificationContent(vaccination, ar)).toEqual({
      title: 'تذكير بالتطعيم',
      message: 'ليلى لديها موعد تطعيم مستحق.',
    });
  });

  it('includes the task type in an overdue-task notification message', () => {
    const overdue: DashboardNotification = {
      id: 'n2',
      category: 'task',
      horseName: 'Duke',
      taskType: 'farrier',
      createdAt: NOW.toISOString(),
      read: true,
    };
    const { message } = notificationContent(overdue, en);
    expect(message).toContain('farrier');
    expect(message).toContain('Duke');
  });
});

describe('chart scale', () => {
  it('leaves headroom above the tallest bar, in whole-number steps', () => {
    expect(axisCeiling(14)).toBe(16);
    expect(axisCeiling(15)).toBe(16);
    expect(axisCeiling(16)).toBe(20);
    expect(axisCeiling(0)).toBe(4);
  });

  it('places gridlines at the baseline, midpoint and ceiling', () => {
    expect(axisTicks(16)).toEqual([0, 8, 16]);
  });

  it('maps values to percentages of the plot height', () => {
    expect(barPercent(8, 16)).toBe(50);
    expect(barPercent(0, 16)).toBe(0);
    expect(barPercent(5, 0)).toBe(0);
  });
});
