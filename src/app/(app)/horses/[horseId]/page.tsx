import type { Metadata } from 'next';
import { HorseProfilePage } from '@/features/horses/components/horse-profile-page';

export const metadata: Metadata = { title: 'Horse profile' };

export default async function HorseDetailPage({
  params,
}: {
  params: Promise<{ horseId: string }>;
}) {
  const { horseId } = await params;
  return <HorseProfilePage horseId={horseId} />;
}
