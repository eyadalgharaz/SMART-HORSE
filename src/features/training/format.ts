import { calendarDayDifference, pluralize } from '@/features/dashboard/format';
import { toDateInputValue } from '@/features/horses/format';
import type {
  HorseOption,
  Trainer,
  TrainingProgram,
  TrainingSession,
  TrainingSessionFilters,
} from './types';
import { WEEK_WINDOW_DAYS } from './vocabulary';

/**
 * Display formatting, filtering and derived figures for training data. Pure
 * functions only, so every label and every rule is testable without
 * rendering anything. Anything that depends on "today" takes a `reference`
 * date, which defaults to now and is fixed in tests.
 */

/* ------------------------------------------------------------------ */
/* Dates and metrics                                                    */
/* ------------------------------------------------------------------ */

/** Whole calendar days from `reference` to `iso` in local time (tomorrow = 1). */
export function dayOffset(iso: string, reference: Date = new Date()): number {
  return calendarDayDifference(new Date(iso), reference);
}

/** "18 Sep 2026" */
export function formatSessionDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/** "18 Sep" — the year is carried by the timeline's year heading. */
export function formatShortDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

/** "9:30 AM" */
export function formatSessionTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-GB', { hour: 'numeric', minute: '2-digit' });
}

/** "18 Sep 2026, 9:30 AM" */
export function formatSessionDateTime(iso: string): string {
  return `${formatSessionDate(iso)}, ${formatSessionTime(iso)}`;
}

/** "Today", "Tomorrow", "Yesterday", otherwise "18 Sep 2026". */
export function formatDateLabel(iso: string, reference: Date = new Date()): string {
  const difference = dayOffset(iso, reference);
  if (difference === 0) return 'Today';
  if (difference === 1) return 'Tomorrow';
  if (difference === -1) return 'Yesterday';
  return formatSessionDate(iso);
}

/** "42 min", "1 hr 15 min", "2 hr" */
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `${hours} hr` : `${hours} hr ${rest} min`;
}

/** "8.4 km" */
export function formatDistance(km: number | null): string | null {
  if (km === null) return null;
  return `${km.toFixed(1)} km`;
}

/** "12.0 km/h" */
export function formatSpeed(kmh: number | null): string | null {
  if (kmh === null) return null;
  return `${kmh.toFixed(1)} km/h`;
}

/** "Willow, Duke +1" — a short list that never grows past `max` names. */
export function formatNameList(names: string[], max = 2): string {
  if (names.length <= max) return names.join(', ');
  return `${names.slice(0, max).join(', ')} +${names.length - max}`;
}

/* ------------------------------------------------------------------ */
/* Sessions                                                             */
/* ------------------------------------------------------------------ */

