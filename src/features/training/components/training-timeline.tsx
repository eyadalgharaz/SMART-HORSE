'use client';

import Link from 'next/link';
import { Pencil } from 'lucide-react';
import { useI18n } from '@/i18n';
import {
  formatDistance,
  formatDuration,
  formatShortDate,
  formatSpeed,
  groupSessionsByYear,
} from '../format';
import type { TrainingSession } from '../types';
import { TrainingSessionStatusBadge, TrainingTypeIcon } from './training-status-badge';

/**
 * A horse's training history as a chronological timeline, newest first,
 * grouped under the year each session belongs to. Mirrors the Medical
 * timeline's shape — a rail on the reading-start edge with a marker per
 * session — so the two modules read as one product.
 *
 * Each row links straight to that session's edit page: unlike Medical there
 * is no separate detail dialog for a session, so editing is the one
 * available action.
 */
export function TrainingTimeline({
  sessions,
}: {
  /** Already sorted newest first by the service. */
  sessions: TrainingSession[];
}) {
  const { t, tc, locale } = useI18n();
  const years = groupSessionsByYear(sessions);

  return (
    <div className="space-y-6">
      {years.map((group) => (
        <section key={group.year} aria-labelledby={`training-timeline-${group.year}`}>
          <h4
            id={`training-timeline-${group.year}`}
            className="text-sm font-semibold text-stone-600 tabular-nums"
          >
            {group.year}
          </h4>

          <ul className="mt-2 border-s border-stone-200 ps-4 sm:ps-5">
            {group.sessions.map((session) => {
              const distance = formatDistance(session.distanceKm, locale);
              const speed = formatSpeed(session.avgSpeedKmh, locale);
              return (
                <li key={session.id} className="relative py-1.5 first:pt-0.5 last:pb-0.5">
                  <span
                    aria-hidden="true"
                    className="bg-pasture-500 absolute -start-[1.3125rem] top-5 size-2 rounded-full ring-4 ring-white sm:-start-[1.5625rem]"
                  />

                  <Link
                    href={`/training/horses/${session.horseId}/edit/${session.id}`}
                    className="block w-full rounded-md px-3 py-2.5 hover:bg-stone-50"
                  >
                    <span className="flex items-start gap-3">
                      <TrainingTypeIcon type={session.trainingType} />

                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-baseline gap-x-2">
                          <time
                            dateTime={session.date}
                            className="text-sm font-medium whitespace-nowrap text-stone-600 tabular-nums"
                          >
                            {formatShortDate(session.date, locale)}
                          </time>
                          <span className="text-sm text-stone-500">
                            {t.training.types[session.trainingType]}
                          </span>
                        </span>

                        <span className="mt-0.5 block font-medium break-words">
                          {tc(session.title)}
                        </span>

                        {session.result ? (
                          <span className="mt-0.5 line-clamp-2 block text-sm text-stone-600">
                            {tc(session.result)}
                          </span>
                        ) : null}

                        <span className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm text-stone-600">
                          <span>{tc(session.trainerName)}</span>
                          <span>{formatDuration(session.durationMinutes, locale)}</span>
                          {distance ? <span>{distance}</span> : null}
                          {speed ? <span>{speed}</span> : null}
                          <TrainingSessionStatusBadge status={session.status} />
                        </span>
                      </span>

                      <Pencil
                        className="mt-1 size-3.5 shrink-0 text-stone-400"
                        aria-hidden="true"
                      />
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
