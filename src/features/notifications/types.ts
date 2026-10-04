import type { NotificationType, RelatedEntityType } from './vocabulary';

export type { NotificationType, RelatedEntityType };

/**
 * Notification read model.
 *
 * Shaped for a future `GET /api/v1/notifications` response: dates are ISO
 * 8601 strings and the UI does all display formatting. `readAt` is `null`
 * for an unread notification and the moment it was read otherwise — a
 * timestamp rather than a boolean, so "unread" and "read 3 days ago" both
 * come from the same field.
 *
 * `relatedEntityType`/`relatedEntityId` are how a notification points back
 * to what it is about, without Notifications importing Tasks, Medical or
 * Training. `format.ts` turns that pair into a route.
 */
export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  createdAt: string;
  readAt: string | null;
  relatedEntityType: RelatedEntityType | null;
  /**
   * The id `relatedEntityType` needs to build a link: a task id for `task`, a
   * horse id for `horse`/`medical`/`training`. Null for `system` and for a
   * notification with no related entity.
   */
  relatedEntityId: string | null;
}

/**
 * The only contract the Notifications UI depends on. Phase F ships a mock
 * implementation; a later phase swaps in an HTTP client against
 * /api/v1/notifications without touching any component.
 */
export interface NotificationService {
  listNotifications(): Promise<Notification[]>;
  markRead(id: string): Promise<Notification>;
  markAllRead(): Promise<void>;
}

/** Failure the UI renders as an error state with "Try again". */
export class NotificationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotificationError';
  }
}
