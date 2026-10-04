import { describe, expect, it } from 'vitest';
import {
  ageInYears,
  breedsOf,
  filterHorses,
  formatAge,
  formatBirthDate,
  formatHorseCount,
  fromDateInputValue,
  hasActiveFilters,
  toDateInputValue,
} from '@/features/horses/format';
import { emptyHorseFilters, type Horse } from '@/features/horses/types';

const reference = new Date(2026, 8, 19); // 19 Sep 2026, matches "today" in review

function horse(overrides: Partial<Horse>): Horse {
  return {
    id: 'id',
    name: 'Luna',
    breed: 'Arabian',
    gender: 'mare',
    birthDate: new Date(2019, 2, 14).toISOString(),
    color: 'Grey',
    registrationNumber: 'AHA-284193',
    microchipNumber: '985141002734611',
    imageUrl: null,
    owner: { id: 'owner-ahmed', name: 'Ahmed Hassan' },
    status: 'active',
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

describe('ageInYears / formatAge', () => {
  it('counts whole years and drops the count before the birthday this year', () => {
    // Born 14 Mar; as of 19 Sep the birthday has passed this year.
    expect(ageInYears(new Date(2019, 2, 14).toISOString(), reference)).toBe(7);
    // Born 30 Dec; the birthday has not happened yet this year.
    expect(ageInYears(new Date(2019, 11, 30).toISOString(), reference)).toBe(6);
  });

  it('formats a horse under one year in months', () => {
    const bornTwoMonthsAgo = new Date(2026, 6, 19).toISOString();
    expect(formatAge(bornTwoMonthsAgo, reference)).toBe('2 months');
  });

  it('formats a one-year-old with the singular', () => {
    const bornOneYearAgo = new Date(2025, 8, 1).toISOString();
    expect(formatAge(bornOneYearAgo, reference)).toBe('1 year');
  });
});

describe('date input round-trip', () => {
  it('converts an ISO date to an input value and back to the same calendar day', () => {
    const iso = new Date(2019, 2, 14).toISOString();
    const inputValue = toDateInputValue(iso);
    expect(inputValue).toBe('2019-03-14');
    expect(new Date(fromDateInputValue(inputValue)).toDateString()).toBe(
      new Date(iso).toDateString(),
    );
  });
});

describe('formatBirthDate', () => {
  it('renders a human date', () => {
    expect(formatBirthDate(new Date(2019, 2, 14).toISOString())).toBe('14 Mar 2019');
  });
});

describe('breedsOf', () => {
  it('lists breeds present in the data, alphabetically, without duplicates', () => {
    const horses = [
      horse({ breed: 'Thoroughbred' }),
      horse({ breed: 'Arabian' }),
      horse({ breed: 'Arabian' }),
    ];
    expect(breedsOf(horses)).toEqual(['Arabian', 'Thoroughbred']);
  });
});

describe('filterHorses', () => {
  const horses = [
    horse({ id: 'luna', name: 'Luna', breed: 'Arabian', gender: 'mare', status: 'active' }),
    horse({
      id: 'storm',
      name: 'Storm',
      breed: 'Thoroughbred',
      gender: 'gelding',
      status: 'in-training',
    }),
    horse({
      id: 'duke',
      name: 'Duke',
      breed: 'Quarter Horse',
      gender: 'gelding',
      status: 'active',
      registrationNumber: 'AQHA-5583011',
      owner: { id: 'owner-nadia', name: 'Nadia Farouk' },
    }),
  ];

  it('matches search against name, breed, and identifiers', () => {
    expect(filterHorses(horses, { ...emptyHorseFilters, search: 'arabian' })).toEqual([horses[0]]);
    expect(filterHorses(horses, { ...emptyHorseFilters, search: '5583011' })).toEqual([horses[2]]);
    expect(filterHorses(horses, { ...emptyHorseFilters, search: 'nadia' })).toEqual([horses[2]]);
  });

  it('applies breed, gender and status filters together, not separately', () => {
    const result = filterHorses(horses, {
      ...emptyHorseFilters,
      gender: 'gelding',
      status: 'active',
    });
    expect(result).toEqual([horses[2]]);
  });

  it('returns everything when no filter is active', () => {
    expect(filterHorses(horses, emptyHorseFilters)).toHaveLength(3);
  });
});

describe('hasActiveFilters', () => {
  it('is false only when search and every filter are empty', () => {
    expect(hasActiveFilters(emptyHorseFilters)).toBe(false);
    expect(hasActiveFilters({ ...emptyHorseFilters, search: 'luna' })).toBe(true);
    expect(hasActiveFilters({ ...emptyHorseFilters, breed: 'Arabian' })).toBe(true);
  });
});

describe('formatHorseCount', () => {
  it('shows a plain total when nothing is filtered out', () => {
    expect(formatHorseCount(42, 42)).toBe('42 horses');
    expect(formatHorseCount(1, 1)).toBe('1 horse');
  });

  it('shows "Showing X of Y" once filters remove some horses', () => {
    expect(formatHorseCount(8, 42)).toBe('Showing 8 of 42 horses');
  });
});
