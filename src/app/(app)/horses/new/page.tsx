import type { Metadata } from 'next';
import { HorseCreatePage } from '@/features/horses/components/horse-create-page';

export const metadata: Metadata = { title: 'Add horse' };

export default function NewHorsePage() {
  return <HorseCreatePage />;
}
