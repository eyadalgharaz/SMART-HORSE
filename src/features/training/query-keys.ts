/**
 * Query keys for the Training module, in one file so the hooks and the save
 * mutation agree on them without importing each other. Everything sits under
 * one root, which is what a save invalidates: a session change can affect the
 * overview, the horse's timeline and its progress chart all at once.
 */
export const trainingRoot = ['training'] as const;

export const trainingKeys = {
  sessions: ['training', 'sessions'] as const,
  session: (id: string) => ['training', 'session', id] as const,
  horseSessions: (horseId: string) => ['training', 'horse-sessions', horseId] as const,
  programs: ['training', 'programs'] as const,
  trainers: ['training', 'trainers'] as const,
};
