import type { ReactNode } from 'react';
import { RedirectIfAuthenticated } from '@/features/auth/require-auth';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <RedirectIfAuthenticated>
      <div className="flex min-h-dvh items-center justify-center bg-stone-100 px-4 py-10">
        {children}
      </div>
    </RedirectIfAuthenticated>
  );
}
