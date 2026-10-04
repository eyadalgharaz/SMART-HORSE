'use client';

import { Suspense, useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Alert } from '@/components/ui/alert';

/**
 * Confirmation after a record is saved on another screen.
 *
 * The project has no toast system and this phase is not the place to add one,
 * so the result travels in the URL (`?saved=created`) and is announced by the
 * shared `Alert`, which is already a live region. The message is captured on
 * mount and the parameter is then dropped from the history entry, so reloading
 * or going back does not confirm a save that already happened.
 */

export type SavedKind = 'created' | 'updated';

const messages: Record<SavedKind, string> = {
  created: 'Horse added successfully.',
  updated: 'Horse updated successfully.',
};

/** Builds the URL to land on after a save. */
export function savedUrl(path: string, kind: SavedKind): string {
  return `${path}?saved=${kind}`;
}

function SavedMessageInner() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [message] = useState(() => {
    const kind = params.get('saved');
    return kind === 'created' || kind === 'updated' ? messages[kind] : null;
  });

  useEffect(() => {
    if (message) router.replace(pathname);
  }, [message, pathname, router]);

  if (!message) return null;
  return <Alert tone="success">{message}</Alert>;
}

export function SavedMessage() {
  return (
    <Suspense fallback={null}>
      <SavedMessageInner />
    </Suspense>
  );
}
