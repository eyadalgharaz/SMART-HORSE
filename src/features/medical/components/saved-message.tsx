'use client';

import { Suspense, useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Alert } from '@/components/ui/alert';
import { useTranslations } from '@/i18n';

/**
 * Confirmation after a medical record is saved on another screen.
 *
 * Same mechanism as the Horses module: the project has no toast system and this
 * phase is not the place to add one, so the result travels in the URL
 * (`?saved=created`) and is announced by the shared `Alert`, which is already a
 * live region. The kind of save is captured on mount and the parameter is then
 * dropped from the history entry, so reloading or going back does not confirm
 * a save that already happened. The wording is looked up at render time, so
 * it follows a language switch.
 */

export type SavedKind = 'created' | 'updated';

/** Builds the URL to land on after a save. */
export function savedUrl(path: string, kind: SavedKind): string {
  return `${path}?saved=${kind}`;
}

function SavedMessageInner() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations();
  const [kind] = useState<SavedKind | null>(() => {
    const value = params.get('saved');
    return value === 'created' || value === 'updated' ? value : null;
  });

  useEffect(() => {
    if (kind) router.replace(pathname);
  }, [kind, pathname, router]);

  if (!kind) return null;
  return <Alert tone="success">{t.medical.saved[kind]}</Alert>;
}

export function MedicalSavedMessage() {
  return (
    <Suspense fallback={null}>
      <SavedMessageInner />
    </Suspense>
  );
}
