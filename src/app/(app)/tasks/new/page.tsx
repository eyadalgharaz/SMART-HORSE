import type { Metadata } from 'next';
import { TaskCreatePage } from '@/features/tasks/components/task-create-page';

export const metadata: Metadata = { title: 'Add task' };

export default function Page() {
  return <TaskCreatePage />;
}
