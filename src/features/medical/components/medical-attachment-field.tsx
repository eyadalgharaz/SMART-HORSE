'use client';

import { useId, useState } from 'react';
import { Paperclip, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { useI18n } from '@/i18n';
import { attachmentTypeFor, formatFileSize, formatRecordDate } from '../format';
import type { AttachmentType, MedicalAttachment } from '../types';
import { attachmentTypeValues, MAX_ATTACHMENT_BYTES } from '../vocabulary';

/**
 * Lets someone attach X-rays, lab results and documents to a record — as
 * metadata only.
 *
 * Nothing leaves the browser. The chosen file's name, size and type are read
 * from the `File` object the picker hands over and kept in local state; the
 * bytes are never read and never uploaded, which matches this phase's
 * mock-data-only scope. A future phase swaps this control for a real uploader
 * without changing anything else in the form.
 *
 * The type is guessed from the file name and stays editable, because a vet
 * filing a scan knows what it is and a guess should never be the final word.
 */
export function MedicalAttachmentField({
  attachments,
  onChange,
}: {
  attachments: MedicalAttachment[];
  onChange: (attachments: MedicalAttachment[]) => void;
}) {
  const inputId = useId();
  const { t, locale } = useI18n();
  // The rejected files are kept, not the sentence, so the message follows a
  // language switch.
  const [rejected, setRejected] = useState<string[]>([]);

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;

    const tooLarge: string[] = [];
    const added: MedicalAttachment[] = [];

    for (const file of Array.from(files)) {
      if (file.size > MAX_ATTACHMENT_BYTES) {
        tooLarge.push(file.name);
        continue;
      }
      added.push({
        id: `att-local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        fileName: file.name,
        type: attachmentTypeFor(file),
        sizeBytes: file.size,
        addedAt: new Date().toISOString(),
      });
    }

    setRejected(tooLarge);
    if (added.length > 0) onChange([...attachments, ...added]);
  }

  function updateType(id: string, type: AttachmentType) {
    onChange(
      attachments.map((attachment) =>
        attachment.id === id ? { ...attachment, type } : attachment,
      ),
    );
  }

  function remove(id: string) {
    onChange(attachments.filter((attachment) => attachment.id !== id));
  }

  return (
    <div className="space-y-3">
      <div>
        <label
          htmlFor={inputId}
          className="text-ink inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-md border border-stone-300 bg-white px-4 text-sm font-medium hover:bg-stone-100"
        >
          <Paperclip className="size-4" aria-hidden="true" />
          {t.medical.attachments.attachFiles}
        </label>
        <input
          id={inputId}
          type="file"
          multiple
          className="sr-only"
          onChange={(event) => {
            handleFiles(event.target.files);
            // Clear the control so choosing the same file twice still fires.
            event.target.value = '';
          }}
        />
        <p className="mt-2 text-xs text-stone-600">
          {t.medical.attachments.help(formatFileSize(MAX_ATTACHMENT_BYTES, locale))}
        </p>
      </div>

      {rejected.length > 0 ? (
        <p role="alert" className="text-danger-700 text-sm">
          {t.medical.attachments.tooLarge(
            rejected.join(locale === 'ar' ? '، ' : ', '),
            rejected.length,
            formatFileSize(MAX_ATTACHMENT_BYTES, locale),
          )}
        </p>
      ) : null}

      {attachments.length === 0 ? (
        <p className="text-sm text-stone-600">{t.medical.attachments.noneYet}</p>
      ) : (
        <ul className="space-y-2">
          {attachments.map((attachment) => (
            <li
              key={attachment.id}
              className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-md border border-stone-200 px-3 py-2.5"
            >
              {/* Full width on a phone, so the file name keeps a readable line
                  and the controls drop underneath instead of crushing it. */}
              <div className="w-full min-w-0 sm:w-auto sm:flex-1">
                <p className="truncate text-sm font-medium" dir="auto">
                  {attachment.fileName}
                </p>
                <p className="text-sm text-stone-600">
                  {formatFileSize(attachment.sizeBytes, locale)} ·{' '}
                  <time dateTime={attachment.addedAt}>
                    {formatRecordDate(attachment.addedAt, locale)}
                  </time>
                </p>
              </div>

              <label className="sr-only" htmlFor={`${attachment.id}-type`}>
                {t.medical.attachments.fileTypeFor(attachment.fileName)}
              </label>
              <Select
                id={`${attachment.id}-type`}
                className="h-9 w-36 text-sm"
                value={attachment.type}
                onChange={(event) =>
                  updateType(attachment.id, event.target.value as AttachmentType)
                }
              >
                {attachmentTypeValues.map((value) => (
                  <option key={value} value={value}>
                    {t.medical.attachmentTypes[value]}
                  </option>
                ))}
              </Select>

              <Button variant="ghost" size="sm" onClick={() => remove(attachment.id)}>
                <Trash2 className="size-4" aria-hidden="true" />
                <span className="sr-only">{t.medical.attachments.remove(attachment.fileName)}</span>
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
