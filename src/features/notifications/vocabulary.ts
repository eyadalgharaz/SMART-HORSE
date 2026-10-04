/**
 * One place for the words and controlled lists the Notifications module uses.
 * The list component and the mock data both read from here, so a type's
 * label or icon never drifts between the two.
 */

export const notificationTypeValues = [
  'task-assigned',
  'task-due-soon',
  'task-overdue',
  'task-completed',
  'medical-reminder',
  'vaccination-reminder',
  'training-reminder',
  'system',
] as const;

export type NotificationType = (typeof notificationTypeValues)[number];

export const notificationTypeLabels: Record<NotificationType, string> = {
  'task-assigned': 'Task assigned',
  'task-due-soon': 'Task due soon',
  'task-overdue': 'Task overdue',
  'task-completed': 'Task completed',
  'medical-reminder': 'Medical reminder',
  'vaccination-reminder': 'Vaccination reminder',
  'training-reminder': 'Training reminder',
  system: 'System',
};

export const notificationTypeOptions = notificationTypeValues.map((value) => ({
  value,
  label: notificationTypeLabels[value],
}));

/** What kind of record a notification points back to, if any. */
export const relatedEntityTypeValues = ['task', 'horse', 'medical', 'training', 'system'] as const;

export type RelatedEntityType = (typeof relatedEntityTypeValues)[number];
