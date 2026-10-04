import { mockTaskService } from './mock/mock-task-service';
import type { TaskService } from './types';

/**
 * Single seam between the Tasks UI and its data.
 *
 * Phase F: mock implementation in the browser.
 * Later:   `export const taskService: TaskService = httpTaskService;`
 *          backed by `/api/v1/tasks`.
 *
 * Components must never import the mock directly.
 */
export const taskService: TaskService = mockTaskService;
