'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { notificationService } from '../notification-service';
import { notificationKeys } from '../query-keys';
import { unreadCount as computeUnreadCount } from '../format';

/**
 * Loads every notification through the service seam. Filtering to "unread
 * only" is left to the caller (`filterNotifications`) so the topbar bell can
 * show the true unread count while the notification page's own "Unread" tab
 * narrows the same data.
 */
export function useNotifications() {
  const query = useQuery({
    queryKey: notificationKeys.list,
    queryFn: () => notificationService.listNotifications(),
  });

  const notifications = useMemo(() => query.data ?? [], [query.data]);
  const unreadCount = useMemo(() => computeUnreadCount(notifications), [notifications]);

  return {
    notifications,
    unreadCount,
    isPending: query.isPending,
    isError: query.isError,
    isRefetching: query.isRefetching,
    refetch: query.refetch,
  };
}
