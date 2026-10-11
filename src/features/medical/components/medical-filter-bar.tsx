'use client';

import { useId, useState } from 'react';
import { ListFilter, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { sortByLabel, useI18n } from '@/i18n';
import { cn } from '@/lib/cn';
import { activeMedicalFilterCount, hasActiveMedicalFilters } from '../format';
import type {
  HorseOption,
  MedicalRecordFilters,
  MedicalRecordStatus,
  MedicalRecordType,
} from '../types';
import { recordStatusValues, recordTypeValues } from '../vocabulary';

interface MedicalFilterBarProps {
  filters: MedicalRecordFilters;
  onChange: (filters: MedicalRecordFilters) => void;
  onReset: () => void;
  /** Horses that have records, so the list never offers a horse with no matches. */
  horses: HorseOption[];
}

const ANY = '';

/**
 * Search and filters for the records list. They narrow the list together, and
 * one control clears all of them.
 *
 * Search is applied as the user types: filtering is a pure function over data
 * already in memory, so there is nothing to debounce. Below `sm` the selects and
 * the date range collapse behind a Filters button — one set of controls, shown
 * or hidden by CSS, so nothing off-screen stays keyboard reachable. This mirrors
 * the Horses filter bar, so the two lists behave the same way.
 */
export function MedicalFilterBar({ filters, onChange, onReset, horses }: MedicalFilterBarProps) {
  const [open, setOpen] = useState(false);
  const searchId = useId();
  const panelId = useId();
  const count = activeMedicalFilterCount(filters);
  const showReset = hasActiveMedicalFilters(filters);
  const { t, tc, locale } = useI18n();

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="relative min-w-0 flex-1">
          <Search
            className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-stone-500"
            aria-hidden="true"
          />
          <label htmlFor={searchId} className="sr-only">
            {t.medical.filters.searchLabel}
          </label>
          <input
            id={searchId}
            type="search"
            value={filters.search}
            placeholder={t.medical.filters.searchPlaceholder}
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
          {t.common.filters}
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
        <label className="sr-only" htmlFor={`${panelId}-horse`}>
          {t.common.filterByHorse}
        </label>
        <Select
          id={`${panelId}-horse`}
          className="h-10 sm:w-44"
          value={filters.horseId ?? ANY}
          onChange={(event) => onChange({ ...filters, horseId: event.target.value || null })}
        >
          <option value={ANY}>{t.common.allHorses}</option>
          {sortByLabel(horses, (horse) => tc(horse.name), locale).map((horse) => (
            <option key={horse.id} value={horse.id}>
              {tc(horse.name)}
            </option>
          ))}
        </Select>

        <label className="sr-only" htmlFor={`${panelId}-type`}>
          {t.medical.filters.filterByType}
        </label>
        <Select
          id={`${panelId}-type`}
          className="h-10 sm:w-44"
          value={filters.recordType ?? ANY}
          onChange={(event) =>
            onChange({
              ...filters,
              recordType: (event.target.value || null) as MedicalRecordType | null,
            })
          }
        >
          <option value={ANY}>{t.medical.filters.allTypes}</option>
          {recordTypeValues.map((value) => (
            <option key={value} value={value}>
              {t.medical.recordTypes[value]}
            </option>
          ))}
        </Select>

        <label className="sr-only" htmlFor={`${panelId}-status`}>
          {t.common.filterByStatus}
        </label>
        <Select
          id={`${panelId}-status`}
          className="h-10 sm:w-44"
          value={filters.status ?? ANY}
          onChange={(event) =>
            onChange({
              ...filters,
              status: (event.target.value || null) as MedicalRecordStatus | null,
            })
          }
        >
          <option value={ANY}>{t.common.allStatuses}</option>
          {recordStatusValues.map((value) => (
            <option key={value} value={value}>
              {t.medical.statuses[value]}
            </option>
          ))}
        </Select>

        {/* The two date inputs are one control, so they carry one visible label. */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-stone-600">{t.common.dated}</span>
          <label className="sr-only" htmlFor={`${panelId}-from`}>
            {t.common.fromDate}
          </label>
          <Input
            id={`${panelId}-from`}
            type="date"
            className="h-10 min-w-0 flex-1 sm:w-40 sm:flex-none"
            value={filters.dateFrom}
            max={filters.dateTo || undefined}
            onChange={(event) => onChange({ ...filters, dateFrom: event.target.value })}
          />
          <span className="text-sm text-stone-600">{t.common.dateRangeTo}</span>
          <label className="sr-only" htmlFor={`${panelId}-to`}>
            {t.common.toDate}
          </label>
          <Input
            id={`${panelId}-to`}
            type="date"
            className="h-10 min-w-0 flex-1 sm:w-40 sm:flex-none"
            value={filters.dateTo}
            min={filters.dateFrom || undefined}
            onChange={(event) => onChange({ ...filters, dateTo: event.target.value })}
          />
        </div>

        {showReset ? (
          <Button variant="ghost" size="sm" onClick={onReset} className="justify-self-start">
            <X className="size-4" aria-hidden="true" />
            {t.common.clearFilters}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
