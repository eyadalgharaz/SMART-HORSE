'use client';

import { Button } from '@/components/ui/button';
import { ErrorState } from '@/components/ui/error-state';
import { useTranslations } from '@/i18n';

/**
 * Shown when the dashboard request fails. Works unchanged for real API failures
 * later. The presentation is the shared `ErrorState`, so every module's failure
 * screen looks and is announced the same way.
 */
export function DashboardError({
  onRetry,
  retrying = false,
}: {
  onRetry: () => void;
  retrying?: boolean;
}) {
  const t = useTranslations();
  return (
    <ErrorState
      title={t.common.somethingWentWrong}
      description={t.dashboard.errorDescription}
      action={
        <Button variant="secondary" onClick={onRetry} loading={retrying}>
          {t.common.tryAgain}
        </Button>
      }
    />
  );
}
