'use client';

import { Bell } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Dropdown } from '@/components/ui/dropdown';
import { sortNotificationsNewestFirst } from '../format';
import { useMarkNotificationRead } from '../hooks/use-mark-notification-read';
import { useNotifications } from '../hooks/use-notifications';
import { notificationHref } from '../format';
import type { Notification } from '../types';
import { NotificationListSkeleton } from './notification-skeletons';
import { NotificationRow } from './notification-row';

const PREVIEW_COUNT = 5;

/**
 * The topbar's notification bell: an unread-count badge plus a preview
 * dropdown of the most recent notifications, with a link through to the full
 * `/notifications` page. Built on the shared `Dropdown` primitive, so it gets
 * click-outside and Escape-to-close for free and behaves like every other
 * menu in the shell.
 */
export function NotificationBell() {
  const router = useRouter();
  const { notifications, unreadCount, isPending, isError } = useNotifications();
  const { mutate: markRead } = useMarkNotificationRead();

  const preview = sortNotificationsNewestFirst(notifications).slice(0, PREVIEW_COUNT);

  function handleOpen(notification: Notification, close: () => void) {
    if (notification.readAt === null) markRead(notification.id);
    close();
    const href = notificationHref(notification);
    if (href) router.push(href);
  }

  return (
    <Dropdown
      triggerLabel={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications'}
      className="max-h-[28rem] w-[22rem] max-w-[calc(100vw-1.5rem)] overflow-y-auto p-0"
      trigger={
        <span className="relative flex size-9 items-center justify-center">
          <Bell className="size-5" aria-hidden="true" />
          {unreadCount > 0 ? (
            <span
              aria-hidden="true"
              className="absolute top-1 right-1 flex min-w-[1.1rem] items-center justify-center rounded-full bg-red-600 px-1 py-px text-[0.65rem] leading-none font-semibold text-white"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          ) : null}
        </span>
      }
    >
      {(close) => (
        <div>
          <div className="flex items-center justify-between border-b border-stone-200 px-3 py-2">
            <p className="text-sm font-semibold">Notifications</p>
            <Link
              href="/notifications"
              onClick={close}
              className="text-pasture-600 text-xs font-medium hover:underline"
            >
              View all
            </Link>
          </div>

          {isPending ? (
            <NotificationListSkeleton count={3} />
          ) : isError ? (
            <p className="px-3 py-4 text-sm text-stone-600">
              Notifications couldn&apos;t be loaded.
            </p>
          ) : preview.length === 0 ? (
            <p className="px-3 py-4 text-sm text-stone-600">You&apos;re all caught up.</p>
          ) : (
            <ul className="divide-y divide-stone-200">
              {preview.map((notification) => (
                <li key={notification.id}>
                  <NotificationRow
                    notification={notification}
                    onOpen={(value) => handleOpen(value, close)}
                    compact
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </Dropdown>
  );
}
