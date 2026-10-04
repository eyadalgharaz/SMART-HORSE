'use client';

import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { ButtonLink, Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { PageHeader } from '@/components/layout/page-header';
import { useTranslations } from '@/i18n';
import { cn } from '@/lib/cn';
import {
  formatTaskCount,
  sortTasksByUrgency,
  summarizeTasks,
  tasksForTab,
  type TaskTab,
} from '../format';
import { useTasks } from '../hooks/use-tasks';
import { emptyTaskFilters, type TaskFilters } from '../types';
import { TaskFilterBar } from './task-filter-bar';
import { TaskList } from './task-list';
import { TaskListSkeleton, TaskSummarySkeleton } from './task-skeletons';
import { TaskSummary } from './task-summary';
import { TasksSavedMessage } from './saved-message';

/**
 * Container for /tasks: the farm's daily operational center.
 *
 * Search and filters narrow the whole task set first; the tab underneath
 * then picks which slice of that narrowed set to show (All / Today /
 * Upcoming / Overdue / Completed). A count derived from the same data sits
 * above the list, so it can never disagree with what's shown.
 */

const tabs: { id: TaskTab; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'today', label: 'Today' },
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'overdue', label: 'Overdue' },
  { id: 'completed', label: 'Completed' },
];

export function TasksOverviewPage({ initialHorseId = null }: { initialHorseId?: string | null }) {
  const t = useTranslations();
  const [tab, setTab] = useState<TaskTab>('all');
  const [filters, setFilters] = useState<TaskFilters>({
    ...emptyTaskFilters,
    horseId: initialHorseId,
  });

  const {
    tasks,
    allTasks,
    totalCount,
    horses,
    assignees,
    isPending,
    isError,
    isRefetching,
    refetch,
  } = useTasks(filters);

  const summary = useMemo(() => summarizeTasks(allTasks), [allTasks]);
  const visible = useMemo(() => sortTasksByUrgency(tasksForTab(tasks, tab)), [tasks, tab]);
  const tabTotal = useMemo(() => tasksForTab(allTasks, tab).length, [allTasks, tab]);

  function onKeyDownTabs(event: React.KeyboardEvent<HTMLDivElement>) {
    const index = tabs.findIndex((entry) => entry.id === tab);
    const delta = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
    if (delta === 0) return;
    event.preventDefault();
    const next = tabs[(index + delta + tabs.length) % tabs.length];
    if (next) {
      setTab(next.id);
      document.getElementById(`task-tab-${next.id}`)?.focus();
    }
  }

  if (isError) {
    return (
      <>
        <PageHeader title={t.pages.tasks.title} description={t.pages.tasks.description} />
        <ErrorState
          title={t.pages.tasks.errorTitle}
          description={t.pages.tasks.errorDescription}
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
        title={t.pages.tasks.title}
        description={t.pages.tasks.description}
        action={
          <ButtonLink href="/tasks/new">
            <Plus className="size-4" aria-hidden="true" />
            Add task
          </ButtonLink>
        }
      />

      <div className="space-y-6">
        <TasksSavedMessage />

        {isPending ? <TaskSummarySkeleton /> : <TaskSummary summary={summary} />}

        {totalCount === 0 && !isPending ? (
          <EmptyState
            title="No tasks yet"
            description="Add your first task to start tracking daily stable and farm work."
            action={
              <ButtonLink href="/tasks/new">
                <Plus className="size-4" aria-hidden="true" />
                Add task
              </ButtonLink>
            }
          />
        ) : (
          <div className="space-y-4">
            <TaskFilterBar
              filters={filters}
              onChange={setFilters}
              onReset={() => setFilters(emptyTaskFilters)}
              horses={horses}
              assignees={assignees}
            />

            <div
              role="tablist"
              aria-label="Task views"
              onKeyDown={onKeyDownTabs}
              className="flex gap-1 overflow-x-auto border-b border-stone-200"
            >
              {tabs.map((entry) => {
                const active = entry.id === tab;
                return (
                  <button
                    key={entry.id}
                    id={`task-tab-${entry.id}`}
                    role="tab"
                    type="button"
                    aria-selected={active}
                    aria-controls={`task-panel-${entry.id}`}
                    tabIndex={active ? 0 : -1}
                    onClick={() => setTab(entry.id)}
                    className={cn(
                      '-mb-px border-b-2 px-3 py-2.5 text-sm font-medium whitespace-nowrap transition-colors',
                      active
                        ? 'border-pasture-500 text-pasture-700'
                        : 'hover:text-ink border-transparent text-stone-600',
                    )}
                  >
                    {entry.label}
                  </button>
                );
              })}
            </div>

            <div
              id={`task-panel-${tab}`}
              role="tabpanel"
              aria-labelledby={`task-tab-${tab}`}
              tabIndex={0}
              className="space-y-4"
            >
              {isPending ? (
                <TaskListSkeleton />
              ) : (
                <>
                  <p role="status" className="text-sm text-stone-600">
                    {formatTaskCount(visible.length, tabTotal)}
                  </p>

                  {visible.length === 0 ? (
                    <EmptyState
                      title={emptyTitleFor(tab)}
                      description={emptyDescriptionFor(tab)}
                      action={
                        tab !== 'all' ? (
                          <Button variant="secondary" onClick={() => setTab('all')}>
                            View all tasks
                          </Button>
                        ) : undefined
                      }
                    />
                  ) : (
                    <TaskList tasks={visible} />
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function emptyTitleFor(tab: TaskTab): string {
  switch (tab) {
    case 'today':
      return 'Nothing due today';
    case 'upcoming':
      return 'Nothing upcoming';
    case 'overdue':
      return 'No overdue tasks';
    case 'completed':
      return 'No completed tasks yet';
    default:
      return 'No tasks match your search';
  }
}

function emptyDescriptionFor(tab: TaskTab): string {
  switch (tab) {
    case 'today':
      return 'No tasks are due today.';
    case 'upcoming':
      return 'Nothing scheduled ahead right now.';
    case 'overdue':
      return "You're all caught up — nothing is past its due date.";
    case 'completed':
      return 'Completed tasks will show up here.';
    default:
      return 'Try a different term, or widen the filters.';
  }
}