/** Newest first; sessions at the same instant fall back to when they were entered. */
export function sortSessionsNewestFirst(sessions: TrainingSession[]): TrainingSession[] {
  return [...sessions].sort(
    (a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime() ||
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

/** Soonest first — for "what's coming up" lists. */
export function sortSessionsSoonestFirst(sessions: TrainingSession[]): TrainingSession[] {
  return [...sessions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

/** The horses named in a collection, alphabetical — a filter's option list. */
export function horsesOf(items: { horseId: string; horseName: string }[]): HorseOption[] {
  const byId = new Map<string, string>();
  for (const item of items) byId.set(item.horseId, item.horseName);
  return [...byId.entries()]
    .map(([id, name]) => ({ id, name }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

/** The trainers named in a collection, alphabetical — a filter's option list. */
export function trainersOf(items: { trainerId: string; trainerName: string }[]): Trainer[] {
  const byId = new Map<string, string>();
  for (const item of items) byId.set(item.trainerId, item.trainerName);
  return [...byId.entries()]
    .map(([id, name]) => ({ id, name }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

/** Sessions grouped under their calendar year, newest year first. Input must already be sorted newest first. */
export function groupSessionsByYear(
  sessions: TrainingSession[],
): { year: number; sessions: TrainingSession[] }[] {
  const groups: { year: number; sessions: TrainingSession[] }[] = [];
  for (const session of sessions) {
    const year = new Date(session.date).getFullYear();
    const last = groups[groups.length - 1];
    if (last && last.year === year) last.sessions.push(session);
    else groups.push({ year, sessions: [session] });
  }
  return groups;
}

function matchesSearch(session: TrainingSession, search: string): boolean {
  const term = search.trim().toLowerCase();
  if (!term) return true;
  return [session.horseName, session.trainerName, session.title, session.notes]
    .concat(session.trainerNotes ?? '')
    .some((field) => field?.toLowerCase().includes(term));
}

function withinDateRange(session: TrainingSession, from: string, to: string): boolean {
  const day = toDateInputValue(session.date);
  return (!from || day >= from) && (!to || day <= to);
}

/**
 * Applies every active filter — they narrow the list together, never instead
 * of each other. When the API arrives this rule moves into the query string;
 * the hook keeps the same signature, so no component changes.
 */
export function filterTrainingSessions(
  sessions: TrainingSession[],
  filters: TrainingSessionFilters,
): TrainingSession[] {
  return sessions.filter(
    (session) =>
      matchesSearch(session, filters.search) &&
      (filters.horseId === null || session.horseId === filters.horseId) &&
      (filters.trainerId === null || session.trainerId === filters.trainerId) &&
      (filters.trainingType === null || session.trainingType === filters.trainingType) &&
      (filters.status === null || session.status === filters.status) &&
      withinDateRange(session, filters.dateFrom, filters.dateTo),
  );
}

export function hasActiveTrainingFilters(filters: TrainingSessionFilters): boolean {
  return Boolean(
    filters.search.trim() ||
    filters.horseId !== null ||
    filters.trainerId !== null ||
    filters.trainingType !== null ||
    filters.status !== null ||
    filters.dateFrom ||
    filters.dateTo,
  );
}

/** Filters behind the mobile "Filters" button — search is always visible, so it is not counted. */
export function activeTrainingFilterCount(filters: TrainingSessionFilters): number {
  return (
    [filters.horseId, filters.trainerId, filters.trainingType, filters.status].filter(Boolean)
      .length + (filters.dateFrom || filters.dateTo ? 1 : 0)
  );
}

/** "40 sessions", "1 session", or "Showing 8 of 40 sessions" while filters are on. */
export function formatSessionCount(shown: number, total: number): string {
  const noun = pluralize(total, 'session');
  return shown === total ? `${total} ${noun}` : `Showing ${shown} of ${total} ${noun}`;
}

/* ------------------------------------------------------------------ */
/* Farm-wide overview summary                                          */
/* ------------------------------------------------------------------ */

export interface TrainingOverviewSummary {
  activePrograms: number;
  sessionsThisWeek: number;
  completedSessions: number;
  horsesInTraining: number;
}

/**
 * The four figures at the top of /training, derived from the same
 * collections the tabs below show, so a figure can never disagree with the
 * list below it.
 */
export function summarizeTrainingOverview(
  input: { sessions: TrainingSession[]; programs: TrainingProgram[] },
  reference: Date = new Date(),
): TrainingOverviewSummary {
  const activePrograms = input.programs.filter((program) => program.status === 'active').length;

  const sessionsThisWeek = input.sessions.filter((session) => {
    const offset = dayOffset(session.date, reference);
    return (
      offset >= -WEEK_WINDOW_DAYS && offset <= WEEK_WINDOW_DAYS && session.status !== 'cancelled'
    );
  }).length;

  const completedSessions = input.sessions.filter(
    (session) => session.status === 'completed',
  ).length;

  const horsesInTraining = new Set(
    input.sessions
      .filter((session) => {
        const offset = dayOffset(session.date, reference);
        return offset >= -WEEK_WINDOW_DAYS && offset <= 0;
      })
      .map((session) => session.horseId),
  ).size;

  return { activePrograms, sessionsThisWeek, completedSessions, horsesInTraining };
}

/* ------------------------------------------------------------------ */
/* Per-horse summary                                                    */
/* ------------------------------------------------------------------ */

export interface HorseTrainingSummary {
  totalSessions: number;
  completedSessions: number;
  currentProgram: TrainingProgram | null;
  lastSession: TrainingSession | null;
  nextSession: TrainingSession | null;
}

/**
 * The figures shown at the top of a horse's training profile, derived from
 * that horse's own sessions and programs so they can never disagree with the
 * timeline underneath them.
 */
export function summarizeHorseTraining(
  sessions: TrainingSession[],
  programs: TrainingProgram[],
  reference: Date = new Date(),
): HorseTrainingSummary {
  const completed = sessions.filter((session) => session.status === 'completed');
  const past = sortSessionsNewestFirst(
    sessions.filter(
      (session) => dayOffset(session.date, reference) <= 0 && session.status !== 'cancelled',
    ),
  );
  const upcoming = sortSessionsSoonestFirst(
    sessions.filter(
      (session) => dayOffset(session.date, reference) > 0 && session.status === 'scheduled',
    ),
  );
  const active = programs.find((program) => program.status === 'active') ?? null;

  return {
    totalSessions: sessions.length,
    completedSessions: completed.length,
    currentProgram: active,
    lastSession: past[0] ?? null,
    nextSession: upcoming[0] ?? null,
  };
}

/* ------------------------------------------------------------------ */
/* Progress over time                                                   */
/* ------------------------------------------------------------------ */

export interface ProgressPoint {
  sessionId: string;
  date: string;
  distanceKm: number | null;
  avgSpeedKmh: number | null;
}

/**
 * Completed sessions with tracked metrics, oldest first, capped to the most
 * recent `limit` — what the progress chart plots. A session with neither
 * metric recorded has nothing to plot and is left out.
 */
export function progressSeries(sessions: TrainingSession[], limit = 10): ProgressPoint[] {
  const withMetrics = sessions.filter(
    (session) =>
      session.status === 'completed' &&
      (session.distanceKm !== null || session.avgSpeedKmh !== null),
  );
  return sortSessionsNewestFirst(withMetrics)
    .slice(0, limit)
    .reverse()
    .map((session) => ({
      sessionId: session.id,
      date: session.date,
      distanceKm: session.distanceKm,
      avgSpeedKmh: session.avgSpeedKmh,
    }));
}

/* ------------------------------------------------------------------ */
/* Programs                                                             */
/* ------------------------------------------------------------------ */

/** Programs for one horse, active first, then by most recently started. */
export function sortProgramsForHorse(programs: TrainingProgram[]): TrainingProgram[] {
  const rank: Record<string, number> = { active: 0, planned: 1, paused: 2, completed: 3 };
  return [...programs].sort(
    (a, b) =>
      (rank[a.status] ?? 9) - (rank[b.status] ?? 9) ||
      new Date(b.startDate).getTime() - new Date(a.startDate).getTime(),
  );
}
