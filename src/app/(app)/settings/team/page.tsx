import type { Metadata } from 'next';
import { TeamMembersPage } from '@/features/settings/components/team-members-page';

export const metadata: Metadata = { title: 'Team Members' };

export default function Page() {
  return <TeamMembersPage />;
}
