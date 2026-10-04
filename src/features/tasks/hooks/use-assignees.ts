'use client';

import { useQuery } from '@tanstack/react-query';
import { taskService } from '../task-service';
import { taskKeys } from '../query-keys';

/** The known team members, for filters and the task form's assignee select. */
export function useAssignees() {
  const query = useQuery({
    queryKey: taskKeys.assignees,
    queryFn: () => taskService.listAssignees(),
  });

  return {
    assignees: query.data ?? [],
    isPending: query.isPending,
    isError: query.isError,
  };
}
