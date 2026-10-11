'use client';

import { useI18n } from '@/i18n';
import { formatRelativeTime, isUnread } from '../format';
import type { Notification } from '../types';
import { NotificationTypeIcon, UnreadDot } from './notification-type-icon';

/**
 * One notification, as a button rather than a link: opening it always marks
 * it read first, and only then navigates if it has somewhere to go — a plain
 * `<Link>` can't do the first part. `compact` trims the row for the topbar
 * dropdown's narrower space; the full list page uses the default size.
 */
export function NotificationRow({
  notification,
  onOpen,
  compact = false,
}: {
  notification: Notification;
  onOpen: (notification: Notification) => void;
  compact?: boolean;
}) {
  const unread = isUnread(notification);
  const { t, tc, locale } = useI18n();

  return (
    <button
      type="button"
      onClick={() => onOpen(notification)}
      className={`flex w-full items-start gap-3 text-start hover:bg-stone-50 ${compact ? 'px-3 py-2.5' : 'px-4 py-3 sm:px-5'}`}
    >
      <NotificationTypeIcon type={notification.type} />

      <span className="min-w-0 flex-1">
        <span className="flex items-start justify-between gap-2">
          <span className={`break-words ${unread ? 'font-semibold' : 'font-medium'}`}>
            {tc(notification.title)}
          </span>
          {unread ? <UnreadDot label={t.notifications.unread} /> : null}
        </span>
        <span className="mt-0.5 block text-sm break-words text-stone-600">
          {tc(notification.message)}
        </span>
        <span className="mt-1 block text-xs text-stone-500">
          {formatRelativeTime(notification.createdAt, undefined, locale)}
        </span>
      </span>
    </button>
  );
}
