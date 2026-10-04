import type { Metadata } from 'next';
import { MedicalEditPage } from '@/features/medical/components/medical-edit-page';

export const metadata: Metadata = { title: 'Edit medical record' };

export default async function Page({
  params,
}: {
  params: Promise<{ horseId: string; recordId: string }>;
}) {
  const { horseId, recordId } = await params;
  return <MedicalEditPage horseId={horseId} recordId={recordId} />;
}
