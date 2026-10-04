import { describe, expect, it } from 'vitest';
import {
  activeMedicalFilterCount,
  filterMedicalRecords,
  filterVaccinations,
  formatFileSize,
  formatNameList,
  formatRecordCount,
  formatRelativeDay,
  groupRecordsByYear,
  hasActiveMedicalFilters,
  horsesOf,
  horsesRequiringAttention,
  lastVetVisit,
  nextVaccination,
  openFollowUps,
  recordSummary,
  sortRecordsNewestFirst,
  sortVaccinations,
  summarizeOverview,
  upcomingEventStatus,
  vaccinationStatus,
  vaccinationTargetDate,
} from '@/features/medical/format';
import {
  emptyMedicalRecordFilters,
  type HorseHealth,
  type MedicalRecord,
  type UpcomingMedicalEvent,
  type Vaccination,
} from '@/features/medical/types';

/** Fixed "today" so every date-dependent rule is deterministic. */
const NOW = new Date(2026, 8, 20); // 20 Sep 2026

function day(offset: number, hour = 9): string {
  return new Date(2026, 8, 20 + offset, hour).toISOString();
}

function record(overrides: Partial<MedicalRecord> = {}): MedicalRecord {
  return {
    id: 'mr-x',
    horseId: 'luna',
    horseName: 'Luna',
    recordType: 'checkup',
    date: day(-5),
    title: 'Routine health examination',
    diagnosis: null,
    treatment: null,
    medication: null,
    veterinarian: 'Dr. Sara Nabil',
    status: 'completed',
    notes: null,
    attachments: [],
    followUpDate: null,
    followUpNotes: null,
    vaccine: null,
    createdAt: day(-5, 12),
    ...overrides,
  };
}

function vaccination(overrides: Partial<Vaccination> = {}): Vaccination {
  return {
    id: 'vac-luna-flu',
    horseId: 'luna',
    horseName: 'Luna',
    vaccineName: 'Equine influenza',
    administeredOn: day(-200),
    nextDueDate: day(165),
    scheduledFor: null,
    veterinarian: 'Dr. Ahmed Samir',
    recordId: 'mr-002',
    ...overrides,
  };
}

describe('vaccinationStatus', () => {
  it('is up to date when the next dose is beyond the due-soon window', () => {
    expect(vaccinationStatus(vaccination({ nextDueDate: day(120) }), NOW)).toBe('up-to-date');
  });

  it('is due soon inside the 30-day window, including the boundary day', () => {
    expect(vaccinationStatus(vaccination({ nextDueDate: day(30) }), NOW)).toBe('due-soon');
    expect(vaccinationStatus(vaccination({ nextDueDate: day(31) }), NOW)).toBe('up-to-date');
    expect(vaccinationStatus(vaccination({ nextDueDate: day(0) }), NOW)).toBe('due-soon');
  });

  it('is overdue once the due date has passed', () => {
    expect(vaccinationStatus(vaccination({ nextDueDate: day(-1) }), NOW)).toBe('overdue');
  });

  it('is scheduled when a future dose is booked and nothing is late', () => {
    const booked = vaccination({ nextDueDate: day(20), scheduledFor: day(10) });
    expect(vaccinationStatus(booked, NOW)).toBe('scheduled');
  });

  it('keeps an overdue dose flagged even when a later appointment is booked', () => {
    const late = vaccination({ nextDueDate: day(-10), scheduledFor: day(6) });
    expect(vaccinationStatus(late, NOW)).toBe('overdue');
  });

  it('is up to date when there is no further dose planned', () => {
    expect(vaccinationStatus(vaccination({ nextDueDate: null }), NOW)).toBe('up-to-date');
  });

  it('shows the booked date when scheduled and the due date otherwise', () => {
    const booked = vaccination({ nextDueDate: day(20), scheduledFor: day(10) });
    expect(vaccinationTargetDate(booked, NOW)).toBe(day(10));
    expect(vaccinationTargetDate(vaccination({ nextDueDate: day(20) }), NOW)).toBe(day(20));
  });
});

