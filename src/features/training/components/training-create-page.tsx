'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button, ButtonLink } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { PageHeader } from '@/components/layout/page-header';
import { useHorse } from '@/features/horses/use-horse';
import { useI18n } from '@/i18n';
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
  const { t, tc } = useI18n();

  const horsePrograms = useMemo(
    () => programs.filter((program) => program.horseId === horseId),
    [programs, horseId],
  );

  if (isPending || programsPending || trainersPending) {
    return (
      <>
        <PageHeader title={t.training.create.title} />
        <TrainingFormSkeleton />
      </>
    );
  }

  if (notFound || !horse) {
    return (
      <>
        <PageHeader title={t.training.create.title} />
        <EmptyState
          title={t.common.horseNotFoundTitle}
          description={t.common.horseNotFoundDescription}
          action={<ButtonLink href="/training">{t.training.backToTraining}</ButtonLink>}
        />
      </>
    );
  }

  if (isError) {
    return (
      <>
        <PageHeader title={t.training.create.title} />
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
        title={t.training.create.title}
        description={t.training.create.description(tc(horse.name))}
      />
      <TrainingSessionForm
        horseId={horse.id}
        horseName={tc(horse.name)}
        programs={horsePrograms}
        trainers={trainers}
        submitLabel={t.training.create.submit}
        submittingLabel={t.training.create.submitting}
        onCancelHref={`/training/horses/${horse.id}`}
        onSubmit={async (input) => {
          await mutateAsync(input);
          router.push(savedUrl(`/training/horses/${horse.id}`, 'created'));
        }}
      />
    </>
  );
}
