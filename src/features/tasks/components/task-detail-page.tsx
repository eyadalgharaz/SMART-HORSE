'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Pencil } from 'lucide-react';
import { Button, ButtonLink } from '@/components/ui/button';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { useI18n } from '@/i18n';
import { formatDueDate, formatDueLabel, formatDueRelative } from '../format';
import { useSetTaskStatus } from '../hooks/use-set-task-status';
import { useTask } from '../hooks/use-task';
import { savedUrl, TasksSavedMessage } from './saved-message';
import { TaskDetailSkeleton } from './task-skeletons';
import {
  TaskCategoryIcon,
  TaskDueBadge,
  TaskPriorityBadge,
  TaskStatusBadge,
} from './task-status-badge';

/**
 * Container for /tasks/[taskId]: everything about one task, and the actions
 * that move it forward — Edit, plus whichever quick status changes make
 * sense for where the task currently stands. A completed or cancelled task
 * shows no status actions: there is nothing further to do to it here.
 */

function BackLink() {
  const { t } = useI18n();
  return (
    <Link
      href="/tasks"
      className="hover:text-ink -ms-1.5 inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-sm font-medium text-stone-600"
    >
      <ChevronLeft className="size-4 rtl:rotate-180" aria-hidden="true" />
      {t.tasks.backToTasks}
    </Link>
  );
}

function Fact({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-md bg-stone-50 p-4">
      <p className="text-sm text-stone-600">{label}</p>
      <p className="mt-1 font-medium break-words">{value}</p>
    </div>
  );
}

export function TaskDetailPage({ taskId }: { taskId: string }) {
  const router = useRouter();
  const { task, isPending, notFound, isError, isRefetching, refetch } = useTask(taskId);
  const { mutate: setStatus, isPending: changingStatus } = useSetTaskStatus();
  const { t, tc, locale } = useI18n();
  const d = t.tasks.detail;

  if (isPending) {
    return (
      <div className="space-y-4">
        <BackLink />
        <TaskDetailSkeleton />
      </div>
    );
  }

  if (notFound || !task) {
    return (
      <div className="space-y-4">
        <BackLink />
        <EmptyState
          title={d.notFoundTitle}
          description={d.notFoundDescription}
          action={<ButtonLink href="/tasks">{t.tasks.backToTasks}</ButtonLink>}
        />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-4">
        <BackLink />
        <ErrorState
          title={d.loadErrorTitle}
          description={d.loadErrorDescription}
          action={
            <Button variant="secondary" onClick={() => void refetch()} loading={isRefetching}>
              {t.common.tryAgain}
            </Button>
          }
        />
      </div>
    );
  }

  const isOpen = task.status === 'pending' || task.status === 'in-progress';

  function complete() {
    setStatus(
      { id: taskId, status: 'completed' },
      { onSuccess: () => router.push(savedUrl(`/tasks/${taskId}`, 'completed')) },
    );
  }

  return (
    <div className="space-y-4">
      <BackLink />
      <TasksSavedMessage />

      <div className="rounded-card border border-stone-200 bg-white p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-3">
            <TaskCategoryIcon category={task.category} />
            <div className="min-w-0">
              <h2 className="text-xl font-semibold break-words sm:text-2xl">{tc(task.title)}</h2>
              {task.description ? (
                <p className="mt-1 text-stone-600">{tc(task.description)}</p>
              ) : null}
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <TaskStatusBadge status={task.status} />
                <TaskPriorityBadge priority={task.priority} />
                <TaskDueBadge task={task} />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <ButtonLink href={`/tasks/${task.id}/edit`} variant="secondary">
              <Pencil className="size-4" aria-hidden="true" />
              {t.common.edit}
            </ButtonLink>

            {isOpen ? (
              <>
                {task.status === 'pending' ? (
                  <Button
                    variant="secondary"
                    loading={changingStatus}
                    onClick={() => setStatus({ id: taskId, status: 'in-progress' })}
                  >
                    {t.tasks.start}
                  </Button>
                ) : null}
                <Button loading={changingStatus} onClick={complete}>
                  {d.markComplete}
                </Button>
                <Button
                  variant="ghost"
                  loading={changingStatus}
                  onClick={() => setStatus({ id: taskId, status: 'cancelled' })}
                >
                  {d.cancelTask}
                </Button>
              </>
            ) : null}
          </div>
        </div>
      </div>

      <Card>
        <CardHeader title={d.details} headingLevel={3} />
        <CardBody className="grid gap-3 sm:grid-cols-3">
          <Fact
            label={d.horse}
            value={
              task.horseId ? (
                <Link
                  href={`/horses/${task.horseId}`}
                  className="hover:text-pasture-600 hover:underline"
                >
                  {task.horseName ? tc(task.horseName) : null}
                </Link>
              ) : (
                t.tasks.farmWide
              )
            }
          />
          <Fact
            label={d.assignee}
            value={task.assigneeName ? tc(task.assigneeName) : t.common.unassigned}
          />
          <Fact
            label={d.due}
            value={
              task.dueAt ? (
                <>
                  {formatDueLabel(task.dueAt, undefined, locale)}
                  <span className="mt-0.5 block text-sm font-normal text-stone-600">
                    {formatDueRelative(task.dueAt, undefined, locale)}
                  </span>
                </>
              ) : (
                t.tasks.noDueDate
              )
            }
          />
          <Fact label={d.repeats} value={t.tasks.recurrence[task.recurrence.frequency]} />
          <Fact label={d.created} value={formatDueDate(task.createdAt, locale)} />
          <Fact
            label={d.completed}
            value={task.completedAt ? formatDueDate(task.completedAt, locale) : d.notCompleted}
          />
        </CardBody>
      </Card>

      {task.notes ? (
        <Card>
          <CardHeader title={d.notes} headingLevel={3} />
          <CardBody>
            <p className="text-sm whitespace-pre-wrap text-stone-700">{tc(task.notes)}</p>
          </CardBody>
        </Card>
      ) : null}
    </div>
  );
}
