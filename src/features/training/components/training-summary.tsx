'use client';

import type { LucideIcon } from 'lucide-react';
import { CalendarCheck2, ClipboardList, Fence, ListChecks } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useTranslations } from '@/i18n';
import type { TrainingOverviewSummary } from '../format';

/**
 * The four figures at the top of the Training overview. Each is derived from
 * the same collections the tabs below show, so a figure can never disagree
 * with the list it summarises.
 *
 * Deliberately plain: a number, a label and one supporting line — the same
 * shape as the Health summary tiles, so the two modules feel like one
 * product.
 */

function SummaryTile({
  label,
  value,
  icon: Icon,
  detail,
}: {
  label: string;
  value: number;
  icon: LucideIcon;
  detail: string;
}) {
  return (
    <li>
      <Card className="h-full p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <p className="text-sm font-medium text-stone-600">{label}</p>
          <span className="bg-pasture-50 text-pasture-600 hidden size-8 shrink-0 items-center justify-center rounded-md sm:flex">
            <Icon className="size-4" aria-hidden="true" />
          </span>
        </div>
        <p className="mt-2 text-3xl font-semibold tracking-tight tabular-nums">{value}</p>
        <p className="mt-1 text-sm text-stone-600">{detail}</p>
      </Card>
    </li>
  );
}

export function TrainingSummary({ summary }: { summary: TrainingOverviewSummary }) {
  const t = useTranslations();
  const s = t.training.summary;
  return (
    <section aria-labelledby="training-summary-heading">
      <h2 id="training-summary-heading" className="sr-only">
        {s.heading}
      </h2>
      <ul className="grid gap-4 min-[360px]:grid-cols-2 sm:gap-5 xl:grid-cols-4">
        <SummaryTile
          label={s.activePrograms}
          value={summary.activePrograms}
          icon={ClipboardList}
          detail={summary.activePrograms > 0 ? s.currentlyInProgress : s.noneActiveRightNow}
        />
        <SummaryTile
          label={s.sessionsThisWeek}
          value={summary.sessionsThisWeek}
          icon={CalendarCheck2}
          detail={summary.sessionsThisWeek > 0 ? s.scheduledOrCompleted : s.nothingThisWeek}
        />
        <SummaryTile
          label={s.completedSessions}
          value={summary.completedSessions}
          icon={ListChecks}
          detail={s.allTime}
        />
        <SummaryTile
          label={s.horsesInTraining}
          value={summary.horsesInTraining}
          icon={Fence}
          detail={s.activeLastWeek}
        />
      </ul>
    </section>
  );
}
