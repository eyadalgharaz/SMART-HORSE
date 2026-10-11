'use client';

import { Suspense, useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Alert } from '@/components/ui/alert';
import { useTranslations } from '@/i18n';

/**
 * Confirmation after a task is saved on another screen. Same mechanism as
 * Horses, Medical and Training: the project has no toast system, so the
 * result travels in the URL (`?saved=created`) and is announced by the
 * shared `Alert`, which is already a live region. The parameter is dropped
 * from the history entry right after, so reloading or going back does not
 * confirm a save that already happened. The wording is looked up at render
 * time, so it follows a language switch.
 */

export type SavedKind = 'created' | 'updated' | 'completed';

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
    return value === 'created' || value === 'updated' || value === 'completed' ? value : null;
  });

  useEffect(() => {
    if (kind) router.replace(pathname);
  }, [kind, pathname, router]);

  if (!kind) return null;
  return <Alert tone="success">{t.tasks.saved[kind]}</Alert>;
}

export function TasksSavedMessage() {
  return (
    <Suspense fallback={null}>
      <SavedMessageInner />
    </Suspense>
  );
}
