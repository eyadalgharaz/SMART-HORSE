import type { Metadata } from 'next';
import { TrainingEditPage } from '@/features/training/components/training-edit-page';

export const metadata: Metadata = { title: 'Edit training session' };

export default async function Page({
  params,
}: {
  params: Promise<{ horseId: string; sessionId: string }>;
}) {
  const { horseId, sessionId } = await params;
  return <TrainingEditPage horseId={horseId} sessionId={sessionId} />;
}
