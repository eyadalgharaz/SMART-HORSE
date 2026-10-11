'use client';

import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { Button, ButtonLink } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { PageHeader } from '@/components/layout/page-header';
import { useI18n, useTabArrowKeys } from '@/i18n';
import { cn } from '@/lib/cn';
import {
  dayOffset,
  formatSessionCount,
  sortSessionsSoonestFirst,
  summarizeTrainingOverview,
} from '../format';
import { useTrainingPrograms } from '../hooks/use-training-programs';
import { useTrainingSessions } from '../hooks/use-training-sessions';
import { emptyTrainingSessionFilters, type TrainingSessionFilters } from '../types';
import { TrainingFilterBar } from './training-filter-bar';
import { TrainingProgramsList } from './training-programs-list';
import { TrainingSavedMessage } from './saved-message';
import { TrainingSessionList } from './training-session-list';
import { TrainingListSkeleton, TrainingSummarySkeleton } from './training-skeletons';
import { TrainingSummary } from './training-summary';
import { UpcomingTrainingSessions } from './upcoming-training-sessions';

/**
 * Container for /training: the farm's whole training picture.
 *
 * Three views belong on this page — sessions, programs and what's coming up —
 * and stacking all three would make a page nobody reads to the bottom. They
 * sit behind tabs instead, under one summary that is always visible, so the
 * page opens on what people look at most (sessions) without hiding the other
 * two. Mirrors the Medical overview's shape, so the two modules feel like one
 * product.
 *
 * Every read goes through the feature hooks, so no component here knows the
 * data is mocked.
 */

type Tab = 'sessions' | 'programs' | 'upcoming';

const tabIds: readonly Tab[] = ['sessions', 'programs', 'upcoming'];
const tabElementId = (id: Tab) => `training-tab-${id}`;

