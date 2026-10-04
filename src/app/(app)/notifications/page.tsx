import type { Metadata } from 'next';
import { NotificationListPage } from '@/features/notifications/components/notification-list-page';

export const metadata: Metadata = { title: 'Notifications' };

export default function Page() {
  return <NotificationListPage />;
}
