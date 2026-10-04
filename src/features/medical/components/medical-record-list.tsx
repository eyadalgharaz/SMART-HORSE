'use client';

import { Paperclip } from 'lucide-react';
import { formatRecordDate, recordSummary } from '../format';
import type { MedicalRecord } from '../types';
import { recordTypeLabels } from '../vocabulary';
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
  if (count === 0) return null;
  return (
    <span className="inline-flex items-center gap-1 text-sm text-stone-600">
      <Paperclip className="size-3.5" aria-hidden="true" />
      {count}
      <span className="sr-only">{count === 1 ? 'attachment' : 'attachments'}</span>
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
  return (
    <>
      <div className="rounded-card hidden overflow-hidden border border-stone-200 bg-white lg:block">
        <table className="w-full border-collapse text-left">
          <caption className="sr-only">Medical records</caption>
          <thead>
            <tr className="border-b border-stone-200 text-sm text-stone-600">
              <th scope="col" className="px-5 py-3 font-medium">
                Date
              </th>
              <th scope="col" className="px-3 py-3 font-medium">
                Horse
              </th>
              <th scope="col" className="px-3 py-3 font-medium">
                Record
              </th>
              <th scope="col" className="px-3 py-3 font-medium">
                Type
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
            {records.map((record) => (
              <tr key={record.id} className="hover:bg-stone-50">
                <td className="px-5 py-3 align-top whitespace-nowrap">
                  <time dateTime={record.date}>{formatRecordDate(record.date)}</time>
                </td>
                <td className="px-3 py-3 align-top">{record.horseName}</td>
                <th scope="row" className="px-3 py-3 align-top font-normal">
                  <button
                    type="button"
                    onClick={() => onSelect(record)}
                    className="hover:text-pasture-600 block text-left font-medium hover:underline"
                  >
                    {record.title}
                  </button>
                  <span className="mt-0.5 flex items-center gap-3">
                    <span className="line-clamp-1 text-sm text-stone-600">
                      {recordSummary(record)}
                    </span>
                    <AttachmentCount count={record.attachments.length} />
                  </span>
                </th>
                <td className="px-3 py-3 align-top">
                  <RecordTypeLabel type={record.recordType} />
                </td>
                <td className="hidden px-3 py-3 align-top xl:table-cell">
                  {record.veterinarian ?? <span className="text-stone-500 italic">No vet</span>}
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
          const summary = recordSummary(record);
          return (
            <li key={record.id}>
              <button
                type="button"
                onClick={() => onSelect(record)}
                className="rounded-card h-full w-full border border-stone-200 bg-white p-4 text-left hover:bg-stone-50"
              >
                <span className="flex items-start justify-between gap-3">
                  <span className="min-w-0">
                    <span className="block font-medium break-words">{record.title}</span>
                    <span className="block text-sm text-stone-600">
                      {record.horseName} · {recordTypeLabels[record.recordType]}
                    </span>
                  </span>
                  <MedicalStatusBadge status={record.status} />
                </span>

                {summary ? (
                  <span className="mt-2 line-clamp-2 block text-sm text-stone-600">{summary}</span>
                ) : null}

                <span className="mt-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-t border-stone-200 pt-3 text-sm text-stone-600">
                  <time dateTime={record.date}>{formatRecordDate(record.date)}</time>
                  <span className="flex items-center gap-3">
                    <AttachmentCount count={record.attachments.length} />
                    <span className="truncate">{record.veterinarian ?? 'No vet'}</span>
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
