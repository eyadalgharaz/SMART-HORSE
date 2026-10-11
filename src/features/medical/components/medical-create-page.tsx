'use client';

import { useRouter } from 'next/navigation';
import { Button, ButtonLink } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { PageHeader } from '@/components/layout/page-header';
import { useHorse } from '@/features/horses/use-horse';
import { useI18n } from '@/i18n';
import { useCreateMedicalRecord } from '../hooks/use-save-medical-record';
import { MedicalForm } from './medical-form';
import { MedicalFormSkeleton } from './medical-skeletons';
import { savedUrl } from './saved-message';

/**
 * Container for /medical/horses/[horseId]/new.
 *
 * The horse is loaded before the form is shown so the record can never be
 * attached to a horse that does not exist, and so the form can say whose record
 * is being written. On success it returns to that horse's medical profile, where
 * the new record is already in the timeline.
 */
export function MedicalCreatePage({ horseId }: { horseId: string }) {
  const router = useRouter();
  const { horse, isPending, notFound, isError, isRefetching, refetch } = useHorse(horseId);
  const { mutateAsync } = useCreateMedicalRecord(horseId);
  const { t, tc } = useI18n();

  if (isPending) {
    return (
      <>
        <PageHeader title={t.medical.create.title} />
        <MedicalFormSkeleton />
      </>
    );
  }

  if (notFound || !horse) {
    return (
      <>
        <PageHeader title={t.medical.create.title} />
        <EmptyState
          title={t.common.horseNotFoundTitle}
          description={t.common.horseNotFoundDescription}
          action={<ButtonLink href="/medical">{t.medical.backToHealth}</ButtonLink>}
        />
      </>
    );
  }

  if (isError) {
    return (
      <>
        <PageHeader title={t.medical.create.title} />
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
        title={t.medical.create.title}
        description={t.medical.create.description(tc(horse.name))}
      />
      <MedicalForm
        horseName={tc(horse.name)}
        submitLabel={t.medical.create.submit}
        submittingLabel={t.medical.create.submitting}
        onCancelHref={`/medical/horses/${horse.id}`}
        onSubmit={async (input) => {
          await mutateAsync(input);
          router.push(savedUrl(`/medical/horses/${horse.id}`, 'created'));
        }}
      />
    </>
  );
}
