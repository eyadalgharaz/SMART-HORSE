import { mockNotificationService } from './mock/mock-notification-service';
import type { NotificationService } from './types';

/**
 * Single seam between the Notifications UI and its data.
 *
 * Phase F: mock implementation in the browser.
 * Later:   `export const notificationService: NotificationService = httpNotificationService;`
 *          backed by `/api/v1/notifications`.
 *
 * Components must never import the mock directly.
 */
export const notificationService: NotificationService = mockNotificationService;
