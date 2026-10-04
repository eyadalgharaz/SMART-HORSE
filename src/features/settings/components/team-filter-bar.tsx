'use client';

import { useId, useState } from 'react';
import { ListFilter, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { cn } from '@/lib/cn';
import { activeTeamFilterCount, hasActiveTeamFilters } from '../format';
import type { FarmRole, TeamMemberFilters, TeamMemberStatus } from '../types';
import { useRoleOptions } from '@/i18n';
import { teamMemberStatusOptions } from '../vocabulary';

const ANY = '';

/**
 * Search and filters for the team list. They narrow the list together, and
 * one control clears all of them. Below `sm` the selects collapse behind a
 * Filters button, the same pattern every other list in the app uses.
 */
export function TeamFilterBar({
  filters,
  onChange,
  onReset,
}: {
  filters: TeamMemberFilters;
  onChange: (filters: TeamMemberFilters) => void;
  onReset: () => void;
}) {
  const [open, setOpen] = useState(false);
  const roleOptions = useRoleOptions();
  const searchId = useId();
  const panelId = useId();
  const count = activeTeamFilterCount(filters);
  const showReset = hasActiveTeamFilters(filters);

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="relative min-w-0 flex-1">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-stone-500"
            aria-hidden="true"
          />
          <label htmlFor={searchId} className="sr-only">
            Search team members
          </label>
          <input
            id={searchId}
            type="search"
            value={filters.search}
            placeholder="Search by name or email"
            onChange={(event) => onChange({ ...filters, search: event.target.value })}
            className="sh-field h-10 pl-9"
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
          Filters
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
        <label className="sr-only" htmlFor={`${panelId}-role`}>
          Filter by role
        </label>
        <Select
          id={`${panelId}-role`}
          className="h-10 sm:w-44"
          value={filters.role ?? ANY}
          onChange={(event) =>
            onChange({ ...filters, role: (event.target.value || null) as FarmRole | null })
          }
        >
          <option value={ANY}>All roles</option>
          {roleOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>

        <label className="sr-only" htmlFor={`${panelId}-status`}>
          Filter by status
        </label>
        <Select
          id={`${panelId}-status`}
          className="h-10 sm:w-40"
          value={filters.status ?? ANY}
          onChange={(event) =>
            onChange({
              ...filters,
              status: (event.target.value || null) as TeamMemberStatus | null,
            })
          }
        >
          <option value={ANY}>All statuses</option>
          {teamMemberStatusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>

        {showReset ? (
          <Button variant="ghost" size="sm" onClick={onReset} className="justify-self-start">
            <X className="size-4" aria-hidden="true" />
            Clear filters
          </Button>
        ) : null}
      </div>
    </div>
  );
}
