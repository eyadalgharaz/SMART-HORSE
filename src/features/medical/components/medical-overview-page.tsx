'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { PageHeader } from '@/components/layout/page-header';
import { useI18n, useTabArrowKeys } from '@/i18n';
import { cn } from '@/lib/cn';
import { formatRecordCount, formatVaccinationCount, horsesOf, summarizeOverview } from '../format';
import { useHorseHealth } from '../hooks/use-horse-health';
import { useMedicalRecords } from '../hooks/use-medical-records';
import { useUpcomingMedicalEvents } from '../hooks/use-upcoming-medical-events';
import { useVaccinations } from '../hooks/use-vaccinations';
import {
  emptyMedicalRecordFilters,
  emptyVaccinationFilters,
  type MedicalRecord,
  type MedicalRecordFilters,
  type VaccinationFilters,
} from '../types';
import { MedicalFilterBar } from './medical-filter-bar';
import { MedicalRecordDetail } from './medical-record-detail';
import { MedicalRecordList } from './medical-record-list';
import { MedicalSavedMessage } from './saved-message';
import { MedicalSummary } from './medical-summary';
import { MedicalListSkeleton, MedicalSummarySkeleton } from './medical-skeletons';
import { UpcomingMedicalEvents } from './upcoming-medical-events';
import { VaccinationFilterBar, VaccinationList } from './vaccination-list';

/**
 * Container for /medical: the farm's whole health picture.
 *
 * Three collections belong on this page — records, vaccinations and what is
 * coming up — and stacking all three would make a page nobody reads to the
 * bottom. They sit behind tabs instead, under one health summary that is always
 * visible, so the page opens on what people look at most (the records) without
 * hiding the other two.
 *
 * Every read goes through the feature hooks, so no component here knows the data
 * is mocked.
 */

type Tab = 'records' | 'vaccinations' | 'upcoming';

const tabIds: readonly Tab[] = ['records', 'vaccinations', 'upcoming'];
const tabElementId = (id: Tab) => `tab-${id}`;

