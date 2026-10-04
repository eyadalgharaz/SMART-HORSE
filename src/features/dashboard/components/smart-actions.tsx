'use client';

import Link from 'next/link';
import { ArrowRight, CalendarClock, CircleCheck, Syringe, TriangleAlert } from 'lucide-react';
import { Card, CardHeader } from '@/components/ui/card';
import { useLocale, useTranslations } from '@/i18n';
import { formatDayLabel } from '../format';
import type { DashboardOverview } from '../types';
import { fadeInUp, hoverLift, staggerDelay } from './layout';

interface SmartActionItem {
  key: string;
  icon: typeof Syringe;
  text: string;
  actionLabel: string;
  href: string;
}

/**
 * A frontend-only "operational assistant" reading: every card here is derived
 * live from the same mock summary/health/task figures the rest of the
 * dashboard already shows — nothing is a separate dataset, a backend rule
 * engine, or a real notification system. It is a UX simulation of what a
 * smart assistant would flag, built entirely from data already on screen.
 */
function buildActions(
  data: Pick<DashboardOverview, 'summary' | 'health' | 'upcomingTasks'>,
  referenceIso: string,
  t: ReturnType<typeof useTranslations>,
  locale: 'en' | 'ar',
): SmartActionItem[] {
  const items: SmartActionItem[] = [];

  if (data.health.vaccinations.dueThisWeek > 0) {
    items.push({
      key: 'vaccinations',
      icon: Syringe,
      text: t.dashboard.smartActions.vaccinationsDue(data.health.vaccinations.dueThisWeek),
      actionLabel: t.dashboard.smartActions.reviewHorses,
      href: '/medical',
    });
  }

  const overdueCount = data.upcomingTasks.filter((task) => task.status === 'overdue').length;
  if (overdueCount > 0) {
    items.push({
      key: 'overdue-tasks',
      icon: TriangleAlert,
      text: t.dashboard.smartActions.tasksOverdue(overdueCount),
      actionLabel: t.dashboard.smartActions.viewTasks,
      href: '/tasks',
    });
  }

  if (data.summary.upcomingVisits.nextAt) {
    const dayLabel = formatDayLabel(
      new Date(data.summary.upcomingVisits.nextAt),
      new Date(referenceIso),
      t,
      locale,
    );
    if (dayLabel === t.dashboard.relativeDay.tomorrow) {
      items.push({
        key: 'upcoming-visit',
        icon: CalendarClock,
        text: t.dashboard.smartActions.upcomingVisit(dayLabel),
        actionLabel: t.dashboard.smartActions.openVisit,
        href: '/medical',
      });
    }
  }

  return items;
}

export function SmartActions({
  data,
  referenceIso,
}: {
  data: Pick<DashboardOverview, 'summary' | 'health' | 'upcomingTasks'>;
  referenceIso: string;
}) {
  const t = useTranslations();
  const { locale } = useLocale();
  const actions = buildActions(data, referenceIso, t, locale);

  return (
    <Card className={fadeInUp}>
      <CardHeader
        title={t.dashboard.smartActions.sectionTitle}
        description={t.dashboard.smartActions.sectionDescription}
      />
      {actions.length === 0 ? (
        <div className="flex items-center gap-2 px-4 py-6 text-sm text-stone-600 sm:px-5">
          <CircleCheck className="text-forest-500 size-4 shrink-0" aria-hidden="true" />
          {t.dashboard.smartActions.allClear}
        </div>
      ) : (
        <ul className="grid gap-3 p-4 sm:grid-cols-2 sm:p-5 xl:grid-cols-3">
          {actions.map((action, index) => (
            <li key={action.key} className={`${fadeInUp} ${staggerDelay(index)}`}>
              <Link
                href={action.href}
                className={`bg-sand-50 border-sand-200 flex h-full flex-col justify-between gap-3 rounded-lg border p-4 ${hoverLift}`}
              >
                <p className="flex items-start gap-2.5 text-sm">
                  <action.icon
                    className="text-forest-600 mt-0.5 size-4 shrink-0"
                    aria-hidden="true"
                  />
                  <span>{action.text}</span>
                </p>
                <span className="text-forest-700 inline-flex items-center gap-1 text-sm font-medium">
                  {action.actionLabel}
                  <ArrowRight className="size-3.5 rtl:rotate-180" aria-hidden="true" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
