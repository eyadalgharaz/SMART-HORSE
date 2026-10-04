import type { Notification, RelatedEntityType } from '../types';
import type { NotificationType } from '../vocabulary';

/**
 * Realistic sample notifications for the same stable the other modules use.
 *
 * Every notification that relates to a task uses a real task id from
 * `task-mock-data.ts`, and every medical/training reminder uses a real horse
 * id from `buildHorseMocks()` — so opening one always lands on a page that
 * actually exists. This file only cross-references ids as plain data; see
 * `mock-notification-service.ts` for how a task's own mock service pushes a
 * new notification when something happens to it.
 *
 * Every date is an offset in hours from `now`, so "3 hours ago" and the read/unread
 * split stay true whenever the page is opened. This file is fake data
 * only — nothing here implies a backend exists.
 */

function hoursAgo(now: Date, hours: number): string {
  return new Date(now.getTime() - hours * 60 * 60 * 1000).toISOString();
}

interface NotificationSpec {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  hoursAgoValue: number;
  /** null = unread. Otherwise how many hours after creation it was read. */
  readHoursLater: number | null;
  relatedEntityType: RelatedEntityType | null;
  relatedEntityId: string | null;
}

const NOTIFICATION_SPECS: NotificationSpec[] = [
  {
    id: 'nt-001',
    type: 'task-overdue',
    title: 'Task overdue',
    message: 'Reset Luna\u2019s paddock water trough is 4 days overdue.',
    hoursAgoValue: 2,
    readHoursLater: null,
    relatedEntityType: 'task',
    relatedEntityId: 'tk-001',
  },
  {
    id: 'nt-002',
    type: 'task-overdue',
    title: 'Task overdue',
    message: 'Farrier follow-up for Thunder is 2 days overdue.',
    hoursAgoValue: 5,
    readHoursLater: null,
    relatedEntityType: 'task',
    relatedEntityId: 'tk-002',
  },
  {
    id: 'nt-003',
    type: 'task-due-soon',
    title: 'Task due soon',
    message: 'Administer Sultan\u2019s deworming dose is due today.',
    hoursAgoValue: 8,
    readHoursLater: null,
    relatedEntityType: 'task',
    relatedEntityId: 'tk-003',
  },
  {
    id: 'nt-004',
    type: 'task-assigned',
    title: 'Task assigned to you',
    message: 'Check the arena footing after last night\u2019s rain was assigned to Tarek Nassar.',
    hoursAgoValue: 12,
    readHoursLater: null,
    relatedEntityType: 'task',
    relatedEntityId: 'tk-012',
  },
  {
    id: 'nt-005',
    type: 'task-due-soon',
    title: 'Task due soon',
    message: 'Amira \u2014 vaccination booster is due in 3 days.',
    hoursAgoValue: 20,
    readHoursLater: null,
    relatedEntityType: 'task',
    relatedEntityId: 'tk-013',
  },
  {
    id: 'nt-006',
    type: 'task-completed',
    title: 'Task completed',
    message: 'Mistral \u2014 spring vaccinations was marked complete.',
    hoursAgoValue: 30,
    readHoursLater: 2,
    relatedEntityType: 'task',
    relatedEntityId: 'tk-030',
  },
  {
    id: 'nt-007',
    type: 'task-completed',
    title: 'Task completed',
    message: 'Kestrel \u2014 farrier visit was marked complete.',
    hoursAgoValue: 36,
    readHoursLater: 4,
    relatedEntityType: 'task',
    relatedEntityId: 'tk-031',
  },
  {
    id: 'nt-008',
    type: 'task-assigned',
    title: 'Task assigned to you',
    message: 'Willow \u2014 groom before the lesson was assigned to Hoda Kamal.',
    hoursAgoValue: 14,
    readHoursLater: null,
    relatedEntityType: 'task',
    relatedEntityId: 'tk-010',
  },
  {
    id: 'nt-009',
    type: 'task-due-soon',
    title: 'Task due soon',
    message: 'Shadow \u2014 pre-competition tack fitting is due in 4 days.',
    hoursAgoValue: 40,
    readHoursLater: 6,
    relatedEntityType: 'task',
    relatedEntityId: 'tk-014',
  },
  {
    id: 'nt-010',
    type: 'task-overdue',
    title: 'Task overdue',
    message: 'Duke \u2014 dental check reminder is 8 days overdue.',
    hoursAgoValue: 3,
    readHoursLater: null,
    relatedEntityType: 'task',
    relatedEntityId: 'tk-008',
  },
  {
    id: 'nt-011',
    type: 'task-completed',
    title: 'Task completed',
    message: 'Storm \u2014 pre-race tack check was marked complete.',
    hoursAgoValue: 50,
    readHoursLater: 3,
    relatedEntityType: 'task',
    relatedEntityId: 'tk-038',
  },
  {
    id: 'nt-012',
    type: 'task-assigned',
    title: 'Task assigned to you',
    message: 'Restock the medicine cabinet was assigned to Salma Youssef.',
    hoursAgoValue: 60,
    readHoursLater: 10,
    relatedEntityType: 'task',
    relatedEntityId: 'tk-036',
  },
  {
    id: 'nt-013',
    type: 'medical-reminder',
    title: 'Medical reminder',
    message: 'Thunder is due for a recheck following last week\u2019s farrier visit.',
    hoursAgoValue: 6,
    readHoursLater: null,
    relatedEntityType: 'medical',
    relatedEntityId: 'thunder',
  },
  {
    id: 'nt-014',
    type: 'vaccination-reminder',
    title: 'Vaccination reminder',
    message: 'Amira\u2019s vaccination booster is coming up this week.',
    hoursAgoValue: 18,
    readHoursLater: null,
    relatedEntityType: 'medical',
    relatedEntityId: 'amira',
  },
  {
    id: 'nt-015',
    type: 'vaccination-reminder',
    title: 'Vaccination reminder',
    message: 'Mistral\u2019s next vaccination round should be scheduled soon.',
    hoursAgoValue: 45,
    readHoursLater: 5,
    relatedEntityType: 'medical',
    relatedEntityId: 'mistral',
  },
  {
    id: 'nt-016',
    type: 'medical-reminder',
    title: 'Medical reminder',
    message: 'Saffron\u2019s hoof abscess should be checked again in a few days.',
    hoursAgoValue: 10,
    readHoursLater: null,
    relatedEntityType: 'medical',
    relatedEntityId: 'saffron',
  },
  {
    id: 'nt-017',
    type: 'medical-reminder',
    title: 'Medical reminder',
    message: 'Orion\u2019s lameness recheck is approaching.',
    hoursAgoValue: 26,
    readHoursLater: 8,
    relatedEntityType: 'medical',
    relatedEntityId: 'orion',
  },
  {
    id: 'nt-018',
    type: 'training-reminder',
    title: 'Training reminder',
    message: 'Sultan\u2019s 20 km endurance trial run is scheduled for next week.',
    hoursAgoValue: 15,
    readHoursLater: null,
    relatedEntityType: 'training',
    relatedEntityId: 'sultan',
  },
  {
    id: 'nt-019',
    type: 'training-reminder',
    title: 'Training reminder',
    message: 'Duke\u2019s dressage program kicks off this week.',
    hoursAgoValue: 22,
    readHoursLater: null,
    relatedEntityType: 'training',
    relatedEntityId: 'duke',
  },
  {
    id: 'nt-020',
    type: 'training-reminder',
    title: 'Training reminder',
    message: 'Nova\u2019s peak speed test is coming up.',
    hoursAgoValue: 48,
    readHoursLater: 12,
    relatedEntityType: 'training',
    relatedEntityId: 'nova',
  },
  {
    id: 'nt-021',
    type: 'training-reminder',
    title: 'Training reminder',
    message: 'Willow\u2019s ridden lesson prep session is scheduled soon.',
    hoursAgoValue: 33,
    readHoursLater: 6,
    relatedEntityType: 'training',
    relatedEntityId: 'willow',
  },
  {
    id: 'nt-022',
    type: 'system',
    title: 'Scheduled maintenance',
    message: 'SmartHorse will be briefly unavailable overnight for scheduled maintenance.',
    hoursAgoValue: 70,
    readHoursLater: 20,
    relatedEntityType: 'system',
    relatedEntityId: null,
  },
  {
    id: 'nt-023',
    type: 'system',
    title: 'Welcome to SmartHorse',
    message:
      'Your farm workspace is set up. Explore Horses, Medical, Training and Tasks from the sidebar.',
    hoursAgoValue: 200,
    readHoursLater: 5,
    relatedEntityType: 'system',
    relatedEntityId: null,
  },
  {
    id: 'nt-024',
    type: 'system',
    title: 'New feature: Training progress charts',
    message: 'Horse training profiles now show distance and speed progress over recent sessions.',
    hoursAgoValue: 120,
    readHoursLater: 30,
    relatedEntityType: 'system',
    relatedEntityId: null,
  },
  {
    id: 'nt-025',
    type: 'task-due-soon',
    title: 'Task due soon',
    message: 'Renew the stable\u2019s liability insurance is due in 2 weeks.',
    hoursAgoValue: 80,
    readHoursLater: 24,
    relatedEntityType: 'task',
    relatedEntityId: 'tk-022',
  },
  {
    id: 'nt-026',
    type: 'task-assigned',
    title: 'Task assigned to you',
    message: 'Order next month\u2019s hay delivery was assigned to Tarek Nassar.',
    hoursAgoValue: 90,
    readHoursLater: 40,
    relatedEntityType: 'task',
    relatedEntityId: 'tk-015',
  },
  {
    id: 'nt-027',
    type: 'task-completed',
    title: 'Task completed',
    message: 'Bella \u2014 return-to-work assessment was marked complete.',
    hoursAgoValue: 100,
    readHoursLater: 15,
    relatedEntityType: 'task',
    relatedEntityId: 'tk-040',
  },
  {
    id: 'nt-028',
    type: 'task-overdue',
    title: 'Task overdue',
    message: 'Reorganise the tack room shelving is 6 days overdue.',
    hoursAgoValue: 9,
    readHoursLater: null,
    relatedEntityType: 'task',
    relatedEntityId: 'tk-004',
  },
  {
    id: 'nt-029',
    type: 'medical-reminder',
    title: 'Medical reminder',
    message: 'Pearl is due for a deworming rotation soon.',
    hoursAgoValue: 55,
    readHoursLater: 18,
    relatedEntityType: 'medical',
    relatedEntityId: 'pearl',
  },
  {
    id: 'nt-030',
    type: 'training-reminder',
    title: 'Training reminder',
    message: 'Storm\u2019s next race-pace simulation is scheduled soon.',
    hoursAgoValue: 65,
    readHoursLater: 20,
    relatedEntityType: 'training',
    relatedEntityId: 'storm',
  },
  {
    id: 'nt-031',
    type: 'task-due-soon',
    title: 'Task due soon',
    message: 'Weekly stall deep clean is due tomorrow.',
    hoursAgoValue: 4,
    readHoursLater: null,
    relatedEntityType: 'task',
    relatedEntityId: 'tk-020',
  },
  {
    id: 'nt-032',
    type: 'task-assigned',
    title: 'Task assigned to you',
    message: 'Check the perimeter fencing after the storm was assigned to Tarek Nassar.',
    hoursAgoValue: 1,
    readHoursLater: null,
    relatedEntityType: 'task',
    relatedEntityId: 'tk-054',
  },
];

export function buildNotificationMocks(now: Date = new Date()): Notification[] {
  return NOTIFICATION_SPECS.map((spec) => ({
    id: spec.id,
    type: spec.type,
    title: spec.title,
    message: spec.message,
    createdAt: hoursAgo(now, spec.hoursAgoValue),
    readAt:
      spec.readHoursLater === null ? null : hoursAgo(now, spec.hoursAgoValue - spec.readHoursLater),
    relatedEntityType: spec.relatedEntityType,
    relatedEntityId: spec.relatedEntityId,
  }));
}
