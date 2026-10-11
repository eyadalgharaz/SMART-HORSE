'use client';

import Link from 'next/link';
import { CheckCircle2, Circle, Loader2 } from 'lucide-react';
import { useI18n } from '@/i18n';
import { formatDueLabel } from '../format';
import { useSetTaskStatus } from '../hooks/use-set-task-status';
import type { Task } from '../types';
import {
  TaskCategoryLabel,
  TaskDueBadge,
  TaskPriorityBadge,
  TaskStatusBadge,
} from './task-status-badge';

/**
 * The task list. A table from `lg` up, cards below — the same choice the
 * Horses/Medical/Training lists make, for the same reason: a wide table on a
 * phone either scrolls sideways or shrinks past reading.
 *
 * Each row carries the one-tap "Start" / "Mark complete" action the spec
 * calls for, so completing routine work never requires opening the full
 * task. The task's title links to its detail page for everything else.
 */

function QuickAction({ task }: { task: Task }) {
  const { mutate, isPending, variables } = useSetTaskStatus();
  const { t } = useI18n();
  const busy = isPending && variables?.id === task.id;

  if (task.status === 'completed' || task.status === 'cancelled') {
    return <span className="text-sm text-stone-500">{'\u2014'}</span>;
  }

  if (task.status === 'pending') {
    return (
      <button
        type="button"
        disabled={busy}
        onClick={() => mutate({ id: task.id, status: 'in-progress' })}
        className="text-ink-soft hover:border-pasture-500 hover:text-pasture-700 -my-1 inline-flex min-h-8 items-center gap-1.5 rounded-md border border-stone-200 px-2 py-1 text-sm font-medium disabled:opacity-60"
      >
        {busy ? (
          <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
        ) : (
          <Circle className="size-3.5" aria-hidden="true" />
        )}
        {t.tasks.start}
      </button>
    );
  }

  return (
    <button
      type="button"
      disabled={busy}
      onClick={() => mutate({ id: task.id, status: 'completed' })}
      className="text-pasture-600 hover:border-pasture-500 hover:bg-pasture-50 -my-1 inline-flex min-h-8 items-center gap-1.5 rounded-md border border-stone-200 px-2 py-1 text-sm font-medium disabled:opacity-60"
    >
      {busy ? (
        <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
      ) : (
        <CheckCircle2 className="size-3.5" aria-hidden="true" />
      )}
      {t.tasks.complete}
    </button>
  );
}

export function TaskList({ tasks }: { tasks: Task[] }) {
  const { t, tc, locale } = useI18n();
  const l = t.tasks.list;
  return (
    <>
      <div className="rounded-card hidden overflow-hidden border border-stone-200 bg-white lg:block">
        <table className="w-full border-collapse text-start">
          <caption className="sr-only">{l.caption}</caption>
          <thead>
            <tr className="border-b border-stone-200 text-sm text-stone-600">
              <th scope="col" className="px-5 py-3 font-medium">
                {l.task}
              </th>
              <th scope="col" className="hidden px-3 py-3 font-medium xl:table-cell">
                {l.horse}
              </th>
              <th scope="col" className="hidden px-3 py-3 font-medium xl:table-cell">
                {l.assignee}
              </th>
              <th scope="col" className="px-3 py-3 font-medium">
                {l.due}
              </th>
              <th scope="col" className="px-3 py-3 font-medium">
                {l.priority}
              </th>
              <th scope="col" className="px-3 py-3 font-medium">
                {l.status}
              </th>
              <th scope="col" className="px-5 py-3 text-end font-medium">
                <span className="sr-only">{t.common.actions}</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-200">
            {tasks.map((task) => (
              <tr key={task.id} className="hover:bg-stone-50">
                <th scope="row" className="px-5 py-3 align-top font-normal">
                  <Link
                    href={`/tasks/${task.id}`}
                    className="hover:text-pasture-600 block font-medium hover:underline"
                  >
                    {tc(task.title)}
                  </Link>
                  <span className="mt-0.5 block">
                    <TaskCategoryLabel category={task.category} />
                  </span>
                </th>
                <td className="hidden px-3 py-3 align-top xl:table-cell">
                  {task.horseId ? (
                    <Link
                      href={`/horses/${task.horseId}`}
                      className="hover:text-pasture-600 hover:underline"
                    >
                      {task.horseName ? tc(task.horseName) : null}
                    </Link>
                  ) : (
                    <span className="text-stone-500 italic">{t.tasks.farmWide}</span>
                  )}
                </td>
                <td className="hidden px-3 py-3 align-top xl:table-cell">
                  {task.assigneeName ? (
                    tc(task.assigneeName)
                  ) : (
                    <span className="text-stone-500 italic">{t.common.unassigned}</span>
                  )}
                </td>
                <td className="px-3 py-3 align-top whitespace-nowrap">
                  {task.dueAt ? (
                    <span className="space-y-1">
                      <span className="block">{formatDueLabel(task.dueAt, undefined, locale)}</span>
                      <TaskDueBadge task={task} />
                    </span>
                  ) : (
                    <span className="text-stone-500 italic">{t.tasks.noDueDate}</span>
                  )}
                </td>
                <td className="px-3 py-3 align-top">
                  <TaskPriorityBadge priority={task.priority} />
                </td>
                <td className="px-3 py-3 align-top">
                  <TaskStatusBadge status={task.status} />
                </td>
                <td className="px-5 py-3 text-end align-top">
                  <QuickAction task={task} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="grid gap-3 sm:grid-cols-2 lg:hidden">
        {tasks.map((task) => (
          <li key={task.id}>
            <div className="rounded-card border border-stone-200 bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <Link
                    href={`/tasks/${task.id}`}
                    className="hover:text-pasture-600 block truncate font-medium hover:underline"
                  >
                    {tc(task.title)}
                  </Link>
                  <span className="mt-0.5 block">
                    <TaskCategoryLabel category={task.category} />
                  </span>
                </div>
                <TaskStatusBadge status={task.status} />
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 border-t border-stone-200 pt-3 text-sm text-stone-600">
                {task.dueAt ? (
                  <span>{formatDueLabel(task.dueAt, undefined, locale)}</span>
                ) : (
                  <span className="italic">{t.tasks.noDueDate}</span>
                )}
                {task.horseName ? <span className="truncate">{tc(task.horseName)}</span> : null}
                {task.assigneeName ? (
                  <span className="truncate">{tc(task.assigneeName)}</span>
                ) : null}
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-2">
                <TaskPriorityBadge priority={task.priority} />
                <TaskDueBadge task={task} />
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-stone-200 pt-3">
                <Link
                  href={`/tasks/${task.id}`}
                  className="text-pasture-600 text-sm font-medium hover:underline"
                >
                  {t.tasks.viewDetails}
                </Link>
                <QuickAction task={task} />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