function Tabs({ current, onChange }: { current: Tab; onChange: (tab: Tab) => void }) {
  const { t } = useI18n();
  const onKeyDown = useTabArrowKeys(tabIds, current, onChange, tabElementId);
  const tabs = tabIds.map((id) => ({ id, label: t.medical.overview.tabs[id] }));

  return (
    <div
      role="tablist"
      aria-label={t.medical.overview.tabsLabel}
      onKeyDown={onKeyDown}
      className="flex gap-1 overflow-x-auto border-b border-stone-200"
    >
      {tabs.map((tab) => {
        const active = tab.id === current;
        return (
          <button
            key={tab.id}
            id={`tab-${tab.id}`}
            role="tab"
            type="button"
            aria-selected={active}
            aria-controls={`panel-${tab.id}`}
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

export function MedicalOverviewPage() {
  const { t, locale } = useI18n();
  const o = t.medical.overview;
  const [tab, setTab] = useState<Tab>('records');
  const [filters, setFilters] = useState<MedicalRecordFilters>(emptyMedicalRecordFilters);
  const [vaccinationFilters, setVaccinationFilters] =
    useState<VaccinationFilters>(emptyVaccinationFilters);
  const [selected, setSelected] = useState<MedicalRecord | null>(null);

  const { records, allRecords, totalCount, horses, isPending, isError, isRefetching, refetch } =
    useMedicalRecords(filters);
  const { vaccinations, totalCount: vaccinationTotal } = useVaccinations(vaccinationFilters);
  const { vaccinations: allVaccinations } = useVaccinations();
  const { events } = useUpcomingMedicalEvents();
  const { health } = useHorseHealth();

  // The summary describes the whole farm, so it reads the unfiltered records:
  // narrowing the list below must not change the figures above it.
  const farmSummary = useMemo(
    () => summarizeOverview({ records: allRecords, vaccinations: allVaccinations, events, health }),
    [allRecords, allVaccinations, events, health],
  );

  /** Only horses that actually have a vaccination on file. */
  const vaccinationHorses = useMemo(() => horsesOf(allVaccinations), [allVaccinations]);

  if (isError) {
    return (
      <>
        <PageHeader title={t.pages.medical.title} description={t.pages.medical.description} />
        <ErrorState
          title={t.pages.medical.errorTitle}
          description={t.pages.medical.errorDescription}
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
      <PageHeader title={t.pages.medical.title} description={t.pages.medical.description} />

      <div className="space-y-6">
        <MedicalSavedMessage />

        {isPending ? <MedicalSummarySkeleton /> : <MedicalSummary summary={farmSummary} />}

        {totalCount === 0 && !isPending ? (
          <EmptyState title={o.emptyTitle} description={o.emptyDescription} />
        ) : (
          <div>
            <Tabs current={tab} onChange={setTab} />

            <div
              id="panel-records"
              role="tabpanel"
              aria-labelledby="tab-records"
              tabIndex={0}
              hidden={tab !== 'records'}
              className="pt-4"
            >
              <div className="space-y-4">
                <MedicalFilterBar
                  filters={filters}
                  onChange={setFilters}
                  onReset={() => setFilters(emptyMedicalRecordFilters)}
                  horses={horses}
                />

                {isPending ? (
                  <MedicalListSkeleton />
                ) : (
                  <>
                    <p role="status" className="text-sm text-stone-600">
                      {formatRecordCount(records.length, totalCount, locale)}
                    </p>

                    {records.length === 0 ? (
                      <EmptyState
                        title={o.noMatchTitle}
                        description={o.noMatchDescription}
                        action={
                          <Button
                            variant="secondary"
                            onClick={() => setFilters(emptyMedicalRecordFilters)}
                          >
                            {t.common.clearFilters}
                          </Button>
                        }
                      />
                    ) : (
                      <MedicalRecordList records={records} onSelect={setSelected} />
                    )}
                  </>
                )}
              </div>
            </div>

            <div
              id="panel-vaccinations"
              role="tabpanel"
              aria-labelledby="tab-vaccinations"
              tabIndex={0}
              hidden={tab !== 'vaccinations'}
              className="pt-4"
            >
              <div className="space-y-4">
                <VaccinationFilterBar
                  filters={vaccinationFilters}
                  onChange={setVaccinationFilters}
                  horses={vaccinationHorses}
                />

                {isPending ? (
                  <MedicalListSkeleton label={o.loadingVaccinations} />
                ) : vaccinationTotal === 0 ? (
                  <EmptyState
                    title={o.vaccinationsEmptyTitle}
                    description={o.vaccinationsEmptyDescription}
                  />
                ) : (
                  <>
                    <p role="status" className="text-sm text-stone-600">
                      {formatVaccinationCount(vaccinations.length, vaccinationTotal, locale)}
                    </p>

                    {vaccinations.length === 0 ? (
                      <EmptyState
                        title={o.vaccinationsNoMatchTitle}
                        description={o.vaccinationsNoMatchDescription}
                        action={
                          <Button
                            variant="secondary"
                            onClick={() => setVaccinationFilters(emptyVaccinationFilters)}
                          >
                            {t.common.clearFilters}
                          </Button>
                        }
                      />
                    ) : (
                      <VaccinationList vaccinations={vaccinations} />
                    )}
                  </>
                )}
              </div>
            </div>

            <div
              id="panel-upcoming"
              role="tabpanel"
              aria-labelledby="tab-upcoming"
              tabIndex={0}
              hidden={tab !== 'upcoming'}
              className="pt-4"
            >
              <Card>
                <CardHeader title={o.upcomingTitle} description={o.upcomingDescription} />
                <CardBody>
                  {events.length === 0 ? (
                    <p className="text-sm text-stone-600">{o.upcomingEmpty}</p>
                  ) : (
                    <UpcomingMedicalEvents events={events} />
                  )}
                </CardBody>
              </Card>
            </div>
          </div>
        )}
      </div>

      <MedicalRecordDetail
        record={selected}
        open={selected !== null}
        onClose={() => setSelected(null)}
      />
    </>
  );
}
