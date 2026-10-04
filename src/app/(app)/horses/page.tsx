import type { Metadata } from 'next';
import { HorseListPage } from '@/features/horses/components/horse-list-page';

export const metadata: Metadata = { title: 'Horses' };

export default function HorsesPage() {
  return <HorseListPage />;
}
