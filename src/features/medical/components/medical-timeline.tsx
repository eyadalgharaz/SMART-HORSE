'use client';

import { CalendarClock, Paperclip } from 'lucide-react';
import { formatRelativeDay, formatShortDate, groupRecordsByYear, recordSummary } from '../format';
import type { MedicalRecord } from '../types';
import { MedicalStatusBadge, RecordTypeIcon } from './medical-status-badge';
import { recordTypeLabels } from '../vocabulary';

/**
 * A horse's medical history as a chronological timeline, newest first, grouped
 * under the year each record belongs to.
 *
 * The rail down the left is one continuous line with a marker per record, so
 * the eye can follow the history without every row needing its own border. Only
 * the date, the type, the title and who attended are on the row; everything else
 * is one click away in the record detail, which keeps a long history scannable.
 *
 * The whole row is the button, so the target is large enough on a phone and the
 * accessible name is the record's own title and date.
 */
export function MedicalTimeline({
  records,
  onSelect,
}: {
  /** Already sorted newest first by the service. */
  records: MedicalRecord[];
  onSelect: (record: MedicalRecord) => void;
}) {
  const years = groupRecordsByYear(records);

  return (
    <div className="space-y-6">
      {years.map((group) => (
        <section key={group.year} aria-labelledby={`timeline-${group.year}`}>
          <h4
            id={`timeline-${group.year}`}
            className="text-sm font-semibold text-stone-600 tabular-nums"
          >
            {group.year}
          </h4>

          <ul className="mt-2 border-l border-stone-200 pl-4 sm:pl-5">
            {group.records.map((record) => {
              const summary = recordSummary(record);
              return (
                <li key={record.id} className="relative py-1.5 first:pt-0.5 last:pb-0.5">
                  {/* The marker sits on the rail, centred on the row's first line. */}
                  <span
                    aria-hidden="true"
                    className="bg-pasture-500 absolute top-5 -left-[1.3125rem] size-2 rounded-full ring-4 ring-white sm:-left-[1.5625rem]"
                  />

                  <button
                    type="button"
                    onClick={() => onSelect(record)}
                    className="w-full rounded-md px-3 py-2.5 text-left hover:bg-stone-50"
                  >
                    <span className="flex items-start gap-3">
                      <RecordTypeIcon type={record.recordType} />

                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-baseline gap-x-2">
                          <time
                            dateTime={record.date}
                            className="text-sm font-medium whitespace-nowrap text-stone-600 tabular-nums"
                          >
                            {formatShortDate(record.date)}
                          </time>
                          <span className="text-sm text-stone-500">
                            {recordTypeLabels[record.recordType]}
                          </span>
                        </span>

                        <span className="mt-0.5 block font-medium break-words">{record.title}</span>

                        {summary ? (
                          <span className="mt-0.5 line-clamp-2 block text-sm text-stone-600">
                            {summary}
                          </span>
                        ) : null}

                        <span className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm text-stone-600">
                          {record.veterinarian ? <span>{record.veterinarian}</span> : null}
                          {record.attachments.length > 0 ? (
                            <span className="inline-flex items-center gap-1">
                              <Paperclip className="size-3.5" aria-hidden="true" />
                              {record.attachments.length}
                              <span className="sr-only">
                                {record.attachments.length === 1 ? 'attachment' : 'attachments'}
                              </span>
                            </span>
                          ) : null}
                          {record.status !== 'completed' ? (
                            <MedicalStatusBadge status={record.status} />
                          ) : null}
                        </span>

                        {record.followUpDate && record.status !== 'completed' ? (
                          <span className="text-ink-soft mt-1.5 flex items-center gap-1.5 text-sm">
                            <CalendarClock className="size-3.5 shrink-0" aria-hidden="true" />
                            Follow-up {formatRelativeDay(record.followUpDate).toLowerCase()}
                          </span>
                        ) : null}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
