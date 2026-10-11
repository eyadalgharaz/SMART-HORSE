'use client';

import Link from 'next/link';
import { ChevronLeft, Plus } from 'lucide-react';
import { Button, ButtonLink } from '@/components/ui/button';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { Skeleton } from '@/components/ui/skeleton';
import { HorsePhoto } from '@/features/horses/components/horse-photo';
import { HorseStatusBadge } from '@/features/horses/components/horse-status-badge';
import { useHorse } from '@/features/horses/use-horse';
import { useI18n } from '@/i18n';
import {
  formatDateLabel,
  progressSeries,
  sortSessionsNewestFirst,
  sortProgramsForHorse,
  summarizeHorseTraining,
} from '../format';
import { useHorseTrainingSessions } from '../hooks/use-horse-training-sessions';
import { useTrainingPrograms } from '../hooks/use-training-programs';
import { TrainingProgramsList } from './training-programs-list';
import { TrainingProgressChart } from './training-progress-chart';
import { TrainingSavedMessage } from './saved-message';
import { TrainingTimeline } from './training-timeline';
import { TrainingTimelineSkeleton } from './training-skeletons';

/**
 * Container for /training/horses/[horseId] — one horse's whole training
 * picture, with its session timeline as the centrepiece.
 *
 * The horse's identity comes from the Horses module (`useHorse`) and its
 * training data from the Training module, which is why an unknown id is
 * reported by the module that owns horses: a horse that does not exist cannot
 * have a training history, so the page says "Horse not found" rather than
 * showing an empty history for a horse that was never there.
 *
 * This is deliberately not a second copy of the Horse profile: identity is
 * shown just enough to orient the reader, and everything else is training
 * data.
 */

function BackLink() {
  const { t } = useI18n();
  return (
    <Link
      href="/training"
      className="hover:text-ink -ms-1.5 inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-sm font-medium text-stone-600"
    >
      <ChevronLeft className="size-4 rtl:rotate-180" aria-hidden="true" />
      {t.training.backToTraining}
    </Link>
  );
}

function SummaryFact({ label, value, detail }: { label: string; value: string; detail?: string }) {
  return (
    <div className="rounded-md bg-stone-50 p-4">
      <p className="text-sm text-stone-600">{label}</p>
      <p className="mt-1 font-medium break-words">{value}</p>
      {detail ? <p className="text-sm text-stone-600">{detail}</p> : null}
    </div>
  );
}

