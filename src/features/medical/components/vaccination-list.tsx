'use client';

import { useId } from 'react';
import { Select } from '@/components/ui/select';
import {
  formatRecordDate,
  formatRelativeDay,
  vaccinationStatus,
  vaccinationTargetDate,
} from '../format';
import type { HorseOption, Vaccination, VaccinationFilters, VaccinationStatus } from '../types';
import { NOT_RECORDED, vaccinationStatusOptions } from '../vocabulary';
import { MedicalStatusBadge } from './medical-status-badge';

/**
 * The vaccination register: one row per horse per vaccine, most urgent first.
 *
 * Status is never stored — it is calculated from the dates every time it is
 * shown (see `vaccinationStatus`), so a row cannot claim to be up to date next
 * to a date that has already passed. Overdue wins over a booking on purpose: a
 * late dose stays flagged even once the next appointment is in the diary, and
 * the booked date is still shown on the row.
 *
 * Wide screens get a table; below `lg` the same rows become cards, because a
 * five-column table that narrow either scrolls sideways or shrinks past reading.
 */

/** "12 Oct 2026 · In 3 weeks" — the date that matters, and how far away it is. */
function targetLabel(vaccination: Vaccination): string | null {
  const date = vaccinationTargetDate(vaccination);
  return date ? `${formatRecordDate(date)} · ${formatRelativeDay(date)}` : null;
}

export function VaccinationFilterBar({
  filters,
  onChange,
  horses,
}: {
  filters: VaccinationFilters;
  onChange: (filters: VaccinationFilters) => void;
  horses: HorseOption[];
}) {
  const id = useId();

  return (
    <div className="flex flex-wrap gap-2">
      <label className="sr-only" htmlFor={`${id}-horse`}>
        Filter vaccinations by horse
      </label>
      <Select
        id={`${id}-horse`}
        className="h-10 w-full sm:w-56"
        value={filters.horseId ?? ''}
        onChange={(event) => onChange({ ...filters, horseId: event.target.value || null })}
      >
        <option value="">All horses</option>
        {horses.map((horse) => (
          <option key={horse.id} value={horse.id}>
            {horse.name}
          </option>
        ))}
      </Select>

      <label className="sr-only" htmlFor={`${id}-status`}>
        Filter vaccinations by status
      </label>
      <Select
        id={`${id}-status`}
        className="h-10 w-full sm:w-48"
        value={filters.status ?? ''}
        onChange={(event) =>
          onChange({ ...filters, status: (event.target.value || null) as VaccinationStatus | null })
        }
      >
        <option value="">All statuses</option>
        {vaccinationStatusOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
    </div>
  );
}

export function VaccinationList({
  vaccinations,
  showHorse = true,
  compact = false,
}: {
  vaccinations: Vaccination[];
  showHorse?: boolean;
  /** Cards at every width — for a panel too narrow for the table, such as the
      vaccination card on a horse's medical profile. */
  compact?: boolean;
}) {
  if (compact) {
    return <VaccinationCards vaccinations={vaccinations} showHorse={showHorse} compact />;
  }

  return (
    <>
      {/* Wide screens: a table. */}
      <div className="rounded-card hidden overflow-hidden border border-stone-200 bg-white lg:block">
        <table className="w-full border-collapse text-left">
          <caption className="sr-only">Vaccinations</caption>
          <thead>
            <tr className="border-b border-stone-200 text-sm text-stone-600">
              {showHorse ? (
                <th scope="col" className="px-5 py-3 font-medium">
                  Horse
                </th>
              ) : null}
              <th scope="col" className={`py-3 font-medium ${showHorse ? 'px-3' : 'px-5'}`}>
                Vaccine
              </th>
              <th scope="col" className="px-3 py-3 font-medium">
                Last given
              </th>
              <th scope="col" className="px-3 py-3 font-medium">
                Next due
              </th>
              <th scope="col" className="hidden px-3 py-3 font-medium xl:table-cell">
                Veterinarian
              </th>
              <th scope="col" className="px-5 py-3 font-medium">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-200">
            {vaccinations.map((vaccination) => {
              const status = vaccinationStatus(vaccination);
              const target = vaccinationTargetDate(vaccination);

              return (
                <tr key={vaccination.id} className="hover:bg-stone-50">
                  {showHorse ? (
                    <th scope="row" className="px-5 py-3 font-medium">
                      {vaccination.horseName}
                    </th>
                  ) : null}
                  <td className={`py-3 ${showHorse ? 'px-3' : 'px-5 font-medium'}`}>
                    {vaccination.vaccineName}
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    {vaccination.administeredOn ? (
                      <time dateTime={vaccination.administeredOn}>
                        {formatRecordDate(vaccination.administeredOn)}
                      </time>
                    ) : (
                      <span className="text-stone-500 italic">{NOT_RECORDED}</span>
                    )}
                  </td>
                  <td className="px-3 py-3">
                    {target ? (
                      <>
                        <time dateTime={target} className="block whitespace-nowrap">
                          {formatRecordDate(target)}
                        </time>
                        <span className="text-sm text-stone-600">{formatRelativeDay(target)}</span>
                      </>
                    ) : (
                      <span className="text-stone-500 italic">No further dose planned</span>
                    )}
                  </td>
                  <td className="hidden px-3 py-3 xl:table-cell">
                    {vaccination.veterinarian ?? (
                      <span className="text-stone-500 italic">{NOT_RECORDED}</span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <MedicalStatusBadge status={status} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Narrow screens: the same rows as cards. */}
      <VaccinationCards vaccinations={vaccinations} showHorse={showHorse} />
    </>
  );
}

function VaccinationCards({
  vaccinations,
  showHorse,
  compact = false,
}: {
  vaccinations: Vaccination[];
  showHorse: boolean;
  compact?: boolean;
}) {
  return (
    <ul className={compact ? 'space-y-3' : 'grid gap-3 sm:grid-cols-2 lg:hidden'}>
      {vaccinations.map((vaccination) => {
        const status = vaccinationStatus(vaccination);
        const label = targetLabel(vaccination);

        return (
          <li key={vaccination.id} className="rounded-card border border-stone-200 bg-white p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h4 className="font-medium break-words">{vaccination.vaccineName}</h4>
                {showHorse ? (
                  <p className="text-sm text-stone-600">{vaccination.horseName}</p>
                ) : null}
              </div>
              <MedicalStatusBadge status={status} />
            </div>

            <dl className="mt-3 space-y-1 border-t border-stone-200 pt-3 text-sm">
              <div className="flex flex-wrap gap-x-2">
                <dt className="text-stone-600">Last given</dt>
                <dd className="font-medium">
                  {vaccination.administeredOn
                    ? formatRecordDate(vaccination.administeredOn)
                    : NOT_RECORDED}
                </dd>
              </div>
              <div className="flex flex-wrap gap-x-2">
                <dt className="text-stone-600">
                  {status === 'scheduled' ? 'Booked for' : 'Next due'}
                </dt>
                <dd className="font-medium">{label ?? 'No further dose planned'}</dd>
              </div>
            </dl>
          </li>
        );
      })}
    </ul>
  );
}
