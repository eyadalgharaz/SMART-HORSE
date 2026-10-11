'use client';

import { useRouter } from 'next/navigation';
import { Button, ButtonLink } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { PageHeader } from '@/components/layout/page-header';
import { useI18n } from '@/i18n';
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
  const { t, tc } = useI18n();

  const loading = isPending || horsesPending || assigneesPending;

  if (loading) {
    return (
      <>
        <PageHeader title={t.tasks.edit.title} />
        <TaskFormSkeleton />
      </>
    );
  }

  if (notFound || !task) {
    return (
      <>
        <PageHeader title={t.tasks.edit.title} />
        <EmptyState
          title={t.tasks.detail.notFoundTitle}
          description={t.tasks.detail.notFoundDescription}
          action={<ButtonLink href="/tasks">{t.tasks.backToTasks}</ButtonLink>}
        />
      </>
    );
  }

  if (isError) {
    return (
      <>
        <PageHeader title={t.tasks.edit.title} />
        <ErrorState
          title={t.tasks.detail.loadErrorTitle}
          description={t.tasks.detail.loadErrorDescription}
          action={
            <Button variant="secondary" onClick={() => void refetch()} loading={isRefetching}>
              {t.common.tryAgain}
            </Button>
          }
        />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title={t.tasks.edit.title}
        description={t.tasks.edit.description(tc(task.title))}
      />
      <TaskForm
        task={task}
        horses={horses}
        assignees={assignees}
        submitLabel={t.common.saveChanges}
        submittingLabel={t.common.savingChanges}
        onCancelHref={`/tasks/${taskId}`}
        onSubmit={async (input) => {
          await mutateAsync(input);
          router.push(savedUrl(`/tasks/${taskId}`, 'updated'));
        }}
      />
    </>
  );
}
