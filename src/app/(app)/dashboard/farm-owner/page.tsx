import type { Metadata } from 'next';
import { FarmOwnerDashboard } from '@/features/dashboards/farm-owner/components/farm-owner-dashboard';

export const metadata: Metadata = { title: 'Farm Owner Dashboard' };

export default function Page() {
  return <FarmOwnerDashboard />;
}
