'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Spinner } from '@/components/ui/spinner';
import { useAuth } from '@/features/auth/auth-provider';
import { useTranslations } from '@/i18n';
import { roleDashboardPath } from '../routes';

/**
 * `/dashboard` has no content of its own. It exists purely to read the
 * signed-in user's role and send them to their own dashboard route
 * (`/dashboard/<role>`) — the "role detection" step in the architecture.
 *
 * An account with no role on record (only reachable outside the standard
 * registration flow) falls back to the Farm Owner dashboard, matching the
 * mock auth service's own default for that case.
 */
export function DashboardRoleRedirect() {
  const { user } = useAuth();
  const router = useRouter();
  const t = useTranslations();

  useEffect(() => {
    const target = roleDashboardPath(user?.farmRole ?? 'FarmOwner');
    // Preserve the mock review switches (?mock=slow|error|empty) documented
    // in the README — they're read from the URL at fetch time by the mock
    // services regardless of which route carries them.
    const search = typeof window !== 'undefined' ? window.location.search : '';
    router.replace(search ? `${target}${search}` : target);
  }, [user, router]);

  return (
    <div className="flex justify-center py-16">
      <Spinner label={t.common.loadingDashboard} />
    </div>
  );
}
