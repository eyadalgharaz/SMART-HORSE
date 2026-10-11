'use client';

import { useId, useRef } from 'react';
import { ImagePlus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslations } from '@/i18n';
import { HorsePhoto } from './horse-photo';

/**
 * Lets the person choose a photo for the preview only — nothing leaves the
 * browser. `URL.createObjectURL` turns the chosen file into a local object URL
 * so it can render immediately; there is no upload request and no server
 * involved, matching this phase's mock-data-only scope. A future phase swaps
 * this for a real uploader without changing anything else in the form.
 */
export function HorseImageField({
  name,
  value,
  onChange,
}: {
  /** Horse name, used only for the monogram fallback while no photo is set. */
  name: string;
  value: string | null;
  onChange: (url: string | null) => void;
}) {
  const inputId = useId();
  const objectUrl = useRef<string | null>(null);
  const t = useTranslations();

  function handleFile(file: File | undefined) {
    if (!file) return;
    if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
    const url = URL.createObjectURL(file);
    objectUrl.current = url;
    onChange(url);
  }

  function handleRemove() {
    if (objectUrl.current) {
      URL.revokeObjectURL(objectUrl.current);
      objectUrl.current = null;
    }
    onChange(null);
  }

  return (
    <div className="flex items-center gap-4">
      <HorsePhoto name={name || '?'} src={value} size="lg" />

      <div className="space-y-2">
        <div className="flex flex-wrap gap-2">
          <label
            htmlFor={inputId}
            className="text-ink inline-flex h-8 cursor-pointer items-center justify-center gap-2 rounded-md border border-stone-300 bg-white px-3 text-sm font-medium hover:bg-stone-100"
          >
            <ImagePlus className="size-4" aria-hidden="true" />
            {value ? t.horses.photo.change : t.horses.photo.add}
          </label>
          {value ? (
            <Button variant="ghost" size="sm" type="button" onClick={handleRemove}>
              <X className="size-4" aria-hidden="true" />
              {t.common.remove}
            </Button>
          ) : null}
        </div>
        <input
          id={inputId}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(event) => handleFile(event.target.files?.[0])}
        />
        <p className="text-xs text-stone-600">{t.horses.photo.hint}</p>
      </div>
    </div>
  );
}
