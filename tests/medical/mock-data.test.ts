import { describe, expect, it } from 'vitest';
import { buildHorseMocks } from '@/features/horses/mock/horse-mock-data';
import { buildHealthMocks, buildMedicalMocks } from '@/features/medical/mock/medical-mock-data';
import { deriveUpcomingEvents, deriveVaccinations } from '@/features/medical/mock/derive';
import { vaccinationStatus } from '@/features/medical/format';
import { recordTypeValues, recordStatusValues } from '@/features/medical/vocabulary';

describe('buildMedicalMocks', () => {
  const records = buildMedicalMocks();
  const horseIds = new Set(buildHorseMocks().map((horse) => horse.id));

  it('produces a dataset large enough to review filters, paging and the timeline', () => {
    expect(records.length).toBeGreaterThanOrEqual(30);
    expect(new Set(records.map((record) => record.id)).size).toBe(records.length);
  });

  it('only ever references horses that Horse Management actually has', () => {
    for (const record of records) {
      expect(horseIds.has(record.horseId)).toBe(true);
    }
  });

  it('agrees with Horse Management about every horse name', () => {
    const names = new Map(buildHorseMocks().map((horse) => [horse.id, horse.name]));
    for (const record of records) {
      expect(record.horseName).toBe(names.get(record.horseId));
    }
  });

  it('covers every record type and every status', () => {
    expect(new Set(records.map((record) => record.recordType))).toEqual(new Set(recordTypeValues));
    expect(new Set(records.map((record) => record.status))).toEqual(new Set(recordStatusValues));
  });

  it('spans several horses and several veterinarians', () => {
    expect(new Set(records.map((record) => record.horseId)).size).toBeGreaterThanOrEqual(10);
    const vets = new Set(
      records.map((record) => record.veterinarian).filter((vet): vet is string => vet !== null),
    );
    expect(vets.size).toBeGreaterThanOrEqual(3);
  });

  it('includes records with missing optional information, for the "Not recorded" path', () => {
    expect(records.some((record) => record.veterinarian === null)).toBe(true);
    expect(records.some((record) => record.diagnosis === null)).toBe(true);
    expect(records.some((record) => record.notes === null)).toBe(true);
    expect(records.some((record) => record.followUpDate === null)).toBe(true);
    expect(records.some((record) => record.attachments.length === 0)).toBe(true);
  });

  it('includes vaccinations, injuries, treatments, medications and attachments', () => {
    expect(records.some((record) => record.recordType === 'vaccination')).toBe(true);
    expect(records.some((record) => record.recordType === 'injury')).toBe(true);
    expect(records.some((record) => record.medication !== null)).toBe(true);
    expect(records.some((record) => record.attachments.length > 1)).toBe(true);
  });

  it('dates only scheduled records in the future', () => {
    const now = Date.now();
    for (const record of records) {
      if (record.status === 'scheduled') continue;
      expect(new Date(record.date).getTime()).toBeLessThanOrEqual(now);
    }
    expect(records.some((record) => new Date(record.date).getTime() > now)).toBe(true);
  });

  it('gives every vaccination record its vaccine details', () => {
    for (const record of records.filter((entry) => entry.recordType === 'vaccination')) {
      expect(record.vaccine?.name).toBeTruthy();
    }
  });
});

describe('buildHealthMocks', () => {
  const health = buildHealthMocks();

  it('references only real horses and covers every health status', () => {
    const horseIds = new Set(buildHorseMocks().map((horse) => horse.id));
    for (const entry of health) expect(horseIds.has(entry.horseId)).toBe(true);

    expect(new Set(health.map((entry) => entry.status))).toEqual(
      new Set(['healthy', 'monitoring', 'needs-attention', 'under-treatment', 'recovering']),
    );
  });

  it('leaves some horses unassessed rather than defaulting them to healthy', () => {
    expect(health.length).toBeLessThan(buildHorseMocks().length);
  });
});

describe('derived vaccinations and events', () => {
  const records = buildMedicalMocks();
  const vaccinations = deriveVaccinations(records);

  it('produces one row per horse per vaccine', () => {
    const keys = vaccinations.map((entry) => `${entry.horseId}|${entry.vaccineName}`);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('covers every vaccination status, so each badge is reviewable', () => {
    const statuses = new Set(vaccinations.map((entry) => vaccinationStatus(entry)));
    expect(statuses).toEqual(new Set(['up-to-date', 'due-soon', 'overdue', 'scheduled']));
  });

  it('keeps the latest dose rather than an older one', () => {
    // Luna has two influenza records; the register must show the newer.
    const luna = vaccinations.find(
      (entry) => entry.horseId === 'luna' && entry.vaccineName === 'Equine influenza',
    );
    const lunaFluRecords = records.filter(
      (record) => record.horseId === 'luna' && record.vaccine?.name === 'Equine influenza',
    );
    const newest = lunaFluRecords
      .map((record) => new Date(record.date).getTime())
      .sort((a, b) => b - a)[0];
    expect(new Date(luna!.administeredOn!).getTime()).toBe(newest);
  });

  it('builds upcoming events from bookings, open follow-ups and unbooked due doses', () => {
    const events = deriveUpcomingEvents(records, vaccinations);
    expect(events.length).toBeGreaterThan(0);

    const kinds = new Set(events.map((event) => event.kind));
    expect(kinds.has('vaccination-due')).toBe(true);
    expect(kinds.has('follow-up')).toBe(true);

    // Sorted soonest first.
    const times = events.map((event) => new Date(event.date).getTime());
    expect([...times].sort((a, b) => a - b)).toEqual(times);
  });

  it('does not raise an event for a dose that is already booked', () => {
    const events = deriveUpcomingEvents(records, vaccinations);
    const booked = vaccinations.filter((entry) => entry.scheduledFor !== null);
    for (const entry of booked) {
      expect(events.some((event) => event.id === `evt-due-${entry.id}`)).toBe(false);
    }
  });
});
