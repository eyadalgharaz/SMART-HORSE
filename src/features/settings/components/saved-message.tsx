'use client';

import { Suspense, useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Alert } from '@/components/ui/alert';

/**
 * Confirmation after a Settings save. Same mechanism as every other module:
 * the project has no toast system, so the result travels in the URL
 * (`?saved=farm`) and is announced by the shared `Alert`, which is already a
 * live region. The parameter is dropped from the history entry right after,
 * so reloading or going back does not confirm a save that already happened.
 */

export type SavedKind =
  | 'farm'
  | 'invited'
  | 'role'
  | 'suspended'
  | 'reactivated'
  | 'removed'
  | 'profile'
  | 'password'
  | 'preferences';

const messages: Record<SavedKind, string> = {
  farm: 'Farm profile updated successfully.',
  invited: 'Invitation created.',
  role: 'Role updated successfully.',
  suspended: 'Team member suspended.',
  reactivated: 'Team member reactivated.',
  removed: 'Team member removed.',
  profile: 'Profile updated successfully.',
  password: 'Password updated successfully.',
  preferences: 'Preferences saved.',
};

export function savedUrl(path: string, kind: SavedKind): string {
  return `${path}?saved=${kind}`;
}

function SavedMessageInner() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [message] = useState(() => {
    const kind = params.get('saved') as SavedKind | null;
    return kind && kind in messages ? messages[kind] : null;
  });

  useEffect(() => {
    if (message) router.replace(pathname);
  }, [message, pathname, router]);

  if (!message) return null;
  return <Alert tone="success">{message}</Alert>;
}

export function SettingsSavedMessage() {
  return (
    <Suspense fallback={null}>
      <SavedMessageInner />
    </Suspense>
  );
}
