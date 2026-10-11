'use client';

import type { LucideIcon } from 'lucide-react';
import { FileText, FlaskConical, ImageIcon, ScanLine } from 'lucide-react';
import { useI18n } from '@/i18n';
import { formatFileSize, formatRecordDate } from '../format';
import type { AttachmentType, MedicalAttachment } from '../types';

/**
 * Files attached to a record, shown as metadata only.
 *
 * There is no storage behind this phase, so the list deliberately offers no way
 * to open or download anything: a link that produced nothing, or a preview of a
 * file that does not exist, would be a promise the product cannot keep. The
 * metadata is real enough to design against, and a later phase turns each row
 * into a link without changing the layout.
 */

const icons: Record<AttachmentType, LucideIcon> = {
  'x-ray': ScanLine,
  'lab-result': FlaskConical,
  document: FileText,
  image: ImageIcon,
};

export function MedicalAttachmentList({ attachments }: { attachments: MedicalAttachment[] }) {
  const { t, locale } = useI18n();

  if (attachments.length === 0) {
    return <p className="text-sm text-stone-600">{t.medical.detail.noAttachments}</p>;
  }

  return (
    <ul className="space-y-2">
      {attachments.map((attachment) => {
        const Icon = icons[attachment.type];
        return (
          <li
            key={attachment.id}
            className="flex items-start gap-3 rounded-md border border-stone-200 px-3 py-2.5"
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-stone-100 text-stone-700">
              <Icon className="size-4" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium" dir="auto">
                {attachment.fileName}
              </p>
              <p className="text-sm text-stone-600">
                {t.medical.attachmentTypes[attachment.type]} ·{' '}
                {formatFileSize(attachment.sizeBytes, locale)} ·{' '}
                <time dateTime={attachment.addedAt}>
                  {formatRecordDate(attachment.addedAt, locale)}
                </time>
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
