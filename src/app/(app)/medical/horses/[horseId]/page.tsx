import type { Metadata } from 'next';
import { HorseMedicalPage } from '@/features/medical/components/horse-medical-page';

export const metadata: Metadata = { title: 'Horse medical history' };

export default async function Page({ params }: { params: Promise<{ horseId: string }> }) {
  const { horseId } = await params;
  return <HorseMedicalPage horseId={horseId} />;
}
