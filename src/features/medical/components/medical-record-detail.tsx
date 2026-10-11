'use client';

import Link from 'next/link';
import { Pencil } from 'lucide-react';
import { ButtonLink } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { useI18n } from '@/i18n';
import { formatRecordDate, formatRelativeDay } from '../format';
import type { MedicalRecord } from '../types';
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
  const { t } = useI18n();
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
        {value ?? t.medical.notRecorded}
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
  const { t, tc, locale } = useI18n();
  if (!record) return null;

  const f = t.medical.fields;
  const d = t.medical.detail;
  const localized = (value: string | null) => (value ? tc(value) : null);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={tc(record.title)}
      description={`${tc(record.horseName)} · ${formatRecordDate(record.date, locale)}`}
      footer={
        <ButtonLink
          href={`/medical/horses/${record.horseId}/edit/${record.id}`}
          variant="secondary"
        >
          <Pencil className="size-4" aria-hidden="true" />
          {d.editRecord}
        </ButtonLink>
      }
    >
      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <RecordTypeLabel type={record.recordType} />
          <MedicalStatusBadge status={record.status} />
        </div>

        <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
          <Field label={f.date} value={formatRecordDate(record.date, locale)} />
          <div className="min-w-0">
            <dt className="text-sm text-stone-600">{f.horse}</dt>
            <dd className="mt-0.5 font-medium">
              <Link
                href={`/medical/horses/${record.horseId}`}
                className="hover:text-pasture-600 underline underline-offset-2"
              >
                {tc(record.horseName)}
              </Link>
            </dd>
          </div>
          <Field label={f.veterinarian} value={localized(record.veterinarian)} />
          <Field label={f.recordType} value={t.medical.recordTypes[record.recordType]} />
        </dl>

        <div className="border-t border-stone-200 pt-4">
          <h3 className="text-sm font-semibold">{d.clinical}</h3>
          <dl className="mt-3 grid gap-x-6 gap-y-4 sm:grid-cols-2">
            <Field label={f.diagnosis} value={localized(record.diagnosis)} />
            <Field label={f.medication} value={localized(record.medication)} />
            <div className="sm:col-span-2">
              <Field label={f.treatment} value={localized(record.treatment)} />
            </div>
            {record.vaccine ? (
              <>
                <Field label={f.vaccine} value={tc(record.vaccine.name)} />
                <Field
                  label={f.nextDoseDue}
                  value={
                    record.vaccine.nextDueDate
                      ? formatRecordDate(record.vaccine.nextDueDate, locale)
                      : null
                  }
                />
              </>
            ) : null}
            <div className="sm:col-span-2">
              <Field label={f.notes} value={localized(record.notes)} />
            </div>
          </dl>
        </div>

        <div className="border-t border-stone-200 pt-4">
          <h3 className="text-sm font-semibold">{d.followUp}</h3>
          {record.followUpDate ? (
            <dl className="mt-3 grid gap-x-6 gap-y-4 sm:grid-cols-2">
              <div className="min-w-0">
                <dt className="text-sm text-stone-600">{f.followUpDate}</dt>
                <dd className="mt-0.5 font-medium">
                  <time dateTime={record.followUpDate}>
                    {formatRecordDate(record.followUpDate, locale)}
                  </time>
                  <span className="ms-2 font-normal text-stone-600">
                    ({formatRelativeDay(record.followUpDate, undefined, locale)})
                  </span>
                </dd>
              </div>
              <div className="sm:col-span-2">
                <Field label={f.followUpNotes} value={localized(record.followUpNotes)} />
              </div>
            </dl>
          ) : (
            <p className="mt-2 text-sm text-stone-600">{d.noFollowUp}</p>
          )}
        </div>

        <div className="border-t border-stone-200 pt-4">
          <h3 className="text-sm font-semibold">{d.attachments}</h3>
          <div className="mt-3">
            <MedicalAttachmentList attachments={record.attachments} />
          </div>
        </div>
      </div>
    </Modal>
  );
}
