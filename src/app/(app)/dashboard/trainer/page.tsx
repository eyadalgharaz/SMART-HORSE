import type { Metadata } from 'next';
import { TrainerDashboard } from '@/features/dashboards/trainer/components/trainer-dashboard';

export const metadata: Metadata = { title: 'Trainer Dashboard' };

export default function Page() {
  return <TrainerDashboard />;
}
