'use client';

import {
  CalendarClock,
  ClipboardList,
  Fence,
  Syringe,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { useLocale, useTranslations } from '@/i18n';
import { formatDayLabel, formatSignedChange } from '../format';
import type { DashboardSummary } from '../types';
import { SummaryCard } from './summary-card';

interface SummaryCardsProps {
  summary: DashboardSummary;
  /** Snapshot time; "Tomorrow" and similar are measured from it. */
  referenceIso: string;
}

/** Month-over-month change in horse count, as text plus a direction icon. */
function HorseTrend({ value, previous }: { value: number; previous: number | null }) {
  const t = useTranslations();
  if (previous === null) {
    return (
      <>{value === 0 ? t.dashboard.summary.noHorsesAddedYet : t.dashboard.summary.noHistoryYet}</>
    );
  }

  const change = value - previous;
  if (change === 0) return <>{t.dashboard.summary.noChangeVsLastMonth}</>;

  const Icon = change > 0 ? TrendingUp : TrendingDown;
  return (
    <>
      <Icon className="hidden size-4 shrink-0 sm:block" aria-hidden="true" />
      <span>{t.dashboard.summary.changeVsLastMonth(formatSignedChange(change))}</span>
    </>
  );
}

export function SummaryCards({ summary, referenceIso }: SummaryCardsProps) {
  const { totalHorses, upcomingVisits, vaccinations, pendingTasks } = summary;
  const t = useTranslations();
  const { locale } = useLocale();

  return (
    <section aria-labelledby="dashboard-summary-heading">
      <h2 id="dashboard-summary-heading" className="sr-only">
        {t.dashboard.summary.sectionTitle}
      </h2>
      <ul className="grid gap-4 min-[360px]:grid-cols-2 sm:gap-5 xl:grid-cols-4">
        <SummaryCard
          label={t.dashboard.summary.totalHorses}
          value={totalHorses.value}
          icon={Fence}
          index={0}
        >
          <HorseTrend value={totalHorses.value} previous={totalHorses.previousMonthValue} />
        </SummaryCard>

        <SummaryCard
          label={t.dashboard.summary.upcomingVisits}
          value={upcomingVisits.value}
          icon={CalendarClock}
          index={1}
        >
          {upcomingVisits.nextAt
            ? t.dashboard.summary.nextVisit(
                formatDayLabel(new Date(upcomingVisits.nextAt), new Date(referenceIso), t, locale),
              )
            : t.dashboard.summary.noneScheduled}
        </SummaryCard>

        <SummaryCard
          label={t.dashboard.summary.vaccinations}
          value={vaccinations.value}
          icon={Syringe}
          index={2}
        >
          {vaccinations.dueThisWeek > 0
            ? t.dashboard.summary.dueThisWeek(vaccinations.dueThisWeek)
            : t.dashboard.summary.noneDueThisWeek}
        </SummaryCard>

        <SummaryCard
          label={t.dashboard.summary.pendingTasks}
          value={pendingTasks.value}
          icon={ClipboardList}
          index={3}
        >
          {pendingTasks.dueToday > 0
            ? t.dashboard.summary.dueToday(pendingTasks.dueToday)
            : t.dashboard.summary.noneDueToday}
        </SummaryCard>
      </ul>
    </section>
  );
}
