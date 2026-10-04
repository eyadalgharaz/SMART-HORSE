import type { Metadata } from 'next';
import { StableManagerDashboard } from '@/features/dashboards/stable-manager/components/stable-manager-dashboard';

export const metadata: Metadata = { title: 'Stable Manager Dashboard' };

export default function Page() {
  return <StableManagerDashboard />;
}
