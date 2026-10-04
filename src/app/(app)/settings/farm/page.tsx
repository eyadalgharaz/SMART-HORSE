import type { Metadata } from 'next';
import { FarmProfilePage } from '@/features/settings/components/farm-profile-page';

export const metadata: Metadata = { title: 'Farm Profile' };

export default function Page() {
  return <FarmProfilePage />;
}
