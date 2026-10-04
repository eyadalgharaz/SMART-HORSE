'use client';

import { useRouter } from 'next/navigation';
import { Button, ButtonLink } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { PageHeader } from '@/components/layout/page-header';
import { useHorse } from '@/features/horses/use-horse';
import { useMedicalRecord } from '../hooks/use-medical-record';
import { useUpdateMedicalRecord } from '../hooks/use-save-medical-record';
import { MedicalForm } from './medical-form';
import { MedicalFormSkeleton } from './medical-skeletons';
import { savedUrl } from './saved-message';

/**
 * Container for /medical/horses/[horseId]/edit/[recordId].
 *
 * It reuses the create form completely — same fields, same validation, same
 * layout — and only supplies different starting values and a different submit.
 *
 * A record that exists but belongs to a different horse is treated as not found
 * rather than quietly editing it under the wrong horse's URL, so a stale or
 * hand-typed link can never rewrite the wrong horse's history.
 */
export function MedicalEditPage({ horseId, recordId }: { horseId: string; recordId: string }) {
  const router = useRouter();
  const horseQuery = useHorse(horseId);
  const { record, isPending, notFound, isError, isRefetching, refetch } =
    useMedicalRecord(recordId);
  const { mutateAsync } = useUpdateMedicalRecord(recordId);

  const loading = isPending || horseQuery.isPending;
  const missing = notFound || horseQuery.notFound || (record && record.horseId !== horseId);

  if (loading) {
    return (
      <>
        <PageHeader title="Edit medical record" />
        <MedicalFormSkeleton />
      </>
    );
  }

  if (missing || !record || !horseQuery.horse) {
    return (
      <>
        <PageHeader title="Edit medical record" />
        <EmptyState
          title="Medical record not found"
          description="This record doesn't exist, or it belongs to another horse."
          action={
            <ButtonLink href={`/medical/horses/${horseId}`}>Back to medical history</ButtonLink>
          }
        />
      </>
    );
  }

  if (isError || horseQuery.isError) {
    return (
      <>
        <PageHeader title="Edit medical record" />
        <ErrorState
          title="We couldn't load this medical record"
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
        title="Edit medical record"
        description={`Update this record for ${horseQuery.horse.name}.`}
      />
      <MedicalForm
        record={record}
        horseName={horseQuery.horse.name}
        submitLabel="Save changes"
        submittingLabel="Saving changes"
        onCancelHref={`/medical/horses/${horseId}`}
        onSubmit={async (input) => {
          await mutateAsync(input);
          router.push(savedUrl(`/medical/horses/${horseId}`, 'updated'));
        }}
      />
    </>
  );
}
