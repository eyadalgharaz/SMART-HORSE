import type { Metadata } from 'next';
import { HorseTrainingPage } from '@/features/training/components/horse-training-page';

export const metadata: Metadata = { title: 'Horse training profile' };

export default async function Page({ params }: { params: Promise<{ horseId: string }> }) {
  const { horseId } = await params;
  return <HorseTrainingPage horseId={horseId} />;
}
