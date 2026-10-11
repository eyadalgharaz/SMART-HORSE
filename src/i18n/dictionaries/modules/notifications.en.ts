/** Notifications module — English (canonical). */
export const notificationsEn = {
  types: {
    'task-assigned': 'Task assigned',
    'task-due-soon': 'Task due soon',
    'task-overdue': 'Task overdue',
    'task-completed': 'Task completed',
    'medical-reminder': 'Medical reminder',
    'vaccination-reminder': 'Vaccination reminder',
    'training-reminder': 'Training reminder',
    system: 'System',
  },
  unread: 'Unread',
  unreadCount: (n: number): string | null => (n === 0 ? null : `${n} unread`),
  bell: {
    label: 'Notifications',
    labelWithUnread: (n: number) => `Notifications, ${n} unread`,
    title: 'Notifications',
    viewAll: 'View all',
    loadError: "Notifications couldn't be loaded.",
    allCaughtUp: "You're all caught up.",
  },
  page: {
    markAllRead: 'Mark all as read',
    filterLabel: 'Notification filter',
    all: 'All',
    unreadTab: 'Unread',
    emptyUnreadTitle: 'No unread notifications',
    emptyUnreadDescription: "You're all caught up — nothing new needs your attention.",
    emptyTitle: 'No notifications yet',
    emptyDescription:
      'Notifications about tasks, medical reminders and training will show up here.',
  },
  loading: 'Loading notifications',
};
