import type { Metadata } from 'next';
import { MedicalCreatePage } from '@/features/medical/components/medical-create-page';

export const metadata: Metadata = { title: 'Add medical record' };

export default async function Page({ params }: { params: Promise<{ horseId: string }> }) {
  const { horseId } = await params;
  return <MedicalCreatePage horseId={horseId} />;
}
