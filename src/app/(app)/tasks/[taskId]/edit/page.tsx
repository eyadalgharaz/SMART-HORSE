import type { Metadata } from 'next';
import { TaskEditPage } from '@/features/tasks/components/task-edit-page';

export const metadata: Metadata = { title: 'Edit task' };

export default async function Page({ params }: { params: Promise<{ taskId: string }> }) {
  const { taskId } = await params;
  return <TaskEditPage taskId={taskId} />;
}
