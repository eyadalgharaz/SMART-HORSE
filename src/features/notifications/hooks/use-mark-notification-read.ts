'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '../notification-service';
import { notificationRoot } from '../query-keys';

/**
 * Marking a notification (or all of them) read changes what the topbar bell
 * and the notification list both show, so the whole Notifications cache is
 * invalidated rather than patched by hand — the same approach the other
 * modules' save mutations use.
 */
export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notificationService.markRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: notificationRoot }),
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationService.markAllRead(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: notificationRoot }),
  });
}
