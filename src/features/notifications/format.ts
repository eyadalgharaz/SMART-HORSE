import {
  formatRelativeTime as formatRelativeTimeBase,
  formatRelativeTimeLocalized,
} from '@/features/dashboard/format';
import { getDictionary } from '@/i18n/dictionaries';
import type { Locale } from '@/i18n/locale';
import type { Notification } from './types';

/**
 * Display formatting, sorting, filtering and the read/related-entity rules
 * for notification data. Pure functions only, so every rule is testable
 * without rendering anything.
 */

/** "3 hours ago", "Yesterday" — reuses the exact wording the Dashboard already shows. */
export function formatRelativeTime(
  createdAtIso: string,
  referenceIso: string = new Date().toISOString(),
  locale: Locale = 'en',
): string {
  return locale === 'en'
    ? formatRelativeTimeBase(createdAtIso, referenceIso)
    : formatRelativeTimeLocalized(createdAtIso, referenceIso, getDictionary(locale));
}

export function isUnread(notification: Notification): boolean {
  return notification.readAt === null;
}

export function sortNotificationsNewestFirst(notifications: Notification[]): Notification[] {
  return [...notifications].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export function unreadCount(notifications: Notification[]): number {
  return notifications.filter(isUnread).length;
}

export function filterNotifications(
  notifications: Notification[],
  unreadOnly: boolean,
): Notification[] {
  return unreadOnly ? notifications.filter(isUnread) : notifications;
}

/** "3 unread", "1 unread", or null when there is nothing unread to report. */
export function formatUnreadCount(count: number, locale: Locale = 'en'): string | null {
  return getDictionary(locale).notifications.unreadCount(count);
}

/**
 * Where opening a notification should go, derived from what it relates to —
 * never a link the notification carries directly, so Notifications never has
 * to know another module's URL structure beyond this one function.
 */
export function notificationHref(notification: Notification): string | null {
  const id = notification.relatedEntityId;
  if (!id) return null;

  switch (notification.relatedEntityType) {
    case 'task':
      return `/tasks/${id}`;
    case 'medical':
      return `/medical/horses/${id}`;
    case 'training':
      return `/training/horses/${id}`;
    case 'horse':
      return `/horses/${id}`;
    case 'system':
    default:
      return null;
  }
}
