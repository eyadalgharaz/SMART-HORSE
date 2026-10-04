'use client';

import { Suspense, useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Alert } from '@/components/ui/alert';

/**
 * Confirmation after a task is saved on another screen. Same mechanism as
 * Horses, Medical and Training: the project has no toast system, so the
 * result travels in the URL (`?saved=created`) and is announced by the
 * shared `Alert`, which is already a live region. The parameter is dropped
 * from the history entry right after, so reloading or going back does not
 * confirm a save that already happened.
 */

export type SavedKind = 'created' | 'updated' | 'completed';

const messages: Record<SavedKind, string> = {
  created: 'Task added successfully.',
  updated: 'Task updated successfully.',
  completed: 'Task marked complete.',
};

export function savedUrl(path: string, kind: SavedKind): string {
  return `${path}?saved=${kind}`;
}

function SavedMessageInner() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [message] = useState(() => {
    const kind = params.get('saved');
    return kind === 'created' || kind === 'updated' || kind === 'completed' ? messages[kind] : null;
  });

  useEffect(() => {
    if (message) router.replace(pathname);
  }, [message, pathname, router]);

  if (!message) return null;
  return <Alert tone="success">{message}</Alert>;
}

export function TasksSavedMessage() {
  return (
    <Suspense fallback={null}>
      <SavedMessageInner />
    </Suspense>
  );
}