describe('sortVaccinations / nextVaccination', () => {
  const list = [
    vaccination({ id: 'a', nextDueDate: day(120) }), // up to date
    vaccination({ id: 'b', nextDueDate: day(-5) }), // overdue
    vaccination({ id: 'c', nextDueDate: day(10) }), // due soon
  ];

  it('puts the most urgent first', () => {
    expect(sortVaccinations(list, NOW).map((entry) => entry.id)).toEqual(['b', 'c', 'a']);
  });

  it('picks the most urgent dated vaccination as the next one', () => {
    expect(nextVaccination(list, NOW)?.id).toBe('b');
    expect(nextVaccination([vaccination({ nextDueDate: null })], NOW)).toBeNull();
  });
});

describe('filterVaccinations', () => {
  const list = [
    vaccination({ id: 'a', horseId: 'luna', nextDueDate: day(-5) }),
    vaccination({ id: 'b', horseId: 'duke', nextDueDate: day(200) }),
    vaccination({ id: 'c', horseId: 'duke', nextDueDate: day(10) }),
  ];

  it('filters by horse', () => {
    const shown = filterVaccinations(list, { horseId: 'duke', status: null }, NOW);
    expect(shown.map((entry) => entry.id)).toEqual(['b', 'c']);
  });

  it('filters by calculated status', () => {
    const shown = filterVaccinations(list, { horseId: null, status: 'overdue' }, NOW);
    expect(shown.map((entry) => entry.id)).toEqual(['a']);
  });

  it('combines horse and status', () => {
    const shown = filterVaccinations(list, { horseId: 'duke', status: 'due-soon' }, NOW);
    expect(shown.map((entry) => entry.id)).toEqual(['c']);
  });
});

describe('filterMedicalRecords', () => {
  const records = [
    record({ id: '1', horseId: 'luna', horseName: 'Luna', title: 'Routine checkup' }),
    record({
      id: '2',
      horseId: 'duke',
      horseName: 'Duke',
      recordType: 'diagnosis',
      title: 'Hock osteoarthritis',
      diagnosis: 'Distal tarsal osteoarthritis',
      veterinarian: 'Dr. Omar Fathy',
      status: 'ongoing',
      date: day(-40),
    }),
    record({
      id: '3',
      horseId: 'duke',
      horseName: 'Duke',
      recordType: 'medication',
      title: 'Anti-inflammatory course',
      medication: 'Firocoxib 57 mg',
      date: day(-2),
    }),
  ];

  it('matches the horse name, title, diagnosis, vet and medication', () => {
    const search = (term: string) =>
      filterMedicalRecords(records, { ...emptyMedicalRecordFilters, search: term }).map(
        (r) => r.id,
      );

    expect(search('luna')).toEqual(['1']);
    expect(search('osteoarthritis')).toEqual(['2']);
    expect(search('omar')).toEqual(['2']);
    expect(search('firocoxib')).toEqual(['3']);
    expect(search('nothing here')).toEqual([]);
  });

  it('filters by horse, type and status', () => {
    expect(
      filterMedicalRecords(records, { ...emptyMedicalRecordFilters, horseId: 'duke' }).map(
        (r) => r.id,
      ),
    ).toEqual(['2', '3']);
    expect(
      filterMedicalRecords(records, { ...emptyMedicalRecordFilters, recordType: 'medication' }).map(
        (r) => r.id,
      ),
    ).toEqual(['3']);
    expect(
      filterMedicalRecords(records, { ...emptyMedicalRecordFilters, status: 'ongoing' }).map(
        (r) => r.id,
      ),
    ).toEqual(['2']);
  });

  it('filters by date range, including the boundary days', () => {
    // Record 1 is 5 days old, record 2 is 40 days old, record 3 is 2 days old.
    const inputValue = (offset: number) => {
      const date = new Date(2026, 8, 20 + offset);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    };
    const ids = (dateFrom = '', dateTo = '') =>
      filterMedicalRecords(records, { ...emptyMedicalRecordFilters, dateFrom, dateTo }).map(
        (r) => r.id,
      );

    expect(ids(inputValue(-3))).toEqual(['3']);
    expect(ids('', inputValue(-3))).toEqual(['1', '2']);
    expect(ids(inputValue(-5), inputValue(-2))).toEqual(['1', '3']);
    // Both ends are inclusive: a record dated exactly on the bound is kept.
    expect(ids(inputValue(-5), inputValue(-5))).toEqual(['1']);
  });

  it('combines every filter at once', () => {
    const shown = filterMedicalRecords(records, {
      ...emptyMedicalRecordFilters,
      search: 'duke',
      horseId: 'duke',
      recordType: 'diagnosis',
      status: 'ongoing',
    });
    expect(shown.map((r) => r.id)).toEqual(['2']);
  });

  it('reports which filters are active and how many are hidden behind the Filters button', () => {
    expect(hasActiveMedicalFilters(emptyMedicalRecordFilters)).toBe(false);
    expect(hasActiveMedicalFilters({ ...emptyMedicalRecordFilters, search: 'luna' })).toBe(true);
    expect(activeMedicalFilterCount({ ...emptyMedicalRecordFilters, search: 'luna' })).toBe(0);
    expect(
      activeMedicalFilterCount({
        ...emptyMedicalRecordFilters,
        horseId: 'luna',
        status: 'ongoing',
        dateFrom: '2026-01-01',
        dateTo: '2026-02-01',
      }),
    ).toBe(3);
  });
});

