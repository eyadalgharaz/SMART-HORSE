import { calendarDayDifference, pluralize } from '@/features/dashboard/format';
import { toDateInputValue } from '@/features/horses/format';
import type {
  AttachmentType,
  HorseHealth,
  HorseOption,
  MedicalRecord,
  MedicalRecordFilters,
  UpcomingMedicalEvent,
  Vaccination,
  VaccinationFilters,
  VaccinationStatus,
} from './types';
import { attentionStatuses, DUE_SOON_DAYS, SUMMARY_WINDOW_DAYS, vetVisitKinds } from './vocabulary';

/**
 * Display formatting, filtering and status calculation for medical data. Pure
 * functions only, so every label and every rule is testable without rendering
 * anything. Anything that depends on "today" takes a `reference` date, which
 * defaults to now and is fixed in tests.
 */

/* ------------------------------------------------------------------ */
/* Dates                                                               */
/* ------------------------------------------------------------------ */

/** Whole calendar days from `reference` to `iso` in local time (tomorrow = 1). */
export function dayOffset(iso: string, reference: Date = new Date()): number {
  return calendarDayDifference(new Date(iso), reference);
}

/** "18 Sep 2026" */
export function formatRecordDate(iso: string): string {
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

/** "Today", "Tomorrow", "Yesterday", otherwise "18 Sep 2026". */
export function formatDateLabel(iso: string, reference: Date = new Date()): string {
  const difference = dayOffset(iso, reference);
  if (difference === 0) return 'Today';
  if (difference === 1) return 'Tomorrow';
  if (difference === -1) return 'Yesterday';
  return formatRecordDate(iso);
}

/**
 * "Today", "Tomorrow", "In 5 days", "3 weeks ago", "2 months ago" — how far a
 * date is from now, coarser the further it is, because "In 43 days" says less
 * than "In 6 weeks".
 */
export function formatRelativeDay(iso: string, reference: Date = new Date()): string {
  const difference = dayOffset(iso, reference);
  if (difference === 0) return 'Today';
  if (difference === 1) return 'Tomorrow';
  if (difference === -1) return 'Yesterday';

  const future = difference > 0;
  const distance = Math.abs(difference);

  let amount: string;
  if (distance < 14) amount = `${distance} days`;
  else if (distance < 60) {
    const weeks = Math.round(distance / 7);
    amount = `${weeks} ${pluralize(weeks, 'week')}`;
  } else if (distance < 730) {
    const months = Math.round(distance / 30.4);
    amount = `${months} ${pluralize(months, 'month')}`;
  } else {
    const years = Math.floor(distance / 365);
    amount = `${years} years`;
  }

  return future ? `In ${amount}` : `${amount} ago`;
}

/** "2.4 MB", "310 KB", "512 B". */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** "Willow, Duke +1" — a short list that never grows past `max` names. */
export function formatNameList(names: string[], max = 2): string {
  if (names.length <= max) return names.join(', ');
  return `${names.slice(0, max).join(', ')} +${names.length - max}`;
}

/* ------------------------------------------------------------------ */
/* Attachments                                                         */
/* ------------------------------------------------------------------ */

/**
 * A sensible starting type for a file the person just chose; they can correct it
 * in the picker. Purely a convenience — the file's contents are never read.
 */
export function attachmentTypeFor(file: { name: string; type: string }): AttachmentType {
  const name = file.name.toLowerCase();
  if (/x-?ray|radiograph|\.dcm$/.test(name)) return 'x-ray';
  if (/lab|blood|panel|histolog|cytolog|culture|result/.test(name)) return 'lab-result';
  if (file.type.startsWith('image/')) return 'image';
  return 'document';
}

/* ------------------------------------------------------------------ */
/* Records                                                             */
/* ------------------------------------------------------------------ */

/** Newest first; records on the same day fall back to when they were entered. */
export function sortRecordsNewestFirst(records: MedicalRecord[]): MedicalRecord[] {
  return [...records].sort(
    (a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime() ||
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

/**
 * The horses named in a collection, alphabetical — a filter's option list. Works
 * on records and on vaccinations alike, so a filter never offers a horse with no
 * matches in the list it sits above.
 */
export function horsesOf(items: { horseId: string; horseName: string }[]): HorseOption[] {
  const byId = new Map<string, string>();
  for (const item of items) byId.set(item.horseId, item.horseName);
  return [...byId.entries()]
    .map(([id, name]) => ({ id, name }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

/** Records grouped under their calendar year, newest year first. Input must already be sorted. */
export function groupRecordsByYear(
  records: MedicalRecord[],
): { year: number; records: MedicalRecord[] }[] {
  const groups: { year: number; records: MedicalRecord[] }[] = [];
  for (const record of records) {
    const year = new Date(record.date).getFullYear();
    const last = groups[groups.length - 1];
    if (last && last.year === year) last.records.push(record);
    else groups.push({ year, records: [record] });
  }
  return groups;
}

/**
 * One short line describing what a record is about, for the timeline and lists.
 * Picks the most specific thing the record has and never invents text for a
 * record that has nothing to say.
 */
export function recordSummary(record: MedicalRecord): string | null {
  if (record.recordType === 'vaccination' && record.vaccine) {
    return record.vaccine.nextDueDate
      ? `${record.vaccine.name} · next dose due ${formatRecordDate(record.vaccine.nextDueDate)}`
      : record.vaccine.name;
  }
  return (
    record.diagnosis ??
    record.treatment ??
    (record.medication ? `Medication: ${record.medication}` : null) ??
    record.notes
  );
}

function matchesSearch(record: MedicalRecord, search: string): boolean {
  const term = search.trim().toLowerCase();
  if (!term) return true;
  return [
    record.horseName,
    record.title,
    record.diagnosis,
    record.veterinarian,
    record.medication,
    record.vaccine?.name,
  ].some((field) => field?.toLowerCase().includes(term));
}

function withinDateRange(record: MedicalRecord, from: string, to: string): boolean {
  // Compared as local calendar days, so a record dated late in the evening never
  // slips into the next day's range because of the time zone.
  const day = toDateInputValue(record.date);
  return (!from || day >= from) && (!to || day <= to);
}

/**
 * Applies every active filter — they narrow the list together, never instead of
 * each other. When the API arrives this rule moves into the query string; the
 * hook keeps the same signature, so no component changes.
 */
export function filterMedicalRecords(
  records: MedicalRecord[],
  filters: MedicalRecordFilters,
): MedicalRecord[] {
  return records.filter(
    (record) =>
      matchesSearch(record, filters.search) &&
      (filters.horseId === null || record.horseId === filters.horseId) &&
      (filters.recordType === null || record.recordType === filters.recordType) &&
      (filters.status === null || record.status === filters.status) &&
      withinDateRange(record, filters.dateFrom, filters.dateTo),
  );
}

export function hasActiveMedicalFilters(filters: MedicalRecordFilters): boolean {
  return Boolean(
    filters.search.trim() ||
    filters.horseId !== null ||
    filters.recordType !== null ||
    filters.status !== null ||
    filters.dateFrom ||
    filters.dateTo,
  );
}

/** Filters behind the mobile "Filters" button — search is always visible, so it is not counted. */
export function activeMedicalFilterCount(filters: MedicalRecordFilters): number {
  return (
    [filters.horseId, filters.recordType, filters.status].filter(Boolean).length +
    (filters.dateFrom || filters.dateTo ? 1 : 0)
  );
}

/** "46 records", "1 record", or "Showing 8 of 46 records" while filters are on. */
export function formatRecordCount(shown: number, total: number): string {
  const noun = pluralize(total, 'record');
  return shown === total ? `${total} ${noun}` : `Showing ${shown} of ${total} ${noun}`;
}

/** The most recent completed visit that a vet attended, or null if there has not been one. */
export function lastVetVisit(
  records: MedicalRecord[],
  reference: Date = new Date(),
): MedicalRecord | null {
  const visits = records.filter(
    (record) =>
      record.status !== 'scheduled' &&
      record.veterinarian !== null &&
      dayOffset(record.date, reference) <= 0,
  );
  return sortRecordsNewestFirst(visits)[0] ?? null;
}

/**
 * Records with a follow-up still to do, soonest first. A completed record's
 * follow-up date is history, not an open item.
 */
export function openFollowUps(records: MedicalRecord[]): MedicalRecord[] {
  return records
    .filter((record) => record.followUpDate !== null && record.status !== 'completed')
    .sort(
      (a, b) => new Date(a.followUpDate ?? 0).getTime() - new Date(b.followUpDate ?? 0).getTime(),
    );
}

/* ------------------------------------------------------------------ */
/* Vaccinations                                                        */
/* ------------------------------------------------------------------ */

/**
 * Status of a vaccination, calculated from its dates against `reference`:
 *
 *   overdue     the next dose was due before today
 *   scheduled   a dose is booked for today or later
 *   due-soon    the next dose falls within DUE_SOON_DAYS
 *   up-to-date  nothing is due in that window
 *
 * Overdue is checked first on purpose. A dose that is late stays flagged even
 * when a booking exists — a safety signal should not be hidden by an
 * appointment that has not happened yet — and the booking is still shown on the
 * row.
 */
export function vaccinationStatus(
  vaccination: Pick<Vaccination, 'nextDueDate' | 'scheduledFor'>,
  reference: Date = new Date(),
): VaccinationStatus {
  const dueIn = vaccination.nextDueDate ? dayOffset(vaccination.nextDueDate, reference) : null;
  if (dueIn !== null && dueIn < 0) return 'overdue';
  if (vaccination.scheduledFor && dayOffset(vaccination.scheduledFor, reference) >= 0) {
    return 'scheduled';
  }
  if (dueIn !== null && dueIn <= DUE_SOON_DAYS) return 'due-soon';
  return 'up-to-date';
}

/** The date that matters for a vaccination right now: its booking if booked, else its due date. */
export function vaccinationTargetDate(
  vaccination: Vaccination,
  reference: Date = new Date(),
): string | null {
  return vaccinationStatus(vaccination, reference) === 'scheduled'
    ? vaccination.scheduledFor
    : vaccination.nextDueDate;
}

const statusRank: Record<VaccinationStatus, number> = {
  overdue: 0,
  'due-soon': 1,
  scheduled: 2,
  'up-to-date': 3,
};

/** Most urgent first, then by the date that matters, so the top of the list is what to act on. */
export function sortVaccinations(
  vaccinations: Vaccination[],
  reference: Date = new Date(),
): Vaccination[] {
  const key = (vaccination: Vaccination) => {
    const target = vaccinationTargetDate(vaccination, reference);
    return target ? new Date(target).getTime() : Number.POSITIVE_INFINITY;
  };
  return [...vaccinations].sort(
    (a, b) =>
      statusRank[vaccinationStatus(a, reference)] - statusRank[vaccinationStatus(b, reference)] ||
      key(a) - key(b) ||
      a.horseName.localeCompare(b.horseName) ||
      a.vaccineName.localeCompare(b.vaccineName),
  );
}

export function filterVaccinations(
  vaccinations: Vaccination[],
  filters: VaccinationFilters,
  reference: Date = new Date(),
): Vaccination[] {
  return vaccinations.filter(
    (vaccination) =>
      (filters.horseId === null || vaccination.horseId === filters.horseId) &&
      (filters.status === null || vaccinationStatus(vaccination, reference) === filters.status),
  );
}

export function hasActiveVaccinationFilters(filters: VaccinationFilters): boolean {
  return filters.horseId !== null || filters.status !== null;
}

/** "16 vaccinations", "1 vaccination", or "Showing 3 of 16 vaccinations". */
export function formatVaccinationCount(shown: number, total: number): string {
  const noun = pluralize(total, 'vaccination');
  return shown === total ? `${total} ${noun}` : `Showing ${shown} of ${total} ${noun}`;
}

/**
 * The vaccination to look at first for a horse: the most urgent one that has a
 * date. A course with nothing further planned has no "next" and is skipped.
 */
export function nextVaccination(
  vaccinations: Vaccination[],
  reference: Date = new Date(),
): Vaccination | null {
  return (
    sortVaccinations(vaccinations, reference).find(
      (vaccination) => vaccinationTargetDate(vaccination, reference) !== null,
    ) ?? null
  );
}

/* ------------------------------------------------------------------ */
/* Upcoming events                                                     */
/* ------------------------------------------------------------------ */

export type UpcomingEventStatus = Extract<VaccinationStatus, 'overdue' | 'due-soon' | 'scheduled'>;

/** Past its date is overdue; a booked appointment is scheduled; anything else is coming due. */
export function upcomingEventStatus(
  event: Pick<UpcomingMedicalEvent, 'date' | 'booked'>,
  reference: Date = new Date(),
): UpcomingEventStatus {
  if (dayOffset(event.date, reference) < 0) return 'overdue';
  return event.booked ? 'scheduled' : 'due-soon';
}

export function sortUpcomingEvents(events: UpcomingMedicalEvent[]): UpcomingMedicalEvent[] {
  return [...events].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime() || a.id.localeCompare(b.id),
  );
}

/* ------------------------------------------------------------------ */
/* Health                                                              */
/* ------------------------------------------------------------------ */

/** Horses whose status needs a decision, the most serious first. */
export function horsesRequiringAttention(health: HorseHealth[]): HorseHealth[] {
  const rank = (entry: HorseHealth) => (entry.status === 'needs-attention' ? 0 : 1);
  return health
    .filter((entry) => attentionStatuses.includes(entry.status))
    .sort((a, b) => rank(a) - rank(b) || a.horseName.localeCompare(b.horseName));
}

/* ------------------------------------------------------------------ */
/* Farm-wide summary                                                   */
/* ------------------------------------------------------------------ */

export interface OverviewSummary {
  attention: { count: number; names: string[] };
  vaccinations: { count: number; overdue: number; nextDate: string | null };
  visits: { count: number; nextDate: string | null };
  recent: { count: number; latest: MedicalRecord | null };
}

/**
 * The four figures at the top of /medical, derived from the same collections the
 * rest of the page shows, so a figure can never disagree with the list below it.
 */
export function summarizeOverview(
  input: {
    records: MedicalRecord[];
    vaccinations: Vaccination[];
    events: UpcomingMedicalEvent[];
    health: HorseHealth[];
  },
  reference: Date = new Date(),
): OverviewSummary {
  const attention = horsesRequiringAttention(input.health);

  const needing = input.vaccinations.filter(
    (vaccination) => vaccinationStatus(vaccination, reference) !== 'up-to-date',
  );
  const overdue = needing.filter(
    (vaccination) => vaccinationStatus(vaccination, reference) === 'overdue',
  ).length;
  const upcomingDates = needing
    .filter((vaccination) => vaccinationStatus(vaccination, reference) !== 'overdue')
    .map((vaccination) => vaccinationTargetDate(vaccination, reference))
    .filter((date): date is string => date !== null)
    .sort();

  const visits = sortUpcomingEvents(
    input.events.filter((event) => {
      const offset = dayOffset(event.date, reference);
      return vetVisitKinds.includes(event.kind) && offset >= 0 && offset <= SUMMARY_WINDOW_DAYS;
    }),
  );

  const recent = sortRecordsNewestFirst(
    input.records.filter((record) => {
      const offset = dayOffset(record.date, reference);
      return record.status !== 'scheduled' && offset <= 0 && offset >= -SUMMARY_WINDOW_DAYS;
    }),
  );

  return {
    attention: { count: attention.length, names: attention.map((entry) => entry.horseName) },
    vaccinations: { count: needing.length, overdue, nextDate: upcomingDates[0] ?? null },
    visits: { count: visits.length, nextDate: visits[0]?.date ?? null },
    recent: { count: recent.length, latest: recent[0] ?? null },
  };
}
