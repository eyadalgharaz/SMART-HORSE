'use client';

import Link from 'next/link';
import { CalendarClock } from 'lucide-react';
import { useI18n } from '@/i18n';
import { formatDateLabel, formatSessionTime } from '../format';
import type { TrainingSession } from '../types';
import { TrainingTypeIcon } from './training-status-badge';

/**
 * What's coming up: scheduled sessions, soonest first. Compact rows rather
 * than the full session table — this list is for a quick glance at what's
 * next, not for filtering or comparing metrics.
 */
export function UpcomingTrainingSessions({
  sessions,
  showHorse = true,
}: {
  /** Already sorted soonest first by the caller. */
  sessions: TrainingSession[];
  showHorse?: boolean;
}) {
  const { tc, locale } = useI18n();

  return (
    <ul className="divide-y divide-stone-200">
      {sessions.map((session) => (
        <li key={session.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
          <TrainingTypeIcon type={session.trainingType} />

          <div className="min-w-0 flex-1">
            <Link
              href={`/training/horses/${session.horseId}/edit/${session.id}`}
              className="hover:text-pasture-600 block font-medium break-words hover:underline"
            >
              {showHorse ? `${tc(session.horseName)} — ${tc(session.title)}` : tc(session.title)}
            </Link>
            <span className="mt-0.5 flex flex-wrap items-center gap-x-2 text-sm text-stone-600">
              <span className="inline-flex items-center gap-1">
                <CalendarClock className="size-3.5" aria-hidden="true" />
                {formatDateLabel(session.date, undefined, locale)} ·{' '}
                {formatSessionTime(session.date, locale)}
              </span>
              <span>{tc(session.trainerName)}</span>
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}
