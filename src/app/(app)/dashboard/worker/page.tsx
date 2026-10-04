import type { Metadata } from 'next';
import { WorkerDashboard } from '@/features/dashboards/worker/components/worker-dashboard';

export const metadata: Metadata = { title: 'Worker Dashboard' };

export default function Page() {
  return <WorkerDashboard />;
}