export function HorseTrainingPage({ horseId }: { horseId: string }) {
  const horseQuery = useHorse(horseId);
  const sessionsQuery = useHorseTrainingSessions(horseId);
  const { programs, isPending: programsPending, isError: programsError } = useTrainingPrograms();

  const horse = horseQuery.horse;
  const { t, tc, locale } = useI18n();
  const p = t.training.horsePage;
  const horsePrograms = programs.filter((program) => program.horseId === horseId);

  if (horseQuery.isPending) {
    return (
      <div className="space-y-4">
        <BackLink />
        <div role="status" aria-busy="true" className="space-y-4">
          <span className="sr-only">{t.common.loadingHorse}</span>
          <div className="rounded-card border border-stone-200 bg-white p-4 sm:p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <Skeleton className="rounded-card size-24 sm:size-28" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-7 w-40" />
                <Skeleton className="h-4 w-28" />
              </div>
            </div>
          </div>
          <TrainingTimelineSkeleton />
        </div>
      </div>
    );
  }

  if (horseQuery.notFound || !horse) {
    return (
      <div className="space-y-4">
        <BackLink />
        <EmptyState
          title={t.common.horseNotFoundTitle}
          description={t.common.horseNotFoundDescription}
          action={<ButtonLink href="/training">{t.training.backToTraining}</ButtonLink>}
        />
      </div>
    );
  }

  if (horseQuery.isError) {
    return (
      <div className="space-y-4">
        <BackLink />
        <ErrorState
          title={t.common.horseLoadErrorTitle}
          description={t.common.recordLoadErrorDescription}
          action={
            <Button
              variant="secondary"
              onClick={() => void horseQuery.refetch()}
              loading={horseQuery.isRefetching}
            >
              {t.common.tryAgain}
            </Button>
          }
        />
      </div>
    );
  }

  const sessions = sortSessionsNewestFirst(sessionsQuery.sessions);
  const summary = summarizeHorseTraining(sessions, horsePrograms);
  const chartPoints = progressSeries(sessions);
  const loadingData = sessionsQuery.isPending || programsPending;
  const horseName = tc(horse.name);

  return (
    <div className="space-y-4">
      <BackLink />
      <TrainingSavedMessage />

      {/* Identity band — the same shape as the Horses and Medical profile
          headers, so every module feels like one record seen from a
          different side. */}
      <div className="rounded-card border border-stone-200 bg-white p-4 sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <HorsePhoto name={horseName} src={horse.imageUrl} size="lg" />

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <h2 className="text-xl font-semibold break-words sm:text-2xl">{horseName}</h2>
              <HorseStatusBadge status={horse.status} />
            </div>
            <p className="mt-1 text-stone-600">{tc(horse.breed)}</p>
          </div>

          <div className="flex flex-wrap gap-2 self-start sm:self-center">
            <ButtonLink href={`/horses/${horse.id}`} variant="secondary">
              {p.viewHorseProfile}
            </ButtonLink>
            <ButtonLink href={`/training/horses/${horse.id}/new`}>
              <Plus className="size-4" aria-hidden="true" />
              {p.addSession}
            </ButtonLink>
          </div>
        </div>
      </div>

      {sessionsQuery.isError || programsError ? (
        <ErrorState
          title={p.historyErrorTitle}
          description={p.historyErrorDescription}
          action={
            <Button
              variant="secondary"
              onClick={() => void sessionsQuery.refetch()}
              loading={sessionsQuery.isRefetching}
            >
              {t.common.tryAgain}
            </Button>
          }
        />
      ) : (
        <>
          <Card>
            <CardHeader title={p.summaryTitle} headingLevel={3} />
            <CardBody className="grid gap-3 sm:grid-cols-3">
              <SummaryFact label={p.totalSessions} value={String(summary.totalSessions)} />
              <SummaryFact label={p.completedSessions} value={String(summary.completedSessions)} />
              <SummaryFact
                label={p.currentProgram}
                value={summary.currentProgram ? tc(summary.currentProgram.name) : p.noneActive}
                detail={
                  summary.currentProgram?.trainerName
                    ? tc(summary.currentProgram.trainerName)
                    : undefined
                }
              />
              <SummaryFact
                label={p.lastSession}
                value={
                  summary.lastSession
                    ? formatDateLabel(summary.lastSession.date, undefined, locale)
                    : p.noneYet
                }
                detail={summary.lastSession ? tc(summary.lastSession.title) : undefined}
              />
              <SummaryFact
                label={p.nextSession}
                value={
                  summary.nextSession
                    ? formatDateLabel(summary.nextSession.date, undefined, locale)
                    : p.noneScheduled
                }
                detail={summary.nextSession ? tc(summary.nextSession.title) : undefined}
              />
            </CardBody>
          </Card>

          {chartPoints.length >= 2 ? (
            <div className="grid gap-4 lg:grid-cols-2">
              <Card>
                <CardHeader
                  title={p.distanceTitle}
                  description={p.distanceDescription}
                  headingLevel={3}
                />
                <CardBody>
                  <TrainingProgressChart
                    points={chartPoints}
                    metric="distanceKm"
                    unit={t.training.units.kmUnit}
                    caption={p.distanceCaption(horseName)}
                  />
                </CardBody>
              </Card>

              <Card>
                <CardHeader
                  title={p.speedTitle}
                  description={p.speedDescription}
                  headingLevel={3}
                />
                <CardBody>
                  <TrainingProgressChart
                    points={chartPoints}
                    metric="avgSpeedKmh"
                    unit={t.training.units.kmhUnit}
                    caption={p.speedCaption(horseName)}
                  />
                </CardBody>
              </Card>
            </div>
          ) : null}

          {horsePrograms.length > 0 ? (
            <Card>
              <CardHeader title={p.programsTitle} headingLevel={3} />
              <CardBody>
                <TrainingProgramsList programs={sortProgramsForHorse(horsePrograms)} />
              </CardBody>
            </Card>
          ) : null}

          <Card>
            <CardHeader
              title={p.timelineTitle}
              description={p.timelineDescription}
              headingLevel={3}
            />
            <CardBody>
              {loadingData ? (
                <TrainingTimelineSkeleton />
              ) : sessions.length === 0 ? (
                <EmptyState
                  title={p.noHistoryTitle}
                  description={p.noHistoryDescription(horseName)}
                  action={
                    <ButtonLink href={`/training/horses/${horse.id}/new`}>
                      <Plus className="size-4" aria-hidden="true" />
                      {p.addSession}
                    </ButtonLink>
                  }
                />
              ) : (
                <TrainingTimeline sessions={sessions} />
              )}
            </CardBody>
          </Card>
        </>
      )}
    </div>
  );
}
