'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button, ButtonLink } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { PageHeader } from '@/components/layout/page-header';
import { useHorse } from '@/features/horses/use-horse';
import { useI18n } from '@/i18n';
import { useTrainingSession } from '../hooks/use-training-session';
import { useTrainingPrograms } from '../hooks/use-training-programs';
import { useTrainers } from '../hooks/use-trainers';
import { useUpdateTrainingSession } from '../hooks/use-save-training-session';
import { TrainingSessionForm } from './training-session-form';
import { TrainingFormSkeleton } from './training-skeletons';
import { savedUrl } from './saved-message';

/**
 * Container for /training/horses/[horseId]/edit/[sessionId].
 *
 * It reuses the create form completely — same fields, same validation, same
 * layout — and only supplies different starting values and a different
 * submit.
 *
 * A session that exists but belongs to a different horse is treated as not
 * found rather than quietly editing it under the wrong horse's URL, so a
 * stale or hand-typed link can never rewrite the wrong horse's history.
 */
export function TrainingEditPage({ horseId, sessionId }: { horseId: string; sessionId: string }) {
  const router = useRouter();
  const horseQuery = useHorse(horseId);
  const { session, isPending, notFound, isError, isRefetching, refetch } =
    useTrainingSession(sessionId);
  const { programs, isPending: programsPending } = useTrainingPrograms();
  const { trainers, isPending: trainersPending } = useTrainers();
  const { mutateAsync } = useUpdateTrainingSession(sessionId);
  const { t, tc } = useI18n();

  const horsePrograms = useMemo(
    () => programs.filter((program) => program.horseId === horseId),
    [programs, horseId],
  );

  const loading = isPending || horseQuery.isPending || programsPending || trainersPending;
  const missing = notFound || horseQuery.notFound || (session && session.horseId !== horseId);

  if (loading) {
    return (
      <>
        <PageHeader title={t.training.edit.title} />
        <TrainingFormSkeleton />
      </>
    );
  }

  if (missing || !session || !horseQuery.horse) {
    return (
      <>
        <PageHeader title={t.training.edit.title} />
        <EmptyState
          title={t.training.edit.notFoundTitle}
          description={t.training.edit.notFoundDescription}
          action={
            <ButtonLink href={`/training/horses/${horseId}`}>
              {t.training.backToTrainingHistory}
            </ButtonLink>
          }
        />
      </>
    );
  }

  if (isError || horseQuery.isError) {
    return (
      <>
        <PageHeader title={t.training.edit.title} />
        <ErrorState
          title={t.training.edit.loadErrorTitle}
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
        title={t.training.edit.title}
        description={t.training.edit.description(tc(horseQuery.horse.name))}
      />
      <TrainingSessionForm
        session={session}
        horseId={horseId}
        horseName={tc(horseQuery.horse.name)}
        programs={horsePrograms}
        trainers={trainers}
        submitLabel={t.common.saveChanges}
        submittingLabel={t.common.savingChanges}
        onCancelHref={`/training/horses/${horseId}`}
        onSubmit={async (input) => {
          await mutateAsync(input);
          router.push(savedUrl(`/training/horses/${horseId}`, 'updated'));
        }}
      />
    </>
  );
}
