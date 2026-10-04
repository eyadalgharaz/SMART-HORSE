import Link from 'next/link';
import { Pencil } from 'lucide-react';
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
  return (
    <>
      <div className="rounded-card hidden overflow-hidden border border-stone-200 bg-white lg:block">
        <table className="w-full border-collapse text-left">
          <caption className="sr-only">Training sessions</caption>
          <thead>
            <tr className="border-b border-stone-200 text-sm text-stone-600">
              <th scope="col" className="px-5 py-3 font-medium">
                Horse
              </th>
              <th scope="col" className="px-3 py-3 font-medium">
                Type
              </th>
              <th scope="col" className="hidden px-3 py-3 font-medium xl:table-cell">
                Trainer
              </th>
              <th scope="col" className="px-3 py-3 font-medium">
                Date
              </th>
              <th scope="col" className="px-3 py-3 font-medium">
                Duration
              </th>
              <th scope="col" className="hidden px-3 py-3 font-medium xl:table-cell">
                Distance
              </th>
              <th scope="col" className="hidden px-3 py-3 font-medium xl:table-cell">
                Avg speed
              </th>
              <th scope="col" className="px-3 py-3 font-medium">
                Status
              </th>
              <th scope="col" className="px-5 py-3 text-right font-medium">
                <span className="sr-only">Actions</span>
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
                    {session.horseName}
                  </Link>
                  <span className="mt-0.5 block text-sm text-stone-600">{session.title}</span>
                </th>
                <td className="px-3 py-3 align-top">
                  <TrainingTypeLabel type={session.trainingType} />
                </td>
                <td className="hidden px-3 py-3 align-top xl:table-cell">{session.trainerName}</td>
                <td className="px-3 py-3 align-top whitespace-nowrap">
                  <time dateTime={session.date}>{formatSessionDate(session.date)}</time>
                </td>
                <td className="px-3 py-3 align-top whitespace-nowrap">
                  {formatDuration(session.durationMinutes)}
                </td>
                <td className="hidden px-3 py-3 align-top xl:table-cell">
                  <MetricCell value={formatDistance(session.distanceKm)} />
                </td>
                <td className="hidden px-3 py-3 align-top xl:table-cell">
                  <MetricCell value={formatSpeed(session.avgSpeedKmh)} />
                </td>
                <td className="px-3 py-3 align-top">
                  <TrainingSessionStatusBadge status={session.status} />
                </td>
                <td className="px-5 py-3 text-right align-top">
                  <Link
                    href={`/training/horses/${session.horseId}/edit/${session.id}`}
                    aria-label={`Edit ${session.title} for ${session.horseName}`}
                    className="text-pasture-500 hover:text-pasture-700 -my-1 inline-flex items-center gap-1 rounded-md px-1.5 py-1.5 text-sm font-medium hover:underline"
                  >
                    <Pencil className="size-4" aria-hidden="true" />
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="grid gap-3 sm:grid-cols-2 lg:hidden">
        {sessions.map((session) => {
          const distance = formatDistance(session.distanceKm);
          const speed = formatSpeed(session.avgSpeedKmh);
          return (
            <li key={session.id}>
              <div className="rounded-card border border-stone-200 bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link
                      href={`/training/horses/${session.horseId}`}
                      className="hover:text-pasture-600 block truncate font-medium hover:underline"
                    >
                      {session.horseName}
                    </Link>
                    <span className="block text-sm text-stone-600">{session.title}</span>
                  </div>
                  <TrainingSessionStatusBadge status={session.status} />
                </div>

                <div className="mt-2">
                  <TrainingTypeLabel type={session.trainingType} />
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-stone-200 pt-3 text-sm text-stone-600">
                  <time dateTime={session.date}>{formatSessionDate(session.date)}</time>
                  <span>{formatDuration(session.durationMinutes)}</span>
                  <span className="truncate">{session.trainerName}</span>
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
                    aria-label={`Edit ${session.title} for ${session.horseName}`}
                    className="text-pasture-500 hover:text-pasture-700 inline-flex min-h-9 items-center gap-1 text-sm font-medium hover:underline"
                  >
                    <Pencil className="size-4" aria-hidden="true" />
                    Edit session
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
