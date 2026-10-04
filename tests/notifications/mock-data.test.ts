import { describe, expect, it } from 'vitest';
import { buildHorseMocks } from '@/features/horses/mock/horse-mock-data';
import { buildTaskMocks } from '@/features/tasks/mock/task-mock-data';
import { buildNotificationMocks } from '@/features/notifications/mock/notification-mock-data';
import { notificationTypeValues } from '@/features/notifications/vocabulary';

describe('buildNotificationMocks', () => {
  const notifications = buildNotificationMocks();
  const taskIds = new Set(buildTaskMocks().map((task) => task.id));
  const horseIds = new Set(buildHorseMocks().map((horse) => horse.id));

  it('produces a dataset large enough to review the list and unread states', () => {
    expect(notifications.length).toBeGreaterThanOrEqual(30);
    expect(new Set(notifications.map((n) => n.id)).size).toBe(notifications.length);
  });

  it('covers every notification type', () => {
    expect(new Set(notifications.map((n) => n.type))).toEqual(new Set(notificationTypeValues));
  });

  it('includes both read and unread notifications', () => {
    expect(notifications.some((n) => n.readAt === null)).toBe(true);
    expect(notifications.some((n) => n.readAt !== null)).toBe(true);
  });

  it('every task-related notification points at a real task id', () => {
    for (const notification of notifications) {
      if (notification.relatedEntityType === 'task') {
        expect(notification.relatedEntityId).not.toBeNull();
        expect(taskIds.has(notification.relatedEntityId!)).toBe(true);
      }
    }
  });

  it('every medical/training reminder points at a real horse id', () => {
    for (const notification of notifications) {
      if (
        notification.relatedEntityType === 'medical' ||
        notification.relatedEntityType === 'training'
      ) {
        expect(notification.relatedEntityId).not.toBeNull();
        expect(horseIds.has(notification.relatedEntityId!)).toBe(true);
      }
    }
  });

  it('system notifications carry no related entity id', () => {
    for (const notification of notifications) {
      if (notification.relatedEntityType === 'system')
        expect(notification.relatedEntityId).toBeNull();
    }
  });

  it('a read notification was read after it was created', () => {
    for (const notification of notifications) {
      if (notification.readAt !== null) {
        expect(new Date(notification.readAt).getTime()).toBeGreaterThanOrEqual(
          new Date(notification.createdAt).getTime(),
        );
      }
    }
  });
});
