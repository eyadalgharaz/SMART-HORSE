import { NotificationError, type Notification, type NotificationService } from '../types';
import { sortNotificationsNewestFirst } from '../format';
import { buildNotificationMocks } from './notification-mock-data';
import type { NotificationType, RelatedEntityType } from '../vocabulary';

/**
 * Temporary, in-browser stand-in for `/api/v1/notifications` so the
 * Notifications module can be built and reviewed before the backend exists.
 *
 * Like the other mocks it is deliberately thin: an in-memory array, no fake
 * endpoints, no fake database. Marking a notification read changes that
 * array so the list and the topbar bell visibly update during review;
 * everything resets on reload.
 *
 * Review switches (mock only — append to /notifications):
 *   ?mock=error   the request fails            → error state
 *   ?mock=empty   a farm with no notifications → empty state
 *   ?mock=slow    the request takes ~4 s        → loading skeleton
 */

const LATENCY_MS = 400;
const SLOW_LATENCY_MS = 4000;
const WRITE_LATENCY_MS = 300;

type Scenario = 'default' | 'error' | 'empty' | 'slow';

let store: Notification[] | null = null;
let scenarioAtLoad: Scenario | null = null;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function currentScenario(): Scenario {
  if (typeof window === 'undefined') return 'default';
  const value = new URLSearchParams(window.location.search).get('mock');
  return value === 'error' || value === 'empty' || value === 'slow' ? value : 'default';
}

function data(): Notification[] {
  const scenario = currentScenario();
  const seed = scenario === 'slow' || scenario === 'error' ? 'default' : scenario;
  if (store === null || scenarioAtLoad !== seed) {
    store = seed === 'empty' ? [] : buildNotificationMocks();
    scenarioAtLoad = seed;
  }
  return store;
}

/** Test helper: forget anything read or pushed during a spec. */
export function resetMockNotifications(): void {
  store = null;
  scenarioAtLoad = null;
}

async function guard(latency: number): Promise<void> {
  const scenario = currentScenario();
  await delay(scenario === 'slow' ? SLOW_LATENCY_MS : latency);
  if (scenario === 'error') throw new NotificationError('The notifications could not be loaded.');
}

/**
 * Not part of the public `NotificationService` contract — this is the
 * mock-to-mock seam other mock services (currently just Tasks) use to raise
 * a notification when something happens, e.g. a task being assigned or
 * completed. It is a direct in-memory function call standing in for a
 * backend event; a real backend would publish an event instead, and nothing
 * outside the mocks calls this directly.
 */
export function pushNotification(input: {
  type: NotificationType;
  title: string;
  message: string;
  relatedEntityType: RelatedEntityType;
  relatedEntityId: string;
}): void {
  const current = data();
  current.unshift({
    id: `nt-${Date.now()}-${Math.round(Math.random() * 1000)}`,
    type: input.type,
    title: input.title,
    message: input.message,
    createdAt: new Date().toISOString(),
    readAt: null,
    relatedEntityType: input.relatedEntityType,
    relatedEntityId: input.relatedEntityId,
  });
}

export const mockNotificationService: NotificationService = {
  async listNotifications() {
    await guard(LATENCY_MS);
    return sortNotificationsNewestFirst(data()).map((notification) => ({ ...notification }));
  },

  async markRead(id) {
    await guard(WRITE_LATENCY_MS);
    const current = data();
    const index = current.findIndex((notification) => notification.id === id);
    if (index === -1) throw new NotificationError(`No notification with id "${id}".`);

    const existing = current[index]!;
    const updated: Notification = {
      ...existing,
      readAt: existing.readAt ?? new Date().toISOString(),
    };
    current[index] = updated;
    return { ...updated };
  },

  async markAllRead() {
    await guard(WRITE_LATENCY_MS);
    const now = new Date().toISOString();
    store = data().map((notification) => ({ ...notification, readAt: notification.readAt ?? now }));
  },
};
