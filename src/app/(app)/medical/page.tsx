import type { Metadata } from 'next';
import { MedicalOverviewPage } from '@/features/medical/components/medical-overview-page';

export const metadata: Metadata = { title: 'Health' };

/**
 * The farm's health overview. Data comes from the medical service seam (mock for
 * now), so this route does not change when the real API arrives.
 */
export default function MedicalPage() {
  return <MedicalOverviewPage />;
}
