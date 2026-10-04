import { dayOffset, vaccinationStatus } from '../format';
import type { MedicalRecord, UpcomingMedicalEvent, Vaccination } from '../types';

/**
 * Builds the vaccination register and the upcoming-events list out of the
 * records.
 *
 * In production these are separate `/api/v1` resources computed by the server.
 * The mock derives them from the same records instead of keeping a second,
 * hand-written copy, so adding a vaccination or a follow-up through the form
 * visibly changes every view — and two views can never contradict each other.
 */

function slug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * One row per horse per vaccine: the latest dose given, plus the earliest
 * booking for the next one. A first dose that is only booked (nothing given
 * yet) still gets a row, so it is not lost.
 */
export function deriveVaccinations(
  records: MedicalRecord[],
  reference: Date = new Date(),
): Vaccination[] {
  const groups = new Map<string, MedicalRecord[]>();
  for (const record of records) {
    if (record.recordType !== 'vaccination' || !record.vaccine) continue;
    const key = `${record.horseId}|${slug(record.vaccine.name)}`;
    groups.set(key, [...(groups.get(key) ?? []), record]);
  }

  const newestFirst = (a: MedicalRecord, b: MedicalRecord) =>
    new Date(b.date).getTime() - new Date(a.date).getTime();

  return [...groups.values()].flatMap((group) => {
    const given = group.filter((record) => record.status !== 'scheduled').sort(newestFirst);
    const booked = group
      .filter((record) => record.status === 'scheduled' && dayOffset(record.date, reference) >= 0)
      .sort((a, b) => -newestFirst(a, b));

    const latest = given[0] ?? null;
    const booking = booked[0] ?? null;
    const anchor = latest ?? booking;
    if (!anchor?.vaccine) return [];

    return [
      {
        id: `vac-${anchor.horseId}-${slug(anchor.vaccine.name)}`,
        horseId: anchor.horseId,
        horseName: anchor.horseName,
        vaccineName: anchor.vaccine.name,
        administeredOn: latest?.date ?? null,
        nextDueDate: latest?.vaccine?.nextDueDate ?? null,
        scheduledFor: booking?.date ?? null,
        veterinarian: (latest ?? booking)?.veterinarian ?? null,
        recordId: (latest ?? booking)?.id ?? null,
      },
    ];
  });
}

/**
 * Things coming up, soonest first:
 *  - a booked record (status "Scheduled")
 *  - a follow-up date on a record that is not finished
 *  - a vaccination that is due or overdue with nothing booked for it
 *
 * Far-off due dates stay out: an unbooked dose months away is not an event yet,
 * it is a row in the vaccination register.
 */
export function deriveUpcomingEvents(
  records: MedicalRecord[],
  vaccinations: Vaccination[],
  reference: Date = new Date(),
): UpcomingMedicalEvent[] {
  const events: UpcomingMedicalEvent[] = [];

  for (const record of records) {
    if (record.status === 'scheduled') {
      events.push({
        id: `evt-booked-${record.id}`,
        horseId: record.horseId,
        horseName: record.horseName,
        kind:
          record.recordType === 'checkup'
            ? 'checkup'
            : record.recordType === 'vaccination'
              ? 'vaccination-due'
              : record.recordType === 'medication'
                ? 'medication-review'
                : 'visit',
        title: record.title,
        date: record.date,
        booked: true,
        veterinarian: record.veterinarian,
        recordId: record.id,
      });
      continue;
    }

    if (record.followUpDate && record.status !== 'completed') {
      const isMedication = record.recordType === 'medication';
      events.push({
        id: `evt-followup-${record.id}`,
        horseId: record.horseId,
        horseName: record.horseName,
        kind: isMedication ? 'medication-review' : 'follow-up',
        title: isMedication
          ? `Review: ${record.medication ?? record.title}`
          : `Follow-up: ${record.title}`,
        date: record.followUpDate,
        booked: true,
        veterinarian: record.veterinarian,
        recordId: record.id,
      });
    }
  }

  for (const vaccination of vaccinations) {
    const status = vaccinationStatus(vaccination, reference);
    const booked = vaccination.scheduledFor !== null;
    if ((status === 'overdue' || status === 'due-soon') && !booked && vaccination.nextDueDate) {
      events.push({
        id: `evt-due-${vaccination.id}`,
        horseId: vaccination.horseId,
        horseName: vaccination.horseName,
        kind: 'vaccination-due',
        title: `${vaccination.vaccineName} booster due`,
        date: vaccination.nextDueDate,
        booked: false,
        veterinarian: vaccination.veterinarian,
        recordId: vaccination.recordId,
      });
    }
  }

  return events.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime() || a.id.localeCompare(b.id),
  );
}