describe('record helpers', () => {
  it('sorts newest first', () => {
    const sorted = sortRecordsNewestFirst([
      record({ id: 'old', date: day(-40) }),
      record({ id: 'new', date: day(-1) }),
    ]);
    expect(sorted.map((r) => r.id)).toEqual(['new', 'old']);
  });

  it('groups by calendar year, newest year first', () => {
    const groups = groupRecordsByYear([
      record({ id: 'a', date: new Date(2026, 1, 3).toISOString() }),
      record({ id: 'b', date: new Date(2025, 10, 3).toISOString() }),
      record({ id: 'c', date: new Date(2025, 2, 3).toISOString() }),
    ]);
    expect(groups.map((group) => group.year)).toEqual([2026, 2025]);
    expect(groups[1]?.records).toHaveLength(2);
  });

  it('summarises a record from its most specific field', () => {
    expect(recordSummary(record({ diagnosis: 'Laminitis' }))).toBe('Laminitis');
    expect(recordSummary(record({ treatment: 'Box rest' }))).toBe('Box rest');
    expect(recordSummary(record({ medication: 'Bute' }))).toBe('Medication: Bute');
    expect(recordSummary(record())).toBeNull();
    expect(
      recordSummary(
        record({ recordType: 'vaccination', vaccine: { name: 'Tetanus', nextDueDate: null } }),
      ),
    ).toBe('Tetanus');
  });

  it('finds the last completed visit a vet attended, ignoring bookings', () => {
    const records = [
      record({ id: 'future', date: day(3), status: 'scheduled' }),
      record({ id: 'recent', date: day(-4) }),
      record({ id: 'no-vet', date: day(-1), veterinarian: null }),
    ];
    expect(lastVetVisit(records, NOW)?.id).toBe('recent');
    expect(lastVetVisit([record({ veterinarian: null })], NOW)).toBeNull();
  });

  it('lists only follow-ups that are still open, soonest first', () => {
    const records = [
      record({ id: 'late', followUpDate: day(9), status: 'follow-up-required' }),
      record({ id: 'soon', followUpDate: day(2), status: 'ongoing' }),
      record({ id: 'done', followUpDate: day(4), status: 'completed' }),
    ];
    expect(openFollowUps(records).map((r) => r.id)).toEqual(['soon', 'late']);
  });

  it('lists the horses named in a collection, alphabetically', () => {
    expect(horsesOf([record({ horseId: 'z', horseName: 'Zahra' }), record({ id: '2' })])).toEqual([
      { id: 'luna', name: 'Luna' },
      { id: 'z', name: 'Zahra' },
    ]);
  });

  it('counts records, switching to "showing" while filtered', () => {
    expect(formatRecordCount(46, 46)).toBe('46 records');
    expect(formatRecordCount(1, 1)).toBe('1 record');
    expect(formatRecordCount(8, 46)).toBe('Showing 8 of 46 records');
  });
});

