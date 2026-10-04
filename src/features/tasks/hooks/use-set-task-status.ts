'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { taskService } from '../task-service';
import { taskRoot } from '../query-keys';
import { notificationRoot } from '@/features/notifications/query-keys';
import type { TaskStatus } from '../types';

/**
 * The one-tap quick actions (Mark complete, Start, Cancel) that let a person
 * change a task's status without opening the full edit form — the flow the
 * spec calls out so completing a task never takes more than one screen.
 */
export function useSetTaskStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: TaskStatus }) =>
      taskService.setTaskStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskRoot });
      queryClient.invalidateQueries({ queryKey: notificationRoot });
    },
  });
}
