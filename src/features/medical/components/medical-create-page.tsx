'use client';

import { useRouter } from 'next/navigation';
import { Button, ButtonLink } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { PageHeader } from '@/components/layout/page-header';
import { useHorse } from '@/features/horses/use-horse';
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

  if (isPending) {
    return (
      <>
        <PageHeader title="Add medical record" />
        <MedicalFormSkeleton />
      </>
    );
  }

  if (notFound || !horse) {
    return (
      <>
        <PageHeader title="Add medical record" />
        <EmptyState
          title="Horse not found"
          description="This horse doesn't exist, or it is no longer part of your farm."
          action={<ButtonLink href="/medical">Back to health</ButtonLink>}
        />
      </>
    );
  }

  if (isError) {
    return (
      <>
        <PageHeader title="Add medical record" />
        <ErrorState
          title="We couldn't load this horse"
          description="Something went wrong while loading the record. Check your connection and try again."
          action={
            <Button variant="secondary" onClick={() => void refetch()} loading={isRefetching}>
              Try again
            </Button>
          }
        />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Add medical record"
        description={`Record a checkup, vaccination, treatment or injury for ${horse.name}.`}
      />
      <MedicalForm
        horseName={horse.name}
        submitLabel="Save record"
        submittingLabel="Saving record"
        onCancelHref={`/medical/horses/${horse.id}`}
        onSubmit={async (input) => {
          await mutateAsync(input);
          router.push(savedUrl(`/medical/horses/${horse.id}`, 'created'));
        }}
      />
    </>
  );
}
