import type { Metadata } from 'next';
import { HorseEditPage } from '@/features/horses/components/horse-edit-page';

export const metadata: Metadata = { title: 'Edit horse' };

export default async function EditHorsePage({ params }: { params: Promise<{ horseId: string }> }) {
  const { horseId } = await params;
  return <HorseEditPage horseId={horseId} />;
}
