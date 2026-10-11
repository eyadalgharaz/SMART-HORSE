'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useI18n } from '@/i18n/use-i18n';
import { assigneesOf, filterTasks, horsesOf } from '../format';
import { taskService } from '../task-service';
import { taskKeys } from '../query-keys';
import type { TaskFilters } from '../types';

/**
 * Loads the farm's tasks through the service seam and applies the active
 * filters. Filtering is a pure function over the loaded page, which keeps
 * typing instant and needs no debounce; when the real API arrives the
 * filters move into its query string and only this hook changes.
 */
export function useTasks(filters: TaskFilters) {
  const query = useQuery({
    queryKey: taskKeys.list,
    queryFn: () => taskService.listTasks(),
  });

  const { tc } = useI18n();
  const all = useMemo(() => query.data ?? [], [query.data]);
  const tasks = useMemo(() => filterTasks(all, filters, tc), [all, filters, tc]);
  const horses = useMemo(() => horsesOf(all), [all]);
  const assignees = useMemo(() => assigneesOf(all), [all]);

  return {
    tasks,
    /** Every task on file, ignoring filters and tab — what the summary counts. */
    allTasks: all,
    totalCount: all.length,
    horses,
    assignees,
    isPending: query.isPending,
    isError: query.isError,
    isRefetching: query.isRefetching,
    refetch: query.refetch,
  };
}
