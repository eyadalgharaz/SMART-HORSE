'use client';

import { useState, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/features/auth/auth-provider';
import { LocaleProvider } from '@/i18n';

/**
 * Client-side providers. TanStack Query is wired now so feature modules can
 * adopt it without changing the app root once the REST API exists.
 */
export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { staleTime: 30_000, retry: 1, refetchOnWindowFocus: false } },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <LocaleProvider>
        <AuthProvider>{children}</AuthProvider>
      </LocaleProvider>
    </QueryClientProvider>
  );
}
