'use client';

import { CalendarClock, ClipboardList, Warehouse } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslations } from '@/i18n';
import { greetingFor } from '../format';
import { fadeInUp } from './layout';

interface DashboardHeaderProps {
  /** First name of the signed-in user; the greeting drops the name when absent. */
  firstName: string | null;
  /** Current farm. Null while loading or when the request failed. */
  farmName: string | null;
  farmLoading?: boolean;
  /** Quick operational counts for the hero's indicator chips; omitted while loading. */
  summary?: { upcomingVisits: number; pendingTasks: number } | null;
  /** Injected so the greeting is testable; defaults to the browser clock. */
  now?: Date;
}

/**
 * The dashboard's hero: greeting, farm, a one-line summary of what today
 * looks like, and two compact operational indicators drawn from the same
 * summary figures the metric cards below show — never a separate guess.
 *
 * The page title ("Dashboard") already sits in the topbar, so this heading
 * speaks to the person instead of repeating it. The farm is a plain label,
 * not a switcher: multi-farm selection belongs to the Farms module and a
 * control that does nothing would be misleading.
 */
export function DashboardHeader({
  firstName,
  farmName,
  farmLoading = false,
  summary = null,
  now = new Date(),
}: DashboardHeaderProps) {
  const t = useTranslations();
  const greetingWord = greetingFor(now, t);
  const greeting = firstName ? `${greetingWord}, ${firstName}` : greetingWord;

  return (
    <div
      className={`bg-forest-700 text-sand-50 relative overflow-hidden rounded-xl px-5 py-6 sm:px-7 sm:py-7 ${fadeInUp}`}
    >
      {/* A quiet brass glow in the corner — texture, not decoration that competes with the text. */}
      <div
        aria-hidden="true"
        className="bg-brass-400 absolute end-0 -top-16 size-56 rounded-full opacity-[0.12] blur-3xl"
      />

      <div className="relative flex flex-wrap items-start justify-between gap-x-4 gap-y-4">
        <div className="min-w-0">
          <h2 className="text-xl font-semibold sm:text-2xl">{greeting}</h2>
          <p className="text-sand-100 mt-1.5">
            {farmName ? t.dashboard.heroSummary(farmName) : null}
          </p>

          {summary ? (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <HeroStat
                icon={CalendarClock}
                text={t.dashboard.summary.upcomingVisits}
                count={summary.upcomingVisits}
              />
              <HeroStat
                icon={ClipboardList}
                text={t.dashboard.summary.pendingTasks}
                count={summary.pendingTasks}
              />
            </div>
          ) : null}
        </div>

        {farmLoading ? (
          <Skeleton className="h-9 w-44 bg-white/10" />
        ) : farmName ? (
          <p className="border-sand-50/20 bg-forest-900/40 inline-flex max-w-full items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium backdrop-blur-sm">
            <Warehouse className="text-brass-400 size-4 shrink-0" aria-hidden="true" />
            <span className="sr-only">{t.dashboard.farmLabelSrPrefix}</span>
            <span className="truncate">{farmName}</span>
          </p>
        ) : null}
      </div>
    </div>
  );
}

function HeroStat({
  icon: Icon,
  text,
  count,
}: {
  icon: typeof CalendarClock;
  text: string;
  count: number;
}) {
  return (
    <span className="border-sand-50/15 bg-sand-50/10 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm">
      <Icon className="text-brass-400 size-3.5 shrink-0" aria-hidden="true" />
      <span className="font-semibold tabular-nums">{count}</span>
      <span className="text-sand-100">{text}</span>
    </span>
  );
}