function Tabs({ current, onChange }: { current: Tab; onChange: (tab: Tab) => void }) {
  const { t } = useI18n();
  const onKeyDown = useTabArrowKeys(tabIds, current, onChange, tabElementId);
  const tabs = tabIds.map((id) => ({ id, label: t.training.overview.tabs[id] }));

  return (
    <div
      role="tablist"
      aria-label={t.training.overview.tabsLabel}
      onKeyDown={onKeyDown}
      className="flex gap-1 overflow-x-auto border-b border-stone-200"
    >
      {tabs.map((tab) => {
        const active = tab.id === current;
        return (
          <button
            key={tab.id}
            id={`training-tab-${tab.id}`}
            role="tab"
            type="button"
            aria-selected={active}
            aria-controls={`training-panel-${tab.id}`}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(tab.id)}
            className={cn(
              '-mb-px border-b-2 px-3 py-2.5 text-sm font-medium whitespace-nowrap transition-colors',
              active
                ? 'border-pasture-500 text-pasture-700'
                : 'hover:text-ink border-transparent text-stone-600',
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

export function TrainingOverviewPage() {
  const { t, locale } = useI18n();
  const o = t.training.overview;
  const [tab, setTab] = useState<Tab>('sessions');
  const [filters, setFilters] = useState<TrainingSessionFilters>(emptyTrainingSessionFilters);

  const {
    sessions,
    allSessions,
    totalCount,
    horses,
    trainers,
    isPending,
    isError,
    isRefetching,
    refetch,
  } = useTrainingSessions(filters);
  const {
    programs,
    isPending: programsPending,
    isError: programsError,
    isRefetching: programsRefetching,
    refetch: refetchPrograms,
  } = useTrainingPrograms();

  const summary = useMemo(
    () => summarizeTrainingOverview({ sessions: allSessions, programs }),
    [allSessions, programs],
  );

  const upcoming = useMemo(
    () =>
      sortSessionsSoonestFirst(
        allSessions.filter(
          (session) => session.status === 'scheduled' && dayOffset(session.date) >= 0,
        ),
      ),
    [allSessions],
  );

  // The top-level state follows the sessions query, the same way the Medical
  // overview follows its records query: sessions are what most of the page
  // shows, and the programs panel handles its own loading/error state within
  // its own tab rather than blocking the whole page.
  const loading = isPending;

  if (isError) {
    return (
      <>
        <PageHeader title={t.pages.training.title} description={t.pages.training.description} />
        <ErrorState
          title={t.pages.training.errorTitle}
          description={t.pages.training.errorDescription}
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
        title={t.pages.training.title}
        description={t.pages.training.description}
        action={
          horses[0] ? (
            <ButtonLink href={`/training/horses/${horses[0].id}/new`}>
              <Plus className="size-4" aria-hidden="true" />
              {o.addSession}
            </ButtonLink>
          ) : (
            <ButtonLink href="/horses">
              <Plus className="size-4" aria-hidden="true" />
              {o.addSession}
            </ButtonLink>
          )
        }
      />

      <div className="space-y-6">
        <TrainingSavedMessage />

        {loading ? <TrainingSummarySkeleton /> : <TrainingSummary summary={summary} />}

        {totalCount === 0 && !loading ? (
          <EmptyState
            title={o.emptyTitle}
            description={o.emptyDescription}
            action={<ButtonLink href="/horses">{o.browseHorses}</ButtonLink>}
          />
        ) : (
          <div>
            <Tabs current={tab} onChange={setTab} />

            <div
              id="training-panel-sessions"
              role="tabpanel"
              aria-labelledby="training-tab-sessions"
              tabIndex={0}
              hidden={tab !== 'sessions'}
              className="pt-4"
            >
              <div className="space-y-4">
                <TrainingFilterBar
                  filters={filters}
                  onChange={setFilters}
                  onReset={() => setFilters(emptyTrainingSessionFilters)}
                  horses={horses}
                  trainers={trainers}
                />

                {loading ? (
                  <TrainingListSkeleton />
                ) : (
                  <>
                    <p role="status" className="text-sm text-stone-600">
                      {formatSessionCount(sessions.length, totalCount, locale)}
                    </p>

                    {sessions.length === 0 ? (
                      <EmptyState
                        title={o.noMatchTitle}
                        description={o.noMatchDescription}
                        action={
                          <Button
                            variant="secondary"
                            onClick={() => setFilters(emptyTrainingSessionFilters)}
                          >
                            {t.common.clearFilters}
                          </Button>
                        }
                      />
                    ) : (
                      <TrainingSessionList sessions={sessions} />
                    )}
                  </>
                )}
              </div>
            </div>

            <div
              id="training-panel-programs"
              role="tabpanel"
              aria-labelledby="training-tab-programs"
              tabIndex={0}
              hidden={tab !== 'programs'}
              className="pt-4"
            >
              {programsPending ? (
                <TrainingListSkeleton label={o.loadingPrograms} />
              ) : programsError ? (
                <ErrorState
                  title={o.programsErrorTitle}
                  description={o.programsErrorDescription}
                  action={
                    <Button
                      variant="secondary"
                      onClick={() => void refetchPrograms()}
                      loading={programsRefetching}
                    >
                      {t.common.tryAgain}
                    </Button>
                  }
                />
              ) : programs.length === 0 ? (
                <EmptyState title={o.programsEmptyTitle} description={o.programsEmptyDescription} />
              ) : (
                <TrainingProgramsList programs={programs} />
              )}
            </div>

            <div
              id="training-panel-upcoming"
              role="tabpanel"
              aria-labelledby="training-tab-upcoming"
              tabIndex={0}
              hidden={tab !== 'upcoming'}
              className="pt-4"
            >
              <div className="rounded-card border border-stone-200 bg-white p-4 sm:p-5">
                {upcoming.length === 0 ? (
                  <p className="text-sm text-stone-600">{o.upcomingEmpty}</p>
                ) : (
                  <UpcomingTrainingSessions sessions={upcoming} />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
