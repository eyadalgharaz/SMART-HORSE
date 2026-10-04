/**
 * Query keys for the Tasks module, in one file so the hooks and the save
 * mutations agree on them without importing each other. Everything sits
 * under one root, which is what a save invalidates: a task change can affect
 * the overview list, its own detail page and the summary figures all at once.
 */
export const taskRoot = ['tasks'] as const;

export const taskKeys = {
  list: ['tasks', 'list'] as const,
  detail: (id: string) => ['tasks', 'detail', id] as const,
  assignees: ['tasks', 'assignees'] as const,
};
