'use client';

import { useId, useState } from 'react';
import { ListFilter, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { cn } from '@/lib/cn';
import { activeTaskFilterCount, hasActiveTaskFilters } from '../format';
import type { HorseOption, TaskCategory, TaskFilters, TaskPriority, TaskStatus } from '../types';
import { taskCategoryOptions, taskPriorityOptions, taskStatusOptions } from '../vocabulary';

interface TaskFilterBarProps {
  filters: TaskFilters;
  onChange: (filters: TaskFilters) => void;
  onReset: () => void;
  /** Horses that have tasks, so the list never offers a horse with no matches. */
  horses: HorseOption[];
  /** Assignees that have tasks, so the list never offers one with no matches. */
  assignees: { id: string; name: string }[];
}

const ANY = '';

/**
 * Search and filters for the task list. They narrow the list together, and
 * one control clears all of them. Below `sm` the selects collapse behind a
 * Filters button, the same pattern Training and Medical use.
 */
export function TaskFilterBar({
  filters,
  onChange,
  onReset,
  horses,
  assignees,
}: TaskFilterBarProps) {
  const [open, setOpen] = useState(false);
  const searchId = useId();
  const panelId = useId();
  const count = activeTaskFilterCount(filters);
  const showReset = hasActiveTaskFilters(filters);

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="relative min-w-0 flex-1">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-stone-500"
            aria-hidden="true"
          />
          <label htmlFor={searchId} className="sr-only">
            Search tasks
          </label>
          <input
            id={searchId}
            type="search"
            value={filters.search}
            placeholder="Search by title, horse, assignee or notes"
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
        <label className="sr-only" htmlFor={`${panelId}-horse`}>
          Filter by horse
        </label>
        <Select
          id={`${panelId}-horse`}
          className="h-10 sm:w-40"
          value={filters.horseId ?? ANY}
          onChange={(event) => onChange({ ...filters, horseId: event.target.value || null })}
        >
          <option value={ANY}>All horses</option>
          {horses.map((horse) => (
            <option key={horse.id} value={horse.id}>
              {horse.name}
            </option>
          ))}
        </Select>

        <label className="sr-only" htmlFor={`${panelId}-assignee`}>
          Filter by assignee
        </label>
        <Select
          id={`${panelId}-assignee`}
          className="h-10 sm:w-40"
          value={filters.assigneeId ?? ANY}
          onChange={(event) => onChange({ ...filters, assigneeId: event.target.value || null })}
        >
          <option value={ANY}>All assignees</option>
          {assignees.map((assignee) => (
            <option key={assignee.id} value={assignee.id}>
              {assignee.name}
            </option>
          ))}
        </Select>

        <label className="sr-only" htmlFor={`${panelId}-category`}>
          Filter by category
        </label>
        <Select
          id={`${panelId}-category`}
          className="h-10 sm:w-40"
          value={filters.category ?? ANY}
          onChange={(event) =>
            onChange({ ...filters, category: (event.target.value || null) as TaskCategory | null })
          }
        >
          <option value={ANY}>All categories</option>
          {taskCategoryOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>

        <label className="sr-only" htmlFor={`${panelId}-priority`}>
          Filter by priority
        </label>
        <Select
          id={`${panelId}-priority`}
          className="h-10 sm:w-36"
          value={filters.priority ?? ANY}
          onChange={(event) =>
            onChange({ ...filters, priority: (event.target.value || null) as TaskPriority | null })
          }
        >
          <option value={ANY}>All priorities</option>
          {taskPriorityOptions.map((option) => (
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
          className="h-10 sm:w-36"
          value={filters.status ?? ANY}
          onChange={(event) =>
            onChange({ ...filters, status: (event.target.value || null) as TaskStatus | null })
          }
        >
          <option value={ANY}>All statuses</option>
          {taskStatusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>

        <label className="sr-only" htmlFor={`${panelId}-recurring`}>
          Filter by recurring
        </label>
        <Select
          id={`${panelId}-recurring`}
          className="h-10 sm:w-40"
          value={filters.recurring === null ? ANY : filters.recurring ? 'recurring' : 'one-time'}
          onChange={(event) =>
            onChange({
              ...filters,
              recurring: event.target.value === '' ? null : event.target.value === 'recurring',
            })
          }
        >
          <option value={ANY}>Recurring or one-time</option>
          <option value="recurring">Recurring only</option>
          <option value="one-time">One-time only</option>
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
