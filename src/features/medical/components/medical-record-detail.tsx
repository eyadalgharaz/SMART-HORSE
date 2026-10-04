'use client';

import Link from 'next/link';
import { Pencil } from 'lucide-react';
import { ButtonLink } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { formatRecordDate, formatRelativeDay } from '../format';
import type { MedicalRecord } from '../types';
import { NOT_RECORDED, recordTypeLabels } from '../vocabulary';
import { MedicalAttachmentList } from './medical-attachment-list';
import { MedicalStatusBadge, RecordTypeLabel } from './medical-status-badge';

/**
 * Everything on one record, opened from the list or the timeline.
 *
 * A dialog rather than a page: a reader scanning forty records or a horse's
 * timeline is usually comparing entries, and sending them to another screen and
 * back would lose their place each time. The only action it offers is Edit,
 * which goes to the real edit route — nothing here pretends to do something the
 * module cannot.
 */

function Field({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="min-w-0">
      <dt className="text-sm text-stone-600">{label}</dt>
      <dd
        className={
          value
            ? 'mt-0.5 font-medium break-words whitespace-pre-line'
            : 'mt-0.5 text-stone-500 italic'
        }
      >
        {value ?? NOT_RECORDED}
      </dd>
    </div>
  );
}

export function MedicalRecordDetail({
  record,
  open,
  onClose,
}: {
  record: MedicalRecord | null;
  open: boolean;
  onClose: () => void;
}) {
  if (!record) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={record.title}
      description={`${record.horseName} · ${formatRecordDate(record.date)}`}
      footer={
        <ButtonLink
          href={`/medical/horses/${record.horseId}/edit/${record.id}`}
          variant="secondary"
        >
          <Pencil className="size-4" aria-hidden="true" />
          Edit record
        </ButtonLink>
      }
    >
      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <RecordTypeLabel type={record.recordType} />
          <MedicalStatusBadge status={record.status} />
        </div>

        <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
          <Field label="Date" value={formatRecordDate(record.date)} />
          <div className="min-w-0">
            <dt className="text-sm text-stone-600">Horse</dt>
            <dd className="mt-0.5 font-medium">
              <Link
                href={`/medical/horses/${record.horseId}`}
                className="hover:text-pasture-600 underline underline-offset-2"
              >
                {record.horseName}
              </Link>
            </dd>
          </div>
          <Field label="Veterinarian" value={record.veterinarian} />
          <Field label="Record type" value={recordTypeLabels[record.recordType]} />
        </dl>

        <div className="border-t border-stone-200 pt-4">
          <h3 className="text-sm font-semibold">Clinical information</h3>
          <dl className="mt-3 grid gap-x-6 gap-y-4 sm:grid-cols-2">
            <Field label="Diagnosis" value={record.diagnosis} />
            <Field label="Medication" value={record.medication} />
            <div className="sm:col-span-2">
              <Field label="Treatment" value={record.treatment} />
            </div>
            {record.vaccine ? (
              <>
                <Field label="Vaccine" value={record.vaccine.name} />
                <Field
                  label="Next dose due"
                  value={
                    record.vaccine.nextDueDate ? formatRecordDate(record.vaccine.nextDueDate) : null
                  }
                />
              </>
            ) : null}
            <div className="sm:col-span-2">
              <Field label="Notes" value={record.notes} />
            </div>
          </dl>
        </div>

        <div className="border-t border-stone-200 pt-4">
          <h3 className="text-sm font-semibold">Follow-up</h3>
          {record.followUpDate ? (
            <dl className="mt-3 grid gap-x-6 gap-y-4 sm:grid-cols-2">
              <div className="min-w-0">
                <dt className="text-sm text-stone-600">Follow-up date</dt>
                <dd className="mt-0.5 font-medium">
                  <time dateTime={record.followUpDate}>
                    {formatRecordDate(record.followUpDate)}
                  </time>
                  <span className="ml-2 font-normal text-stone-600">
                    ({formatRelativeDay(record.followUpDate)})
                  </span>
                </dd>
              </div>
              <div className="sm:col-span-2">
                <Field label="Follow-up notes" value={record.followUpNotes} />
              </div>
            </dl>
          ) : (
            <p className="mt-2 text-sm text-stone-600">No follow-up was planned for this record.</p>
          )}
        </div>

        <div className="border-t border-stone-200 pt-4">
          <h3 className="text-sm font-semibold">Attachments</h3>
          <div className="mt-3">
            <MedicalAttachmentList attachments={record.attachments} />
          </div>
        </div>
      </div>
    </Modal>
  );
}
