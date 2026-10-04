import type { Metadata } from 'next';
import { DoctorDashboard } from '@/features/dashboards/doctor/components/doctor-dashboard';

export const metadata: Metadata = { title: 'Doctor Dashboard' };

export default function Page() {
  return <DoctorDashboard />;
}
