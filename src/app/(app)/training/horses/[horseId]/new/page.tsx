import type { Metadata } from 'next';
import { TrainingCreatePage } from '@/features/training/components/training-create-page';

export const metadata: Metadata = { title: 'Add training session' };

export default async function Page({ params }: { params: Promise<{ horseId: string }> }) {
  const { horseId } = await params;
  return <TrainingCreatePage horseId={horseId} />;
}
