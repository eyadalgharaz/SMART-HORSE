'use client';

import { Button } from '@/components/ui/button';
import { ErrorState } from '@/components/ui/error-state';
import { useTranslations } from '@/i18n';
import { useAccount } from '../hooks/use-account';
import { useAccountPreferences } from '../hooks/use-preferences';
import { AccountPasswordForm } from './account-password-form';
import { AccountPreferencesForm } from './account-preferences-form';
import { AccountProfileForm } from './account-profile-form';
import { SettingsSavedMessage } from './saved-message';
import { SettingsSectionLayout } from './settings-section-layout';
import { AccountSkeleton } from './settings-skeletons';

/**
 * Container for /settings/account: the signed-in person's own profile,
 * password and preferences. Three independent forms, three independent
 * saves — editing one never risks the other two.
 */
export function AccountPage() {
  const { account, isPending, isError, isRefetching, refetch } = useAccount();
  const { preferences, isPending: preferencesPending } = useAccountPreferences();
  const t = useTranslations();
  const a = t.settings.account;

  return (
    <SettingsSectionLayout
      title={t.settings.sections.account.title}
      description={a.pageDescription}
    >
      <div className="space-y-4">
        <SettingsSavedMessage />

        {isError ? (
          <ErrorState
            title={a.loadErrorTitle}
            description={a.loadErrorDescription}
            action={
              <Button variant="secondary" onClick={() => void refetch()} loading={isRefetching}>
                {t.common.tryAgain}
              </Button>
            }
          />
        ) : isPending || !account || preferencesPending || !preferences ? (
          <AccountSkeleton />
        ) : (
          <>
            <AccountProfileForm account={account} />
            <AccountPasswordForm />
            <AccountPreferencesForm preferences={preferences} />
          </>
        )}
      </div>
    </SettingsSectionLayout>
  );
}
