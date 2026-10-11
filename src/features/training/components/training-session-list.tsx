'use client';

import Link from 'next/link';
import { Pencil } from 'lucide-react';
import { useI18n } from '@/i18n';
import { formatDistance, formatDuration, formatSessionDate, formatSpeed } from '../format';
import type { TrainingSession } from '../types';
import { TrainingSessionStatusBadge, TrainingTypeLabel } from './training-status-badge';

/**
 * The sessions list. A table from `lg` up, cards below — the same choice the
 * Horses and Medical lists make, for the same reason: a nine-column table on
 * a phone either scrolls sideways or shrinks past reading.
 *
 * The horse name links to that horse's training profile; the row's edit
 * action goes straight to the session's own edit page, since editing a
 * session is a full-page flow in this module rather than a dialog.
 */

function MetricCell({ value }: { value: string | null }) {
  if (value === null) return <span className="text-stone-500 italic">—</span>;
  return <span className="tabular-nums">{value}</span>;
}

export function TrainingSessionList({ sessions }: { sessions: TrainingSession[] }) {
  const { t, tc, locale } = useI18n();
  const l = t.training.list;

  return (
    <>
      <div className="rounded-card hidden overflow-hidden border border-stone-200 bg-white lg:block">
        <table className="w-full border-collapse text-start">
          <caption className="sr-only">{l.caption}</caption>
          <thead>
            <tr className="border-b border-stone-200 text-sm text-stone-600">
              <th scope="col" className="px-5 py-3 font-medium">
                {l.horse}
              </th>
              <th scope="col" className="px-3 py-3 font-medium">
                {l.type}
              </th>
              <th scope="col" className="hidden px-3 py-3 font-medium xl:table-cell">
                {l.trainer}
              </th>
              <th scope="col" className="px-3 py-3 font-medium">
                {l.date}
              </th>
              <th scope="col" className="px-3 py-3 font-medium">
                {l.duration}
              </th>
              <th scope="col" className="hidden px-3 py-3 font-medium xl:table-cell">
                {l.distance}
              </th>
              <th scope="col" className="hidden px-3 py-3 font-medium xl:table-cell">
                {l.avgSpeed}
              </th>
              <th scope="col" className="px-3 py-3 font-medium">
                {l.status}
              </th>
              <th scope="col" className="px-5 py-3 text-end font-medium">
                <span className="sr-only">{t.common.actions}</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-200">
            {sessions.map((session) => (
              <tr key={session.id} className="hover:bg-stone-50">
                <th scope="row" className="px-5 py-3 align-top font-normal">
                  <Link
                    href={`/training/horses/${session.horseId}`}
                    className="hover:text-pasture-600 block font-medium hover:underline"
                  >
                    {tc(session.horseName)}
                  </Link>
                  <span className="mt-0.5 block text-sm text-stone-600">{tc(session.title)}</span>
                </th>
                <td className="px-3 py-3 align-top">
                  <TrainingTypeLabel type={session.trainingType} />
                </td>
                <td className="hidden px-3 py-3 align-top xl:table-cell">
                  {tc(session.trainerName)}
                </td>
                <td className="px-3 py-3 align-top whitespace-nowrap">
                  <time dateTime={session.date}>{formatSessionDate(session.date, locale)}</time>
                </td>
                <td className="px-3 py-3 align-top whitespace-nowrap">
                  {formatDuration(session.durationMinutes, locale)}
                </td>
                <td className="hidden px-3 py-3 align-top xl:table-cell">
                  <MetricCell value={formatDistance(session.distanceKm, locale)} />
                </td>
                <td className="hidden px-3 py-3 align-top xl:table-cell">
                  <MetricCell value={formatSpeed(session.avgSpeedKmh, locale)} />
                </td>
                <td className="px-3 py-3 align-top">
                  <TrainingSessionStatusBadge status={session.status} />
                </td>
                <td className="px-5 py-3 text-end align-top">
                  <Link
                    href={`/training/horses/${session.horseId}/edit/${session.id}`}
                    aria-label={l.editLabel(tc(session.title), tc(session.horseName))}
                    className="text-pasture-500 hover:text-pasture-700 -my-1 inline-flex items-center gap-1 rounded-md px-1.5 py-1.5 text-sm font-medium hover:underline"
                  >
                    <Pencil className="size-4" aria-hidden="true" />
                    {l.edit}
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="grid gap-3 sm:grid-cols-2 lg:hidden">
        {sessions.map((session) => {
          const distance = formatDistance(session.distanceKm, locale);
          const speed = formatSpeed(session.avgSpeedKmh, locale);
          return (
            <li key={session.id}>
              <div className="rounded-card border border-stone-200 bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link
                      href={`/training/horses/${session.horseId}`}
                      className="hover:text-pasture-600 block truncate font-medium hover:underline"
                    >
                      {tc(session.horseName)}
                    </Link>
                    <span className="block text-sm text-stone-600">{tc(session.title)}</span>
                  </div>
                  <TrainingSessionStatusBadge status={session.status} />
                </div>

                <div className="mt-2">
                  <TrainingTypeLabel type={session.trainingType} />
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-stone-200 pt-3 text-sm text-stone-600">
                  <time dateTime={session.date}>{formatSessionDate(session.date, locale)}</time>
                  <span>{formatDuration(session.durationMinutes, locale)}</span>
                  <span className="truncate">{tc(session.trainerName)}</span>
                </div>

                {distance || speed ? (
                  <div className="mt-1.5 flex flex-wrap gap-x-3 text-sm text-stone-600">
                    {distance ? <span>{distance}</span> : null}
                    {speed ? <span>{speed}</span> : null}
                  </div>
                ) : null}

                <div className="mt-3 border-t border-stone-200 pt-3">
                  <Link
                    href={`/training/horses/${session.horseId}/edit/${session.id}`}
                    aria-label={l.editLabel(tc(session.title), tc(session.horseName))}
                    className="text-pasture-500 hover:text-pasture-700 inline-flex min-h-9 items-center gap-1 text-sm font-medium hover:underline"
                  >
                    <Pencil className="size-4" aria-hidden="true" />
                    {l.editSession}
                  </Link>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
}
