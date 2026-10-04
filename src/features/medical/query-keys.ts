/**
 * Query keys for the Medical module, in one file so the hooks and the save
 * mutation agree on them without importing each other. Everything sits under one
 * root, which is what a save invalidates: vaccinations and upcoming events are
 * derived from records, so a single change can affect every one of them.
 */
export const medicalRoot = ['medical'] as const;

export const medicalKeys = {
  records: ['medical', 'records'] as const,
  record: (id: string) => ['medical', 'record', id] as const,
  history: (horseId: string) => ['medical', 'history', horseId] as const,
  health: ['medical', 'health'] as const,
  vaccinations: (horseId?: string) => ['medical', 'vaccinations', horseId ?? 'all'] as const,
  events: (horseId?: string) => ['medical', 'events', horseId ?? 'all'] as const,
};
