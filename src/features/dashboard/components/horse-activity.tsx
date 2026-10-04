'use client';

import { Activity, Minus, TrendingDown, TrendingUp } from 'lucide-react';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { useLocale, useTranslations } from '@/i18n';
import { formatWeekdayShort, percentChange, pluralizeSessions } from '../format';
import type { HorseActivity } from '../types';
import { ActivityBarChart } from './activity-bar-chart';
import { fadeInUp } from './layout';
import { SectionEmpty } from './section-empty';

function Trend({ total, previous }: { total: number; previous: number }) {
  const t = useTranslations();
  const change = percentChange(total, previous);
  if (change === null) return null;

  const Icon = change > 0 ? TrendingUp : change < 0 ? TrendingDown : Minus;
  const text =
    change === 0 ? t.dashboard.activity.noChange : `${change > 0 ? '+' : '−'}${Math.abs(change)}%`;
  return (
    <p className="flex items-center gap-1 text-sm text-stone-600">
      <Icon className="size-4 shrink-0" aria-hidden="true" />
      <span>{t.dashboard.activity.trendVsPrevious(text)}</span>
    </p>
  );
}

export function HorseActivityPanel({
  activity,
  referenceIso,
}: {
  activity: HorseActivity;
  referenceIso: string;
}) {
  const t = useTranslations();
  const { locale } = useLocale();
  const total = activity.days.reduce((sum, day) => sum + day.sessions, 0);
  const first = activity.days[0];
  const last = activity.days[activity.days.length - 1];
  const range =
    first && last
      ? `${formatWeekdayShort(first.date, locale)}–${formatWeekdayShort(last.date, locale)}`
      : '';

  return (
    <Card className={`flex h-full flex-col ${fadeInUp}`}>
      <CardHeader
        title={t.dashboard.activity.sectionTitle}
        description={t.dashboard.activity.sectionDescription}
      />
      {total === 0 ? (
        <SectionEmpty
          icon={Activity}
          title={t.dashboard.activity.emptyTitle}
          description={t.dashboard.activity.emptyDescription}
        />
      ) : (
        <CardBody className="flex flex-1 flex-col">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <p>
              <span className="text-3xl font-semibold tracking-tight tabular-nums">{total}</span>{' '}
              <span className="text-sm text-stone-600">
                {t.dashboard.activity.sessionsIn(
                  pluralizeSessions(total, t),
                  t.dashboard.activity.periodLabel,
                )}
              </span>
            </p>
            <Trend total={total} previous={activity.previousPeriodTotal} />
          </div>

          <div className="mt-5 flex flex-1 flex-col">
            <ActivityBarChart
              days={activity.days}
              referenceIso={referenceIso}
              caption={t.dashboard.activity.caption(range)}
            />
          </div>
        </CardBody>
      )}
    </Card>
  );
}
