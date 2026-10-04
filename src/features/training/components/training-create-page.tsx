'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button, ButtonLink } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { PageHeader } from '@/components/layout/page-header';
import { useHorse } from '@/features/horses/use-horse';
import { useTrainingPrograms } from '../hooks/use-training-programs';
import { useTrainers } from '../hooks/use-trainers';
import { useCreateTrainingSession } from '../hooks/use-save-training-session';
import { TrainingSessionForm } from './training-session-form';
import { TrainingFormSkeleton } from './training-skeletons';
import { savedUrl } from './saved-message';

/**
 * Container for /training/horses/[horseId]/new.
 *
 * The horse is loaded before the form is shown so a session can never be
 * attached to a horse that does not exist, and so the form can say whose
 * session is being written. On success it returns to that horse's training
 * profile, where the new session is already in the timeline.
 */
export function TrainingCreatePage({ horseId }: { horseId: string }) {
  const router = useRouter();
  const { horse, isPending, notFound, isError, isRefetching, refetch } = useHorse(horseId);
  const { programs, isPending: programsPending } = useTrainingPrograms();
  const { trainers, isPending: trainersPending } = useTrainers();
  const { mutateAsync } = useCreateTrainingSession(horseId);

  const horsePrograms = useMemo(
    () => programs.filter((program) => program.horseId === horseId),
    [programs, horseId],
  );

  if (isPending || programsPending || trainersPending) {
    return (
      <>
        <PageHeader title="Add training session" />
        <TrainingFormSkeleton />
      </>
    );
  }

  if (notFound || !horse) {
    return (
      <>
        <PageHeader title="Add training session" />
        <EmptyState
          title="Horse not found"
          description="This horse doesn't exist, or it is no longer part of your farm."
          action={<ButtonLink href="/training">Back to training</ButtonLink>}
        />
      </>
    );
  }

  if (isError) {
    return (
      <>
        <PageHeader title="Add training session" />
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
        title="Add training session"
        description={`Record a training session for ${horse.name}.`}
      />
      <TrainingSessionForm
        horseId={horse.id}
        horseName={horse.name}
        programs={horsePrograms}
        trainers={trainers}
        submitLabel="Save session"
        submittingLabel="Saving session"
        onCancelHref={`/training/horses/${horse.id}`}
        onSubmit={async (input) => {
          await mutateAsync(input);
          router.push(savedUrl(`/training/horses/${horse.id}`, 'created'));
        }}
      />
    </>
  );
}
