import type { Metadata } from 'next';
import { TrainingOverviewPage } from '@/features/training/components/training-overview-page';

export const metadata: Metadata = { title: 'Training' };

/**
 * The farm's training overview. Data comes from the training service seam
 * (mock for now), so this route does not change when the real API arrives.
 */
export default function TrainingPage() {
  return <TrainingOverviewPage />;
}
