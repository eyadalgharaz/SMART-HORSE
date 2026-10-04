import type { Metadata } from 'next';
import { TaskDetailPage } from '@/features/tasks/components/task-detail-page';

export const metadata: Metadata = { title: 'Task' };

export default async function Page({ params }: { params: Promise<{ taskId: string }> }) {
  const { taskId } = await params;
  return <TaskDetailPage taskId={taskId} />;
}
