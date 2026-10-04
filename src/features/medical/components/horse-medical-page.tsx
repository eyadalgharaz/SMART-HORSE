'use client';

import { useState } from 'react';
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
import {
  formatRecordDate,
  formatRelativeDay,
  lastVetVisit,
  nextVaccination,
  openFollowUps,
  vaccinationTargetDate,
} from '../format';
import { useHorseMedicalHistory } from '../hooks/use-horse-medical-history';
import { useUpcomingMedicalEvents } from '../hooks/use-upcoming-medical-events';
import { useVaccinations } from '../hooks/use-vaccinations';
import type { MedicalRecord } from '../types';
import { HealthStatusCard } from './health-status';
import { MedicalRecordDetail } from './medical-record-detail';
import { MedicalSavedMessage } from './saved-message';
import { MedicalTimeline } from './medical-timeline';
import { MedicalTimelineSkeleton } from './medical-skeletons';
import { UpcomingMedicalEvents } from './upcoming-medical-events';
import { VaccinationList } from './vaccination-list';

/**
 * Container for /medical/horses/[horseId] — one horse's whole medical picture,
 * with its history timeline as the centrepiece.
 *
 * The horse's identity comes from the Horses module (`useHorse`) and its
 * history from the Medical module, which is why an unknown id is reported by
 * the module that owns horses: a horse that does not exist cannot have a
 * medical history, so the page says "Horse not found" rather than showing an
 * empty history for a horse that was never there.
 */

function BackLink() {
  return (
    <Link
      href="/medical"
      className="hover:text-ink -ml-1.5 inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-sm font-medium text-stone-600"
    >
      <ChevronLeft className="size-4 rtl:rotate-180" aria-hidden="true" />
      Back to health
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

export function HorseMedicalPage({ horseId }: { horseId: string }) {
  const [selected, setSelected] = useState<MedicalRecord | null>(null);

  const horseQuery = useHorse(horseId);
  const history = useHorseMedicalHistory(horseId);
  const { vaccinations } = useVaccinations(undefined, horseId);
  const { events } = useUpcomingMedicalEvents(horseId);

  const horse = horseQuery.horse;

  if (horseQuery.isPending) {
    return (
      <div className="space-y-4">
        <BackLink />
        <div role="status" aria-busy="true" className="space-y-4">
          <span className="sr-only">Loading horse</span>
          <div className="rounded-card border border-stone-200 bg-white p-4 sm:p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <Skeleton className="rounded-card size-24 sm:size-28" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-7 w-40" />
                <Skeleton className="h-4 w-28" />
              </div>
            </div>
          </div>
          <MedicalTimelineSkeleton />
        </div>
      </div>
    );
  }

  if (horseQuery.notFound || !horse) {
    return (
      <div className="space-y-4">
        <BackLink />
        <EmptyState
          title="Horse not found"
          description="This horse doesn't exist, or it is no longer part of your farm."
          action={<ButtonLink href="/medical">Back to health</ButtonLink>}
        />
      </div>
    );
  }

  if (horseQuery.isError) {
    return (
      <div className="space-y-4">
        <BackLink />
        <ErrorState
          title="We couldn't load this horse"
          description="Something went wrong while loading the record. Check your connection and try again."
          action={
            <Button
              variant="secondary"
              onClick={() => void horseQuery.refetch()}
              loading={horseQuery.isRefetching}
            >
              Try again
            </Button>
          }
        />
      </div>
    );
  }

  const lastVisit = lastVetVisit(history.records);
  const nextDose = nextVaccination(vaccinations);
  const nextDoseDate = nextDose ? vaccinationTargetDate(nextDose) : null;
  const followUps = openFollowUps(history.records);

  return (
    <div className="space-y-4">
      <BackLink />
      <MedicalSavedMessage />

      {/* Identity band — the same shape as the Horses profile header, so the two
          pages feel like one record seen from two sides. */}
      <div className="rounded-card border border-stone-200 bg-white p-4 sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <HorsePhoto name={horse.name} src={horse.imageUrl} size="lg" />

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <h2 className="text-xl font-semibold break-words sm:text-2xl">{horse.name}</h2>
              <HorseStatusBadge status={horse.status} />
            </div>
            <p className="mt-1 text-stone-600">{horse.breed}</p>
          </div>

          <div className="flex flex-wrap gap-2 self-start sm:self-center">
            <ButtonLink href={`/horses/${horse.id}`} variant="secondary">
              View horse profile
            </ButtonLink>
            <ButtonLink href={`/medical/horses/${horse.id}/new`}>
              <Plus className="size-4" aria-hidden="true" />
              Add record
            </ButtonLink>
          </div>
        </div>
      </div>

      {history.isError ? (
        <ErrorState
          title="We couldn't load this horse's medical history"
          description="Something went wrong while loading the health data. Check your connection and try again."
          action={
            <Button
              variant="secondary"
              onClick={() => void history.refetch()}
              loading={history.isRefetching}
            >
              Try again
            </Button>
          }
        />
      ) : (
        <>
          <div className="grid gap-4 lg:grid-cols-3">
            <HealthStatusCard health={history.health} />

            <Card className="lg:col-span-2">
              <CardHeader title="Health summary" headingLevel={3} />
              <CardBody className="grid gap-3 sm:grid-cols-3">
                <SummaryFact
                  label="Last vet visit"
                  value={lastVisit ? formatRecordDate(lastVisit.date) : 'None recorded'}
                  detail={lastVisit?.veterinarian ?? undefined}
                />
                <SummaryFact
                  label="Next vaccination"
                  value={nextDoseDate ? formatRecordDate(nextDoseDate) : 'None due'}
                  detail={nextDose?.vaccineName}
                />
                <SummaryFact
                  label="Open follow-ups"
                  value={String(followUps.length)}
                  detail={
                    followUps[0]?.followUpDate
                      ? `Next ${formatRelativeDay(followUps[0].followUpDate).toLowerCase()}`
                      : 'Nothing outstanding'
                  }
                />
              </CardBody>
            </Card>
          </div>

          <Card>
            <CardHeader
              title="Medical timeline"
              description="Every record for this horse, newest first. Select one to see it in full."
              headingLevel={3}
            />
            <CardBody>
              {history.isPending ? (
                <MedicalTimelineSkeleton />
              ) : history.records.length === 0 ? (
                <EmptyState
                  title="No medical records found"
                  description={`Nothing has been recorded for ${horse.name} yet. Add the first record to start its medical history.`}
                  action={
                    <ButtonLink href={`/medical/horses/${horse.id}/new`}>
                      <Plus className="size-4" aria-hidden="true" />
                      Add record
                    </ButtonLink>
                  }
                />
              ) : (
                <MedicalTimeline records={history.records} onSelect={setSelected} />
              )}
            </CardBody>
          </Card>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader title="Upcoming medical events" headingLevel={3} />
              <CardBody>
                {events.length === 0 ? (
                  <p className="text-sm text-stone-600">
                    No upcoming medical events for {horse.name}.
                  </p>
                ) : (
                  <UpcomingMedicalEvents events={events} showHorse={false} />
                )}
              </CardBody>
            </Card>

            <Card>
              <CardHeader title="Vaccinations" headingLevel={3} />
              <CardBody>
                {vaccinations.length === 0 ? (
                  <p className="text-sm text-stone-600">No vaccinations found for {horse.name}.</p>
                ) : (
                  <VaccinationList vaccinations={vaccinations} showHorse={false} compact />
                )}
              </CardBody>
            </Card>
          </div>
        </>
      )}

      <MedicalRecordDetail
        record={selected}
        open={selected !== null}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}
