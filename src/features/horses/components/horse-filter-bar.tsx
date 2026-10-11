'use client';

import { useId, useState } from 'react';
import { ListFilter, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { cn } from '@/lib/cn';
import { useGenderOptions, useI18n, useStatusOptions } from '@/i18n';
import { hasActiveFilters } from '../format';
import type { HorseFilters, HorseGender, HorseStatus } from '../types';

interface HorseFilterBarProps {
  filters: HorseFilters;
  onChange: (filters: HorseFilters) => void;
  onReset: () => void;
  /** Breeds present in the data, so the list never offers a breed with no matches. */
  breeds: string[];
}

const ANY = '';

function activeCount(filters: HorseFilters): number {
  return [filters.breed, filters.gender, filters.status].filter(Boolean).length;
}

/**
 * Search and filters for the horse list. They narrow the list together, and one
 * control clears all of them.
 *
 * Search is applied as the user types: filtering is a pure function over data
 * already in memory, so there is nothing to debounce. On phones the three
 * selects collapse behind a Filters button — one set of controls, shown or
 * hidden by CSS, so nothing off-screen stays keyboard reachable.
 */
export function HorseFilterBar({ filters, onChange, onReset, breeds }: HorseFilterBarProps) {
  const [open, setOpen] = useState(false);
  const searchId = useId();
  const panelId = useId();
  const count = activeCount(filters);
  const showReset = hasActiveFilters(filters);
  const { t, tc } = useI18n();
  const genderOptions = useGenderOptions();
  const statusOptions = useStatusOptions();

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="relative min-w-0 flex-1">
          <Search
            className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-stone-500"
            aria-hidden="true"
          />
          <label htmlFor={searchId} className="sr-only">
            {t.horses.searchLabel}
          </label>
          <input
            id={searchId}
            type="search"
            value={filters.search}
            placeholder={t.horses.searchPlaceholder}
            onChange={(event) => onChange({ ...filters, search: event.target.value })}
            className="sh-field h-10 ps-9"
          />
        </div>

        <Button
          variant="secondary"
          className="sm:hidden"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((value) => !value)}
        >
          <ListFilter className="size-4" aria-hidden="true" />
          {t.horses.filters}
          {count > 0 ? <span className="text-stone-600">({count})</span> : null}
        </Button>
      </div>

      <div
        id={panelId}
        className={cn(
          'gap-2 sm:flex sm:flex-wrap sm:items-center',
          open ? 'grid grid-cols-1' : 'hidden',
        )}
      >
        <label className="sr-only" htmlFor={`${panelId}-breed`}>
          {t.horses.filterByBreed}
        </label>
        <Select
          id={`${panelId}-breed`}
          className="h-10 sm:w-48"
          value={filters.breed ?? ANY}
          onChange={(event) => onChange({ ...filters, breed: event.target.value || null })}
        >
          <option value={ANY}>{t.horses.allBreeds}</option>
          {breeds.map((breed) => (
            <option key={breed} value={breed}>
              {tc(breed)}
            </option>
          ))}
        </Select>

        <label className="sr-only" htmlFor={`${panelId}-gender`}>
          {t.horses.filterByGender}
        </label>
        <Select
          id={`${panelId}-gender`}
          className="h-10 sm:w-40"
          value={filters.gender ?? ANY}
          onChange={(event) =>
            onChange({ ...filters, gender: (event.target.value || null) as HorseGender | null })
          }
        >
          <option value={ANY}>{t.horses.allGenders}</option>
          {genderOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>

        <label className="sr-only" htmlFor={`${panelId}-status`}>
          {t.horses.filterByStatus}
        </label>
        <Select
          id={`${panelId}-status`}
          className="h-10 sm:w-40"
          value={filters.status ?? ANY}
          onChange={(event) =>
            onChange({ ...filters, status: (event.target.value || null) as HorseStatus | null })
          }
        >
          <option value={ANY}>{t.horses.allStatuses}</option>
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>

        {showReset ? (
          <Button variant="ghost" size="sm" onClick={onReset} className="justify-self-start">
            <X className="size-4" aria-hidden="true" />
            {t.horses.clearFilters}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
