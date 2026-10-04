'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { taskService } from '../task-service';
import { taskRoot } from '../query-keys';
import { notificationRoot } from '@/features/notifications/query-keys';
import type { Task, TaskInput } from '../types';

/**
 * Add and Edit share one mutation hook because they submit the same task;
 * only the service call differs.
 *
 * A saved task can change the overview list, the summary figures, the
 * task's own detail page and — since saving can push a notification — the
 * topbar bell, so the whole Tasks cache is invalidated rather than a
 * hand-picked set of keys that would drift out of date. Notifications
 * invalidate themselves; see `useCreateTask`/`useUpdateTask`'s callers.
 */
function useTaskMutation(mutationFn: (input: TaskInput) => Promise<Task>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskRoot });
      queryClient.invalidateQueries({ queryKey: notificationRoot });
    },
  });
}

export function useCreateTask() {
  return useTaskMutation((input) => taskService.createTask(input));
}

export function useUpdateTask(id: string) {
  return useTaskMutation((input) => taskService.updateTask(id, input));
}
