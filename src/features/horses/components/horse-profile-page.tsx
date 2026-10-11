'use client';

import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { Button, ButtonLink } from '@/components/ui/button';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { Skeleton } from '@/components/ui/skeleton';
import { useGenderLabel, useHorseName, useI18n, useTranslations } from '@/i18n';
import { formatAge, formatBirthDate } from '../format';
import { useHorse } from '../use-horse';
import { Detail, DetailList } from './detail-list';
import { HorseFutureRecords } from './horse-future-records';
import { HorseProfileHeader } from './horse-profile-header';
import { SavedMessage } from './saved-message';

function BackLink() {
  const t = useTranslations();
  return (
    <Link
      href="/horses"
      className="hover:text-ink -ms-1.5 inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-sm font-medium text-stone-600"
    >
      <ChevronLeft className="size-4 rtl:rotate-180" aria-hidden="true" />
      {t.horses.backToHorses}
    </Link>
  );
}

function ProfileSkeleton() {
  const t = useTranslations();
  return (
    <div role="status" aria-busy="true" className="space-y-4">
      <span className="sr-only">{t.common.loadingHorse}</span>
      <div className="rounded-card border border-stone-200 bg-white p-4 sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <Skeleton className="rounded-card size-24 sm:size-28" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-7 w-40" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-36" />
          </div>
          <Skeleton className="h-10 w-28" />
        </div>
      </div>
      {Array.from({ length: 2 }, (_, index) => (
        <div key={index} className="rounded-card border border-stone-200 bg-white">
          <div className="border-b border-stone-200 px-4 py-4 sm:px-5">
            <Skeleton className="h-5 w-40" />
          </div>
          <div className="grid gap-x-6 gap-y-4 px-4 py-4 sm:grid-cols-2 sm:px-5">
            {Array.from({ length: 4 }, (_, cell) => (
              <div key={cell} className="space-y-1.5">
                <Skeleton className="h-3.5 w-20" />
                <Skeleton className="h-4 w-28" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Container for /horses/[horseId]. A horse that does not exist is not a failure
 * the user can retry out of, so it gets its own quiet state with a way back —
 * never a crash and never a page of blank fields.
 */
export function HorseProfilePage({ horseId }: { horseId: string }) {
  const { horse, isPending, notFound, isError, isRefetching, refetch } = useHorse(horseId);
  // Called unconditionally (rules of hooks) even though the values are only
  // used once `horse` is confirmed loaded, below.
  const displayName = useHorseName(horse?.name ?? '');
  const genderLabel = useGenderLabel(horse?.gender ?? 'mare');
  const { t, tc, locale } = useI18n();

  if (isPending) {
    return (
      <div className="space-y-4">
        <BackLink />
        <ProfileSkeleton />
      </div>
    );
  }

  if (notFound || !horse) {
    return (
      <div className="space-y-4">
        <BackLink />
        <EmptyState
          title={t.common.horseNotFoundTitle}
          description={t.common.horseNotFoundDescription}
          action={<ButtonLink href="/horses">{t.horses.backToHorses}</ButtonLink>}
        />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-4">
        <BackLink />
        <ErrorState
          title={t.common.horseLoadErrorTitle}
          description={t.common.recordLoadErrorDescription}
          action={
            <Button variant="secondary" onClick={() => void refetch()} loading={isRefetching}>
              {t.common.tryAgain}
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <BackLink />
      <SavedMessage />
      <HorseProfileHeader horse={horse} />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title={t.horses.sections.basicInfo} headingLevel={3} />
          <CardBody>
            <DetailList>
              <Detail label={t.horses.fields.name} value={displayName} />
              <Detail label={t.horses.fields.breed} value={tc(horse.breed)} />
              <Detail label={t.horses.fields.gender} value={genderLabel} />
              <Detail label={t.horses.fields.color} value={tc(horse.color)} />
              <Detail label={t.horses.fields.birthDate}>
                <time dateTime={horse.birthDate}>{formatBirthDate(horse.birthDate, locale)}</time>
              </Detail>
              <Detail
                label={t.horses.fields.age}
                value={formatAge(horse.birthDate, undefined, locale)}
              />
            </DetailList>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title={t.horses.sections.identification} headingLevel={3} />
          <CardBody>
            <DetailList>
              <Detail label={t.horses.fields.registrationNumber}>
                {horse.registrationNumber ? (
                  <span dir="ltr">{horse.registrationNumber}</span>
                ) : undefined}
              </Detail>
              <Detail label={t.horses.fields.microchipNumber}>
                {horse.microchipNumber ? (
                  <span dir="ltr" className="tabular-nums">
                    {horse.microchipNumber}
                  </span>
                ) : undefined}
              </Detail>
            </DetailList>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title={t.horses.sections.ownership} headingLevel={3} />
          <CardBody className="space-y-4">
            <DetailList>
              <Detail
                label={t.horses.fields.currentOwner}
                value={horse.owner ? tc(horse.owner.name) : null}
              />
              <Detail
                label={t.horses.fields.status}
                value={horse.owner ? t.horses.owned : t.horses.unassigned}
              />
            </DetailList>
            <p className="text-sm text-stone-600">{t.horses.ownershipNote}</p>
          </CardBody>
        </Card>

        <HorseFutureRecords horseId={horse.id} />
      </div>
    </div>
  );
}
