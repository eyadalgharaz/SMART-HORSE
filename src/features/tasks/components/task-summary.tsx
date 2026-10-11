'use client';

import type { LucideIcon } from 'lucide-react';
import { AlertTriangle, CalendarClock, CheckCircle2, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useTranslations } from '@/i18n';
import type { TaskOverviewSummary } from '../format';

/**
 * The four figures at the top of /tasks. Each is derived from the same task
 * collection the tabs below show, so a figure can never disagree with the
 * list it summarises. Overdue and Due today are computed fresh from each
 * task's due date every time this renders — see `summarizeTasks`.
 */

function SummaryTile({
  label,
  value,
  icon: Icon,
  tone,
  detail,
}: {
  label: string;
  value: number;
  icon: LucideIcon;
  tone: 'neutral' | 'danger';
  detail: string;
}) {
  return (
    <li>
      <Card className="h-full p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <p className="text-sm font-medium text-stone-600">{label}</p>
          <span
            className={`hidden size-8 shrink-0 items-center justify-center rounded-md sm:flex ${
              tone === 'danger' ? 'bg-red-50 text-red-600' : 'bg-pasture-50 text-pasture-600'
            }`}
          >
            <Icon className="size-4" aria-hidden="true" />
          </span>
        </div>
        <p className="mt-2 text-3xl font-semibold tracking-tight tabular-nums">{value}</p>
        <p className="mt-1 text-sm text-stone-600">{detail}</p>
      </Card>
    </li>
  );
}

export function TaskSummary({ summary }: { summary: TaskOverviewSummary }) {
  const t = useTranslations();
  const s = t.tasks.summary;
  return (
    <section aria-labelledby="task-summary-heading">
      <h2 id="task-summary-heading" className="sr-only">
        {s.heading}
      </h2>
      <ul className="grid gap-4 min-[360px]:grid-cols-2 sm:gap-5 xl:grid-cols-4">
        <SummaryTile
          label={s.dueToday}
          value={summary.dueToday}
          icon={CalendarClock}
          tone="neutral"
          detail={summary.dueToday > 0 ? s.needsAttentionToday : s.nothingDueToday}
        />
        <SummaryTile
          label={s.overdue}
          value={summary.overdue}
          icon={AlertTriangle}
          tone={summary.overdue > 0 ? 'danger' : 'neutral'}
          detail={summary.overdue > 0 ? s.pastDueDate : s.allCaughtUp}
        />
        <SummaryTile
          label={s.inProgress}
          value={summary.inProgress}
          icon={Loader2}
          tone="neutral"
          detail={s.currentlyUnderway}
        />
        <SummaryTile
          label={s.completed}
          value={summary.completed}
          icon={CheckCircle2}
          tone="neutral"
          detail={s.allTime}
        />
      </ul>
    </section>
  );
}
