'use client';

import type { LucideIcon } from 'lucide-react';
import { Bell, ClipboardList, Dumbbell, HeartPulse, Stethoscope, Syringe } from 'lucide-react';
import { Card, CardHeader } from '@/components/ui/card';
import { useTranslations } from '@/i18n';
import { formatRelativeTimeLocalized, notificationContent } from '../format';
import type { DashboardNotification, NotificationCategory } from '../types';
import { fadeInUp, staggerDelay } from './layout';
import { SectionEmpty } from './section-empty';
import { SectionLink } from './section-link';

const categoryIcons: Record<NotificationCategory, LucideIcon> = {
  vaccination: Syringe,
  appointment: Stethoscope,
  training: Dumbbell,
  health: HeartPulse,
  task: ClipboardList,
};

function NotificationRow({
  notification,
  referenceIso,
  index,
}: {
  notification: DashboardNotification;
  referenceIso: string;
  index: number;
}) {
  const t = useTranslations();
  const Icon = categoryIcons[notification.category];
  const { title, message } = notificationContent(notification, t);

  return (
    <li
      className={`flex gap-3 px-4 py-3.5 transition-colors duration-150 hover:bg-stone-50 sm:px-5 ${fadeInUp} ${staggerDelay(index)}`}
    >
      <span className="bg-forest-50 text-forest-600 flex size-8 shrink-0 items-center justify-center rounded-md">
        <Icon className="size-4" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-2 font-medium">
          <span className="min-w-0">{title}</span>
          {notification.read ? null : (
            <>
              <span className="bg-brass-400 size-2 shrink-0 rounded-full" aria-hidden="true" />
              <span className="sr-only">{t.dashboard.notificationsPanel.unread}</span>
            </>
          )}
        </p>
        <p className="text-sm text-stone-600">{message}</p>
        <time dateTime={notification.createdAt} className="mt-0.5 block text-xs text-stone-600">
          {formatRelativeTimeLocalized(notification.createdAt, referenceIso, t)}
        </time>
      </div>
    </li>
  );
}

export function RecentNotifications({
  notifications,
  referenceIso,
}: {
  notifications: DashboardNotification[];
  referenceIso: string;
}) {
  const t = useTranslations();

  return (
    <Card className={`flex h-full flex-col ${fadeInUp}`}>
      <CardHeader
        title={t.dashboard.notificationsPanel.sectionTitle}
        action={
          <SectionLink href="/notifications" label={t.dashboard.notificationsPanel.viewAllLabel} />
        }
      />
      {notifications.length === 0 ? (
        <SectionEmpty
          icon={Bell}
          title={t.dashboard.notificationsPanel.emptyTitle}
          description={t.dashboard.notificationsPanel.emptyDescription}
        />
      ) : (
        <ul className="divide-y divide-stone-200">
          {notifications.map((notification, index) => (
            <NotificationRow
              key={notification.id}
              notification={notification}
              referenceIso={referenceIso}
              index={index}
            />
          ))}
        </ul>
      )}
    </Card>
  );
}