describe('upcomingEventStatus', () => {
  const event = (overrides: Partial<UpcomingMedicalEvent>): UpcomingMedicalEvent => ({
    id: 'evt',
    horseId: 'luna',
    horseName: 'Luna',
    kind: 'follow-up',
    title: 'Follow-up',
    date: day(3),
    booked: true,
    veterinarian: null,
    recordId: null,
    ...overrides,
  });

  it('is overdue once the date has passed, whether booked or not', () => {
    expect(upcomingEventStatus(event({ date: day(-1) }), NOW)).toBe('overdue');
    expect(upcomingEventStatus(event({ date: day(-1), booked: false }), NOW)).toBe('overdue');
  });

  it('separates a booked appointment from a bare due date', () => {
    expect(upcomingEventStatus(event({ date: day(2) }), NOW)).toBe('scheduled');
    expect(upcomingEventStatus(event({ date: day(2), booked: false }), NOW)).toBe('due-soon');
  });
});

describe('horsesRequiringAttention', () => {
  const health = (overrides: Partial<HorseHealth>): HorseHealth => ({
    horseId: 'luna',
    horseName: 'Luna',
    status: 'healthy',
    note: null,
    updatedAt: day(-2),
    ...overrides,
  });

  it('keeps only the statuses that need a decision, most serious first', () => {
    const result = horsesRequiringAttention([
      health({ horseId: 'duke', horseName: 'Duke', status: 'under-treatment' }),
      health({ horseId: 'luna', status: 'healthy' }),
      health({ horseId: 'willow', horseName: 'Willow', status: 'needs-attention' }),
      health({ horseId: 'storm', horseName: 'Storm', status: 'recovering' }),
    ]);
    expect(result.map((entry) => entry.horseName)).toEqual(['Willow', 'Duke']);
  });
});

describe('summarizeOverview', () => {
  it('counts attention, vaccinations, upcoming visits and recent records', () => {
    const summary = summarizeOverview(
      {
        records: [
          record({ id: 'recent', date: day(-3) }),
          record({ id: 'old', date: day(-200) }),
          record({ id: 'booked', date: day(4), status: 'scheduled' }),
        ],
        vaccinations: [
          vaccination({ id: 'late', nextDueDate: day(-3) }),
          vaccination({ id: 'soon', nextDueDate: day(12) }),
          vaccination({ id: 'fine', nextDueDate: day(300) }),
        ],
        events: [
          {
            id: 'evt-1',
            horseId: 'luna',
            horseName: 'Luna',
            kind: 'checkup',
            title: 'Checkup',
            date: day(4),
            booked: true,
            veterinarian: null,
            recordId: null,
          },
        ],
        health: [
          {
            horseId: 'willow',
            horseName: 'Willow',
            status: 'needs-attention',
            note: null,
            updatedAt: day(-1),
          },
        ],
      },
      NOW,
    );

    expect(summary.attention).toEqual({ count: 1, names: ['Willow'] });
    expect(summary.vaccinations.count).toBe(2);
    expect(summary.vaccinations.overdue).toBe(1);
    expect(summary.visits.count).toBe(1);
    // Only the record inside the last 30 days that has already happened.
    expect(summary.recent.count).toBe(1);
    expect(summary.recent.latest?.id).toBe('recent');
  });
});

describe('display formatting', () => {
  it('describes how far away a date is, coarser the further out it goes', () => {
    expect(formatRelativeDay(day(0), NOW)).toBe('Today');
    expect(formatRelativeDay(day(1), NOW)).toBe('Tomorrow');
    expect(formatRelativeDay(day(-1), NOW)).toBe('Yesterday');
    expect(formatRelativeDay(day(5), NOW)).toBe('In 5 days');
    expect(formatRelativeDay(day(-21), NOW)).toBe('3 weeks ago');
    expect(formatRelativeDay(day(90), NOW)).toBe('In 3 months');
  });

  it('formats file sizes and short name lists', () => {
    expect(formatFileSize(512)).toBe('512 B');
    expect(formatFileSize(310 * 1024)).toBe('310 KB');
    expect(formatFileSize(2.4 * 1024 * 1024)).toBe('2.4 MB');
    expect(formatNameList(['Willow', 'Duke'])).toBe('Willow, Duke');
    expect(formatNameList(['Willow', 'Duke', 'Bella'])).toBe('Willow, Duke +1');
  });
});
