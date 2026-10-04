import type { Metadata } from 'next';
import { TasksOverviewPage } from '@/features/tasks/components/task-overview-page';

export const metadata: Metadata = { title: 'Tasks' };

/**
 * Reads `?horseId=` directly as a server-rendered prop (rather than via
 * useSearchParams on the client) so a link from a Horse profile can
 * pre-filter the task list without an extra Suspense boundary.
 */
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ horseId?: string }>;
}) {
  const { horseId } = await searchParams;
  return <TasksOverviewPage initialHorseId={horseId ?? null} />;
}
