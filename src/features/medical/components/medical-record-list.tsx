'use client';

import { Paperclip } from 'lucide-react';
import { useI18n } from '@/i18n';
import { formatRecordDate, recordSummary } from '../format';
import type { MedicalRecord } from '../types';
import { MedicalStatusBadge, RecordTypeLabel } from './medical-status-badge';

/**
 * The records list. A table from `lg` up, cards below — the same choice the
 * Horses list makes, for the same reason: a six-column table on a phone either
 * scrolls sideways or shrinks past reading.
 *
 * Opening a record is the row's one action, and it opens the detail dialog
 * rather than navigating, so the reader keeps their place in a long list. In the
 * table the record's title is the button, which gives the action an accessible
 * name of its own; on a card the whole tile is the button.
 */

function AttachmentCount({ count }: { count: number }) {
  const { t } = useI18n();
  if (count === 0) return null;
  return (
    <span className="inline-flex items-center gap-1 text-sm text-stone-600">
      <Paperclip className="size-3.5" aria-hidden="true" />
      {count}
      <span className="sr-only">{t.medical.list.attachmentsSr(count)}</span>
    </span>
  );
}

export function MedicalRecordList({
  records,
  onSelect,
}: {
  records: MedicalRecord[];
  onSelect: (record: MedicalRecord) => void;
}) {
  const { t, tc, locale } = useI18n();
  const f = t.medical.fields;

  return (
    <>
      <div className="rounded-card hidden overflow-hidden border border-stone-200 bg-white lg:block">
        <table className="w-full border-collapse text-start">
          <caption className="sr-only">{t.medical.list.caption}</caption>
          <thead>
            <tr className="border-b border-stone-200 text-sm text-stone-600">
              <th scope="col" className="px-5 py-3 font-medium">
                {f.date}
              </th>
              <th scope="col" className="px-3 py-3 font-medium">
                {f.horse}
              </th>
              <th scope="col" className="px-3 py-3 font-medium">
                {t.medical.list.record}
              </th>
              <th scope="col" className="px-3 py-3 font-medium">
                {t.medical.list.type}
              </th>
              <th scope="col" className="hidden px-3 py-3 font-medium xl:table-cell">
                {f.veterinarian}
              </th>
              <th scope="col" className="px-5 py-3 font-medium">
                {f.status}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-200">
            {records.map((record) => (
              <tr key={record.id} className="hover:bg-stone-50">
                <td className="px-5 py-3 align-top whitespace-nowrap">
                  <time dateTime={record.date}>{formatRecordDate(record.date, locale)}</time>
                </td>
                <td className="px-3 py-3 align-top">{tc(record.horseName)}</td>
                <th scope="row" className="px-3 py-3 align-top font-normal">
                  <button
                    type="button"
                    onClick={() => onSelect(record)}
                    className="hover:text-pasture-600 block text-start font-medium hover:underline"
                  >
                    {tc(record.title)}
                  </button>
                  <span className="mt-0.5 flex items-center gap-3">
                    <span className="line-clamp-1 text-sm text-stone-600">
                      {recordSummary(record, locale, tc)}
                    </span>
                    <AttachmentCount count={record.attachments.length} />
                  </span>
                </th>
                <td className="px-3 py-3 align-top">
                  <RecordTypeLabel type={record.recordType} />
                </td>
                <td className="hidden px-3 py-3 align-top xl:table-cell">
                  {record.veterinarian ? (
                    tc(record.veterinarian)
                  ) : (
                    <span className="text-stone-500 italic">{t.medical.list.noVet}</span>
                  )}
                </td>
                <td className="px-5 py-3 align-top">
                  <MedicalStatusBadge status={record.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="grid gap-3 sm:grid-cols-2 lg:hidden">
        {records.map((record) => {
          const summary = recordSummary(record, locale, tc);
          return (
            <li key={record.id}>
              <button
                type="button"
                onClick={() => onSelect(record)}
                className="rounded-card h-full w-full border border-stone-200 bg-white p-4 text-start hover:bg-stone-50"
              >
                <span className="flex items-start justify-between gap-3">
                  <span className="min-w-0">
                    <span className="block font-medium break-words">{tc(record.title)}</span>
                    <span className="block text-sm text-stone-600">
                      {tc(record.horseName)} · {t.medical.recordTypes[record.recordType]}
                    </span>
                  </span>
                  <MedicalStatusBadge status={record.status} />
                </span>

                {summary ? (
                  <span className="mt-2 line-clamp-2 block text-sm text-stone-600">{summary}</span>
                ) : null}

                <span className="mt-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-t border-stone-200 pt-3 text-sm text-stone-600">
                  <time dateTime={record.date}>{formatRecordDate(record.date, locale)}</time>
                  <span className="flex items-center gap-3">
                    <AttachmentCount count={record.attachments.length} />
                    <span className="truncate">
                      {record.veterinarian ? tc(record.veterinarian) : t.medical.list.noVet}
                    </span>
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </>
  );
}
