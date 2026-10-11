'use client';

import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout/page-header';
import { useTranslations } from '@/i18n';
import { emptyHorseFilters } from '@/features/horses/types';
import { useHorses } from '@/features/horses/use-horses';
import { useAssignees } from '../hooks/use-assignees';
import { useCreateTask } from '../hooks/use-save-task';
import { TaskForm } from './task-form';
import { TaskFormSkeleton } from './task-skeletons';
import { savedUrl } from './saved-message';

/**
 * Container for /tasks/new. Horses and assignees both load before the form
 * is shown, so the Horse and Assignee selects are never empty for a moment
 * and then repopulated under the person's feet.
 */
export function TaskCreatePage() {
  const router = useRouter();
  const { horses, isPending: horsesPending } = useHorses(emptyHorseFilters);
  const { assignees, isPending: assigneesPending } = useAssignees();
  const { mutateAsync } = useCreateTask();
  const t = useTranslations();

  if (horsesPending || assigneesPending) {
    return (
      <>
        <PageHeader title={t.tasks.create.title} />
        <TaskFormSkeleton />
      </>
    );
  }

  return (
    <>
      <PageHeader title={t.tasks.create.title} description={t.tasks.create.description} />
      <TaskForm
        horses={horses}
        assignees={assignees}
        submitLabel={t.tasks.create.submit}
        submittingLabel={t.tasks.create.submitting}
        onCancelHref="/tasks"
        onSubmit={async (input) => {
          const created = await mutateAsync(input);
          router.push(savedUrl(`/tasks/${created.id}`, 'created'));
        }}
      />
    </>
  );
}
