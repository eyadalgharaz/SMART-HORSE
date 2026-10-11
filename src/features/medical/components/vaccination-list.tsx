'use client';

import { useId } from 'react';
import { Select } from '@/components/ui/select';
import { sortByLabel, useI18n } from '@/i18n';
import {
  formatRecordDate,
  formatRelativeDay,
  vaccinationStatus,
  vaccinationTargetDate,
} from '../format';
import type { HorseOption, Vaccination, VaccinationFilters, VaccinationStatus } from '../types';
import { vaccinationStatusValues } from '../vocabulary';
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
  const { t, tc, locale } = useI18n();

  return (
    <div className="flex flex-wrap gap-2">
      <label className="sr-only" htmlFor={`${id}-horse`}>
        {t.medical.filters.vaccinationsByHorse}
      </label>
      <Select
        id={`${id}-horse`}
        className="h-10 w-full sm:w-56"
        value={filters.horseId ?? ''}
        onChange={(event) => onChange({ ...filters, horseId: event.target.value || null })}
      >
        <option value="">{t.common.allHorses}</option>
        {sortByLabel(horses, (horse) => tc(horse.name), locale).map((horse) => (
          <option key={horse.id} value={horse.id}>
            {tc(horse.name)}
          </option>
        ))}
      </Select>

      <label className="sr-only" htmlFor={`${id}-status`}>
        {t.medical.filters.vaccinationsByStatus}
      </label>
      <Select
        id={`${id}-status`}
        className="h-10 w-full sm:w-48"
        value={filters.status ?? ''}
        onChange={(event) =>
          onChange({ ...filters, status: (event.target.value || null) as VaccinationStatus | null })
        }
      >
        <option value="">{t.common.allStatuses}</option>
        {vaccinationStatusValues.map((value) => (
          <option key={value} value={value}>
            {t.medical.statuses[value]}
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
  const { t, tc, locale } = useI18n();
  const v = t.medical.vaccinations;

  if (compact) {
    return <VaccinationCards vaccinations={vaccinations} showHorse={showHorse} compact />;
  }

  return (
    <>
      {/* Wide screens: a table. */}
      <div className="rounded-card hidden overflow-hidden border border-stone-200 bg-white lg:block">
        <table className="w-full border-collapse text-start">
          <caption className="sr-only">{v.caption}</caption>
          <thead>
            <tr className="border-b border-stone-200 text-sm text-stone-600">
              {showHorse ? (
                <th scope="col" className="px-5 py-3 font-medium">
                  {t.medical.fields.horse}
                </th>
              ) : null}
              <th scope="col" className={`py-3 font-medium ${showHorse ? 'px-3' : 'px-5'}`}>
                {v.vaccine}
              </th>
              <th scope="col" className="px-3 py-3 font-medium">
                {v.lastGiven}
              </th>
              <th scope="col" className="px-3 py-3 font-medium">
                {v.nextDue}
              </th>
              <th scope="col" className="hidden px-3 py-3 font-medium xl:table-cell">
                {t.medical.fields.veterinarian}
              </th>
              <th scope="col" className="px-5 py-3 font-medium">
                {t.medical.fields.status}
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
                      {tc(vaccination.horseName)}
                    </th>
                  ) : null}
                  <td className={`py-3 ${showHorse ? 'px-3' : 'px-5 font-medium'}`}>
                    {tc(vaccination.vaccineName)}
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    {vaccination.administeredOn ? (
                      <time dateTime={vaccination.administeredOn}>
                        {formatRecordDate(vaccination.administeredOn, locale)}
                      </time>
                    ) : (
                      <span className="text-stone-500 italic">{t.medical.notRecorded}</span>
                    )}
                  </td>
                  <td className="px-3 py-3">
                    {target ? (
                      <>
                        <time dateTime={target} className="block whitespace-nowrap">
                          {formatRecordDate(target, locale)}
                        </time>
                        <span className="text-sm text-stone-600">
                          {formatRelativeDay(target, undefined, locale)}
                        </span>
                      </>
                    ) : (
                      <span className="text-stone-500 italic">{v.noFurtherDose}</span>
                    )}
                  </td>
                  <td className="hidden px-3 py-3 xl:table-cell">
                    {vaccination.veterinarian ? (
                      tc(vaccination.veterinarian)
                    ) : (
                      <span className="text-stone-500 italic">{t.medical.notRecorded}</span>
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
  const { t, tc, locale } = useI18n();
  const v = t.medical.vaccinations;

  /** "12 Oct 2026 · In 3 weeks" — the date that matters, and how far away it is. */
  function targetLabel(vaccination: Vaccination): string | null {
    const date = vaccinationTargetDate(vaccination);
    return date
      ? `${formatRecordDate(date, locale)} · ${formatRelativeDay(date, undefined, locale)}`
      : null;
  }

  return (
    <ul className={compact ? 'space-y-3' : 'grid gap-3 sm:grid-cols-2 lg:hidden'}>
      {vaccinations.map((vaccination) => {
        const status = vaccinationStatus(vaccination);
        const label = targetLabel(vaccination);

        return (
          <li key={vaccination.id} className="rounded-card border border-stone-200 bg-white p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h4 className="font-medium break-words">{tc(vaccination.vaccineName)}</h4>
                {showHorse ? (
                  <p className="text-sm text-stone-600">{tc(vaccination.horseName)}</p>
                ) : null}
              </div>
              <MedicalStatusBadge status={status} />
            </div>

            <dl className="mt-3 space-y-1 border-t border-stone-200 pt-3 text-sm">
              <div className="flex flex-wrap gap-x-2">
                <dt className="text-stone-600">{v.lastGiven}</dt>
                <dd className="font-medium">
                  {vaccination.administeredOn
                    ? formatRecordDate(vaccination.administeredOn, locale)
                    : t.medical.notRecorded}
                </dd>
              </div>
              <div className="flex flex-wrap gap-x-2">
                <dt className="text-stone-600">
                  {status === 'scheduled' ? v.bookedFor : v.nextDue}
                </dt>
                <dd className="font-medium">{label ?? v.noFurtherDose}</dd>
              </div>
            </dl>
          </li>
        );
      })}
    </ul>
  );
}
