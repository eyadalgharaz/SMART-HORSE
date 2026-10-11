'use client';

import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { ButtonLink, Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { PageHeader } from '@/components/layout/page-header';
import { useI18n, useTabArrowKeys } from '@/i18n';
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

const tabIds: readonly TaskTab[] = ['all', 'today', 'upcoming', 'overdue', 'completed'];
const tabElementId = (id: TaskTab) => `task-tab-${id}`;

export function TasksOverviewPage({ initialHorseId = null }: { initialHorseId?: string | null }) {
  const { t, locale } = useI18n();
  const o = t.tasks.overview;
  const [tab, setTab] = useState<TaskTab>('all');
  const tabs = tabIds.map((id) => ({ id, label: o.tabs[id] }));
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

  const onKeyDownTabs = useTabArrowKeys(tabIds, tab, setTab, tabElementId);

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
            {t.tasks.addTask}
          </ButtonLink>
        }
      />

      <div className="space-y-6">
        <TasksSavedMessage />

        {isPending ? <TaskSummarySkeleton /> : <TaskSummary summary={summary} />}

        {totalCount === 0 && !isPending ? (
          <EmptyState
            title={o.emptyTitle}
            description={o.emptyDescription}
            action={
              <ButtonLink href="/tasks/new">
                <Plus className="size-4" aria-hidden="true" />
                {t.tasks.addTask}
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
              aria-label={o.tabsLabel}
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
                    {formatTaskCount(visible.length, tabTotal, locale)}
                  </p>

                  {visible.length === 0 ? (
                    <EmptyState
                      title={o.tabEmpty[tab].title}
                      description={o.tabEmpty[tab].description}
                      action={
                        tab !== 'all' ? (
                          <Button variant="secondary" onClick={() => setTab('all')}>
                            {o.viewAll}
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
