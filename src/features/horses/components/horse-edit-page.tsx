'use client';

import { useRouter } from 'next/navigation';
import { Button, ButtonLink } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { PageHeader } from '@/components/layout/page-header';
import { Skeleton } from '@/components/ui/skeleton';
import { useHorseName, useTranslations } from '@/i18n';
import { useHorse } from '../use-horse';
import { useUpdateHorse } from '../use-save-horse';
import { HorseForm } from './horse-form';
import { savedUrl } from './saved-message';

function FormSkeleton() {
  const t = useTranslations();
  return (
    <div role="status" aria-busy="true" className="space-y-4">
      <span className="sr-only">{t.horses.loadingHorse}</span>
      {Array.from({ length: 3 }, (_, index) => (
        <div key={index} className="rounded-card border border-stone-200 bg-white p-5">
          <Skeleton className="h-5 w-40" />
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 4 }, (_, cell) => (
              <Skeleton key={cell} className="h-10" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Container for /horses/[horseId]/edit. Pre-populates from the current record
 * and returns to the profile with a confirmation on success. A missing horse
 * gets the same not-found state as the profile, not a form full of blanks.
 */
export function HorseEditPage({ horseId }: { horseId: string }) {
  const router = useRouter();
  const t = useTranslations();
  const { horse, isPending, notFound, isError, isRefetching, refetch } = useHorse(horseId);
  const { mutateAsync } = useUpdateHorse(horseId);
  const displayName = useHorseName(horse?.name ?? '');

  if (isPending) {
    return (
      <>
        <PageHeader title={t.horses.editHorse} />
        <FormSkeleton />
      </>
    );
  }

  if (notFound || !horse) {
    return (
      <>
        <PageHeader title={t.horses.editHorse} />
        <EmptyState
          title={t.common.horseNotFoundTitle}
          description={t.common.horseNotFoundDescription}
          action={<ButtonLink href="/horses">{t.horses.backToHorses}</ButtonLink>}
        />
      </>
    );
  }

  if (isError) {
    return (
      <>
        <PageHeader title={t.horses.editHorse} />
        <ErrorState
          title={t.common.horseLoadErrorTitle}
          description={t.common.recordLoadErrorDescription}
          action={
            <Button variant="secondary" onClick={() => void refetch()} loading={isRefetching}>
              {t.common.tryAgain}
            </Button>
          }
        />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title={t.horses.editHorse}
        description={t.horses.editHorseDescription(displayName)}
      />
      <HorseForm
        horse={horse}
        submitLabel={t.common.saveChanges}
        submittingLabel={t.common.savingChanges}
        onCancelHref={`/horses/${horse.id}`}
        onSubmit={async (input) => {
          await mutateAsync(input);
          router.push(savedUrl(`/horses/${horse.id}`, 'updated'));
        }}
      />
    </>
  );
}
