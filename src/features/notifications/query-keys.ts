/**
 * Query keys for the Notifications module. Everything sits under one root,
 * which is what marking a notification (or all of them) read invalidates —
 * the list and the topbar's unread count always agree because they read the
 * same query.
 */
export const notificationRoot = ['notifications'] as const;

export const notificationKeys = {
  list: ['notifications', 'list'] as const,
};
