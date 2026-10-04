'use client';

import type { LucideIcon } from 'lucide-react';
import { CalendarCheck, HeartPulse, Pill, Stethoscope, Syringe } from 'lucide-react';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { useLocale, useTranslations } from '@/i18n';
import { formatDayLabel } from '../format';
import type { HealthOverview } from '../types';
import { fadeInUp } from './layout';
import { SectionEmpty } from './section-empty';
import { SectionLink } from './section-link';

interface Stat {
  key: string;
  label: string;
  count: number;
  note: string;
  icon: LucideIcon;
}

function useStats(health: HealthOverview, referenceIso: string): Stat[] {
  const t = useTranslations();
  const { locale } = useLocale();
  const { vaccinations, medicalVisits, activeTreatments, followUps } = health;
  const dueThisWeek = (count: number) =>
    count > 0 ? t.dashboard.summary.dueThisWeek(count) : t.dashboard.summary.noneDueThisWeek;

  return [
    {
      key: 'vaccinations',
      label: t.dashboard.health.vaccinations,
      count: vaccinations.count,
      note: dueThisWeek(vaccinations.dueThisWeek),
      icon: Syringe,
    },
    {
      key: 'medical-visits',
      label: t.dashboard.health.medicalVisits,
      count: medicalVisits.count,
      note: medicalVisits.nextAt
        ? t.dashboard.summary.nextVisit(
            formatDayLabel(new Date(medicalVisits.nextAt), new Date(referenceIso), t, locale),
          )
        : t.dashboard.summary.noneScheduled,
      icon: Stethoscope,
    },
    {
      key: 'active-treatments',
      label: t.dashboard.health.activeTreatments,
      count: activeTreatments.count,
      note:
        activeTreatments.horsesAffected > 0
          ? t.dashboard.health.horsesAffected(activeTreatments.horsesAffected)
          : t.dashboard.health.noneActive,
      icon: Pill,
    },
    {
      key: 'follow-ups',
      label: t.dashboard.health.followUps,
      count: followUps.count,
      note: dueThisWeek(followUps.dueThisWeek),
      icon: CalendarCheck,
    },
  ];
}

/** Share of horses with vaccinations up to date, shown as words and a bar. */
function VaccinationCoverage({ upToDate, total }: HealthOverview['vaccinationCoverage']) {
  const t = useTranslations();
  const percent = Math.round((upToDate / total) * 100);
  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-x-3">
        <p className="text-sm font-medium">{t.dashboard.health.vaccinationCoverageTitle}</p>
        <p className="text-sm text-stone-600 tabular-nums">
          {t.dashboard.health.coverageOf(upToDate, total, percent)}
        </p>
      </div>
      <div
        role="progressbar"
        aria-label={t.dashboard.health.vaccinationCoverageTitle}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={upToDate}
        aria-valuetext={t.dashboard.health.coverageOf(upToDate, total, percent)}
        className="mt-2 h-2.5 overflow-hidden rounded-full bg-stone-200"
      >
        <div
          className="bg-forest-500 h-full rounded-full transition-[width] duration-700 ease-out motion-reduce:transition-none"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

export function HealthOverviewPanel({
  health,
  referenceIso,
}: {
  health: HealthOverview;
  referenceIso: string;
}) {
  const t = useTranslations();
  const stats = useStats(health, referenceIso);
  const isEmpty = health.vaccinationCoverage.total === 0 && stats.every((stat) => stat.count === 0);

  return (
    <Card className={`flex h-full flex-col ${fadeInUp}`}>
      <CardHeader
        title={t.dashboard.health.sectionTitle}
        action={<SectionLink href="/medical" label={t.dashboard.health.viewAllLabel} />}
      />
      {isEmpty ? (
        <SectionEmpty
          icon={HeartPulse}
          title={t.dashboard.health.emptyTitle}
          description={t.dashboard.health.emptyDescription}
        />
      ) : (
        <CardBody className="flex flex-1 flex-col gap-6">
          {health.vaccinationCoverage.total > 0 ? (
            <VaccinationCoverage {...health.vaccinationCoverage} />
          ) : null}

          <dl className="grid flex-1 auto-rows-fr grid-cols-2 gap-3">
            {stats.map(({ key, label, count, note, icon: Icon }) => (
              <div
                key={key}
                className="flex flex-col rounded-md bg-stone-50 p-4 transition-colors duration-200 hover:bg-stone-100"
              >
                {/* The label takes the spare height, so counts line up across a row even when a label wraps. */}
                <dt className="flex flex-1 items-start gap-2 text-sm text-stone-600">
                  <Icon className="text-forest-600 mt-0.5 size-4 shrink-0" aria-hidden="true" />
                  {label}
                </dt>
                <dd className="mt-1 text-2xl font-semibold tabular-nums">{count}</dd>
                <dd className="text-sm text-stone-600">{note}</dd>
              </div>
            ))}
          </dl>
        </CardBody>
      )}
    </Card>
  );
}
