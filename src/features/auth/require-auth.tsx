'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Spinner } from '@/components/ui/spinner';
import { useAuth } from './auth-provider';

/**
 * Keeps signed-out visitors out of the app shell.
 *
 * This is navigation convenience, NOT a security boundary: every protected
 * resource is authorized by the backend (Master Prompt v1.0 §4).
 */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === 'anonymous') router.replace('/login');
  }, [status, router]);

  if (status !== 'authenticated') {
    return (
      <div className="text-pasture-500 flex min-h-dvh items-center justify-center">
        <Spinner label="Loading SmartHorse" className="size-6" />
      </div>
    );
  }

  return <>{children}</>;
}

/** Mirror of RequireAuth for the auth screens: signed-in users skip them. */
export function RedirectIfAuthenticated({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') router.replace('/dashboard');
  }, [status, router]);

  return <>{children}</>;
}
