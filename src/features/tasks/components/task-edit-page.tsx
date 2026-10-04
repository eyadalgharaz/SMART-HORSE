'use client';

import { useRouter } from 'next/navigation';
import { Button, ButtonLink } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { PageHeader } from '@/components/layout/page-header';
import { emptyHorseFilters } from '@/features/horses/types';
import { useHorses } from '@/features/horses/use-horses';
import { useAssignees } from '../hooks/use-assignees';
import { useTask } from '../hooks/use-task';
import { useUpdateTask } from '../hooks/use-save-task';
import { TaskForm } from './task-form';
import { TaskFormSkeleton } from './task-skeletons';
import { savedUrl } from './saved-message';

/**
 * Container for /tasks/[taskId]/edit. Reuses the create form completely —
 * same fields, same validation, same layout — and only supplies different
 * starting values and a different submit.
 */
export function TaskEditPage({ taskId }: { taskId: string }) {
  const router = useRouter();
  const { task, isPending, notFound, isError, isRefetching, refetch } = useTask(taskId);
  const { horses, isPending: horsesPending } = useHorses(emptyHorseFilters);
  const { assignees, isPending: assigneesPending } = useAssignees();
  const { mutateAsync } = useUpdateTask(taskId);

  const loading = isPending || horsesPending || assigneesPending;

  if (loading) {
    return (
      <>
        <PageHeader title="Edit task" />
        <TaskFormSkeleton />
      </>
    );
  }

  if (notFound || !task) {
    return (
      <>
        <PageHeader title="Edit task" />
        <EmptyState
          title="Task not found"
          description="This task doesn't exist, or it has been removed."
          action={<ButtonLink href="/tasks">Back to tasks</ButtonLink>}
        />
      </>
    );
  }

  if (isError) {
    return (
      <>
        <PageHeader title="Edit task" />
        <ErrorState
          title="We couldn't load this task"
          description="Something went wrong while loading the task. Check your connection and try again."
          action={
            <Button variant="secondary" onClick={() => void refetch()} loading={isRefetching}>
              Try again
            </Button>
          }
        />
      </>
    );
  }

  return (
    <>
      <PageHeader title="Edit task" description={`Update "${task.title}".`} />
      <TaskForm
        task={task}
        horses={horses}
        assignees={assignees}
        submitLabel="Save changes"
        submittingLabel="Saving changes"
        onCancelHref={`/tasks/${taskId}`}
        onSubmit={async (input) => {
          await mutateAsync(input);
          router.push(savedUrl(`/tasks/${taskId}`, 'updated'));
        }}
      />
    </>
  );
}
