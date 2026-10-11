'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { PageHeader } from '@/components/layout/page-header';
import { useTranslations } from '@/i18n';
import { cn } from '@/lib/cn';
import { filterNotifications, notificationHref } from '../format';
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
} from '../hooks/use-mark-notification-read';
import { useNotifications } from '../hooks/use-notifications';
import type { Notification } from '../types';
import { NotificationListSkeleton } from './notification-skeletons';
import { NotificationRow } from './notification-row';

/**
 * Container for /notifications: the farm's whole notification history, with
 * an All/Unread split and a way to clear the unread count in one action.
 *
 * Opening a notification always marks it read first and then navigates if it
 * points somewhere real (`notificationHref`) — a system notification with no
 * related entity simply becomes read in place.
 */

type Tab = 'all' | 'unread';

export function NotificationListPage() {
  const t = useTranslations();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('all');
  const { notifications, unreadCount, isPending, isError, isRefetching, refetch } =
    useNotifications();
  const { mutate: markRead } = useMarkNotificationRead();
  const { mutate: markAllRead, isPending: markingAll } = useMarkAllNotificationsRead();

  const shown = filterNotifications(notifications, tab === 'unread');

  function handleOpen(notification: Notification) {
    if (notification.readAt === null) markRead(notification.id);
    const href = notificationHref(notification);
    if (href) router.push(href);
  }

  if (isError) {
    return (
      <>
        <PageHeader
          title={t.pages.notifications.title}
          description={t.pages.notifications.description}
        />
        <ErrorState
          title={t.pages.notifications.errorTitle}
          description={t.pages.notifications.errorDescription}
          action={
            <Button variant="secondary" onClick={() => void refetch()} loading={isRefetching}>
              {t.common.tryAgain}
            </Button>
          }
        />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title={t.pages.notifications.title}
        description={t.pages.notifications.description}
        action={
          unreadCount > 0 ? (
            <Button variant="secondary" onClick={() => markAllRead()} loading={markingAll}>
              <CheckCheck className="size-4" aria-hidden="true" />
              {t.notifications.page.markAllRead}
            </Button>
          ) : undefined
        }
      />

      <div className="rounded-card border border-stone-200 bg-white">
        <div
          role="tablist"
          aria-label={t.notifications.page.filterLabel}
          className="flex gap-1 border-b border-stone-200 px-2 pt-2"
        >
          {(['all', 'unread'] as const).map((value) => {
            const active = value === tab;
            const label =
              value === 'all' ? t.notifications.page.all : t.notifications.page.unreadTab;
            return (
              <button
                key={value}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setTab(value)}
                className={cn(
                  '-mb-px rounded-t-md border-b-2 px-3 py-2 text-sm font-medium transition-colors',
                  active
                    ? 'border-pasture-500 text-pasture-700'
                    : 'hover:text-ink border-transparent text-stone-600',
                )}
              >
                {label}
                {value === 'unread' && unreadCount > 0 ? (
                  <span className="ms-1.5 text-stone-500">({unreadCount})</span>
                ) : null}
              </button>
            );
          })}
        </div>

        {isPending ? (
          <NotificationListSkeleton />
        ) : shown.length === 0 ? (
          <div className="p-4 sm:p-5">
            <EmptyState
              title={
                tab === 'unread'
                  ? t.notifications.page.emptyUnreadTitle
                  : t.notifications.page.emptyTitle
              }
              description={
                tab === 'unread'
                  ? t.notifications.page.emptyUnreadDescription
                  : t.notifications.page.emptyDescription
              }
            />
          </div>
        ) : (
          <ul className="divide-y divide-stone-200">
            {shown.map((notification) => (
              <li key={notification.id}>
                <NotificationRow notification={notification} onOpen={handleOpen} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
