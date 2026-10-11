'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardBody } from '@/components/ui/card';
import { ErrorState } from '@/components/ui/error-state';
import { emptyHorseFilters } from '@/features/horses/types';
import { useHorses } from '@/features/horses/use-horses';
import { useTranslations } from '@/i18n';
import { emptyTeamMemberFilters } from '../types';
import { useFarm, useUpdateFarm } from '../hooks/use-farm';
import { useTeamMembers } from '../hooks/use-team-members';
import { FarmProfileForm } from './farm-profile-form';
import { savedUrl, SettingsSavedMessage } from './saved-message';
import { SettingsSectionLayout } from './settings-section-layout';
import { FarmProfileSkeleton } from './settings-skeletons';

/**
 * Container for /settings/farm. The summary tiles reuse the Horses and Team
 * queries that already exist rather than storing a second copy of either
 * count, so "24 horses" here can never disagree with the Horses module.
 */
export function FarmProfilePage() {
  const router = useRouter();
  const { farm, isPending, isError, isRefetching, refetch } = useFarm();
  const { horses, isPending: horsesPending } = useHorses(emptyHorseFilters);
  const { allMembers, isPending: teamPending } = useTeamMembers(emptyTeamMemberFilters);
  const { mutateAsync } = useUpdateFarm();
  const t = useTranslations();
  const fp = t.settings.farm;

  const activeMembers = allMembers.filter((member) => member.status !== 'suspended').length;

  return (
    <SettingsSectionLayout title={t.settings.sections.farm.title} description={fp.pageDescription}>
      <div className="space-y-4">
        <SettingsSavedMessage />

        {isError ? (
          <ErrorState
            title={fp.loadErrorTitle}
            description={fp.loadErrorDescription}
            action={
              <Button variant="secondary" onClick={() => void refetch()} loading={isRefetching}>
                {t.common.tryAgain}
              </Button>
            }
          />
        ) : isPending || !farm ? (
          <FarmProfileSkeleton />
        ) : (
          <>
            <Card>
              <CardBody className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div>
                  <p className="text-sm text-stone-600">{fp.farmStatus}</p>
                  <p className="mt-1 font-medium">{fp.active}</p>
                </div>
                <div>
                  <p className="text-sm text-stone-600">{fp.teamMembers}</p>
                  <p className="mt-1 font-medium tabular-nums">
                    {teamPending ? '—' : activeMembers}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-stone-600">{fp.totalHorses}</p>
                  <p className="mt-1 font-medium tabular-nums">
                    {horsesPending ? '—' : horses.length}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-stone-600">{fp.farmType}</p>
                  <p className="mt-1 font-medium">{t.settings.farmTypes[farm.type]}</p>
                </div>
              </CardBody>
            </Card>

            <FarmProfileForm
              farm={farm}
              onSaved={async (input) => {
                await mutateAsync(input);
                router.push(savedUrl('/settings/farm', 'farm'));
              }}
            />
          </>
        )}
      </div>
    </SettingsSectionLayout>
  );
}
