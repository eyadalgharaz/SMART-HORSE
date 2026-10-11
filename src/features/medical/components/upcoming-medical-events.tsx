'use client';

import type { LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { CalendarCheck, Pill, Stethoscope, Syringe } from 'lucide-react';
import { useI18n } from '@/i18n';
import {
  formatRecordDate,
  formatRelativeDay,
  sortUpcomingEvents,
  upcomingEventStatus,
} from '../format';
import type { UpcomingEventKind, UpcomingMedicalEvent } from '../types';
import { MedicalStatusBadge } from './medical-status-badge';

/**
 * What is coming up, soonest first: booked visits, follow-ups and doses that are
 * due. Used for the whole farm on the Medical overview and for one horse on its
 * medical profile — `showHorse` is the only difference, because repeating the
 * horse's name on its own page would be noise.
 *
 * Status is calculated from the date, so a row cannot say "Scheduled" about a
 * date that has passed. Colour is kept for the two states that need a decision;
 * everything routine stays neutral.
 */

const kindIcons: Record<UpcomingEventKind, LucideIcon> = {
  'vaccination-due': Syringe,
  'follow-up': CalendarCheck,
  checkup: Stethoscope,
  'medication-review': Pill,
  visit: Stethoscope,
};

export function UpcomingMedicalEvents({
  events,
  showHorse = true,
  limit,
}: {
  events: UpcomingMedicalEvent[];
  showHorse?: boolean;
  /** Keeps a summary panel short; the full list lives on the Upcoming tab. */
  limit?: number;
}) {
  const { t, tc, locale } = useI18n();
  const ordered = sortUpcomingEvents(events);
  const shown = limit ? ordered.slice(0, limit) : ordered;

  return (
    <ul className="divide-y divide-stone-200">
      {shown.map((event) => {
        const Icon = kindIcons[event.kind];
        const status = upcomingEventStatus(event);
        const relative = formatRelativeDay(event.date, undefined, locale);

        return (
          <li key={event.id} className="flex gap-3 py-3 first:pt-0 last:pb-0">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-stone-100 text-stone-700">
              <Icon className="size-4" aria-hidden="true" />
            </span>

            <div className="flex min-w-0 flex-1 flex-col gap-1.5 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
              <div className="min-w-0">
                <p className="font-medium break-words">
                  {event.recordId ? (
                    <Link
                      href={`/medical/horses/${event.horseId}`}
                      className="hover:text-pasture-600"
                    >
                      {tc(event.title)}
                    </Link>
                  ) : (
                    tc(event.title)
                  )}
                </p>
                <p className="flex flex-wrap items-center gap-x-2 text-sm text-stone-600">
                  {showHorse ? <span>{tc(event.horseName)}</span> : null}
                  <span>{t.medical.eventKinds[event.kind]}</span>
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 sm:shrink-0 sm:flex-col sm:items-end sm:gap-1">
                <time dateTime={event.date} className="text-sm whitespace-nowrap text-stone-600">
                  {formatRecordDate(event.date, locale)}
                </time>
                <span className="flex items-center gap-2">
                  <span className="text-sm whitespace-nowrap text-stone-500 sm:hidden">
                    {relative}
                  </span>
                  <MedicalStatusBadge status={status} />
                </span>
                <span className="hidden text-sm whitespace-nowrap text-stone-500 sm:block">
                  {relative}
                </span>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
