import { describe, expect, it } from 'vitest';
import {
  filterNotifications,
  formatUnreadCount,
  isUnread,
  notificationHref,
  sortNotificationsNewestFirst,
  unreadCount,
} from '@/features/notifications/format';
import type { Notification } from '@/features/notifications/types';

function notification(overrides: Partial<Notification> = {}): Notification {
  return {
    id: 'nt-x',
    type: 'system',
    title: 'Sample',
    message: 'Sample message',
    createdAt: new Date(2026, 8, 20, 9).toISOString(),
    readAt: null,
    relatedEntityType: null,
    relatedEntityId: null,
    ...overrides,
  };
}

describe('isUnread / unreadCount', () => {
  it('treats a null readAt as unread', () => {
    expect(isUnread(notification({ readAt: null }))).toBe(true);
    expect(isUnread(notification({ readAt: new Date().toISOString() }))).toBe(false);
  });

  it('counts only the unread notifications', () => {
    const notifications = [
      notification({ id: 'a', readAt: null }),
      notification({ id: 'b', readAt: new Date().toISOString() }),
      notification({ id: 'c', readAt: null }),
    ];
    expect(unreadCount(notifications)).toBe(2);
  });
});

describe('sortNotificationsNewestFirst', () => {
  it('sorts by createdAt descending', () => {
    const notifications = [
      notification({ id: 'old', createdAt: new Date(2026, 8, 1).toISOString() }),
      notification({ id: 'new', createdAt: new Date(2026, 8, 19).toISOString() }),
    ];
    expect(sortNotificationsNewestFirst(notifications).map((n) => n.id)).toEqual(['new', 'old']);
  });
});

describe('filterNotifications', () => {
  it('returns everything when unreadOnly is false, and only unread when true', () => {
    const notifications = [
      notification({ id: 'a', readAt: null }),
      notification({ id: 'b', readAt: new Date().toISOString() }),
    ];
    expect(filterNotifications(notifications, false)).toHaveLength(2);
    expect(filterNotifications(notifications, true).map((n) => n.id)).toEqual(['a']);
  });
});

describe('formatUnreadCount', () => {
  it('formats singular, plural, and null for zero', () => {
    expect(formatUnreadCount(0)).toBeNull();
    expect(formatUnreadCount(1)).toBe('1 unread');
    expect(formatUnreadCount(4)).toBe('4 unread');
  });
});

describe('notificationHref', () => {
  it('routes a task notification to the task detail page', () => {
    expect(
      notificationHref(notification({ relatedEntityType: 'task', relatedEntityId: 'tk-001' })),
    ).toBe('/tasks/tk-001');
  });

  it('routes medical and training reminders to the horse-scoped pages', () => {
    expect(
      notificationHref(notification({ relatedEntityType: 'medical', relatedEntityId: 'luna' })),
    ).toBe('/medical/horses/luna');
    expect(
      notificationHref(notification({ relatedEntityType: 'training', relatedEntityId: 'luna' })),
    ).toBe('/training/horses/luna');
  });

  it('routes a horse notification to the horse profile', () => {
    expect(
      notificationHref(notification({ relatedEntityType: 'horse', relatedEntityId: 'luna' })),
    ).toBe('/horses/luna');
  });

  it('returns null for a system notification or one with no related entity', () => {
    expect(
      notificationHref(notification({ relatedEntityType: 'system', relatedEntityId: null })),
    ).toBeNull();
    expect(
      notificationHref(notification({ relatedEntityType: null, relatedEntityId: null })),
    ).toBeNull();
  });
});
