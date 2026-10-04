'use client';

import type { LucideIcon } from 'lucide-react';
import {
  CalendarClock,
  CircleCheck,
  Clock,
  Dumbbell,
  Flag,
  Hammer,
  Stethoscope,
  Syringe,
  TriangleAlert,
  Wheat,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader } from '@/components/ui/card';
import { useLocale, useTranslations } from '@/i18n';
import { formatDueLabel, localizedHorseName, taskTitle } from '../format';
import type { TaskStatus, TaskType, UpcomingTask } from '../types';
import { fadeInUp, staggerDelay } from './layout';
import { SectionEmpty } from './section-empty';
import { SectionLink } from './section-link';

const typeIcons: Record<TaskType, LucideIcon> = {
  vaccination: Syringe,
  veterinary: Stethoscope,
  farrier: Hammer,
  training: Dumbbell,
  feeding: Wheat,
};

type BadgeTone = 'neutral' | 'warning' | 'danger' | 'success';

/** Every status has a word and an icon, so colour is never the only signal. */
const statusIcons: Record<TaskStatus, { tone: BadgeTone; icon: LucideIcon }> = {
  upcoming: { tone: 'neutral', icon: CalendarClock },
  'due-today': { tone: 'warning', icon: Clock },
  overdue: { tone: 'danger', icon: TriangleAlert },
  completed: { tone: 'success', icon: CircleCheck },
};

function TaskRow({
  task,
  referenceIso,
  index,
}: {
  task: UpcomingTask;
  referenceIso: string;
  index: number;
}) {
  const t = useTranslations();
  const { locale } = useLocale();
  const TypeIcon = typeIcons[task.type];
  const { tone, icon: StatusIcon } = statusIcons[task.status];

  return (
    <li
      className={`flex gap-3 px-4 py-3.5 transition-colors duration-150 hover:bg-stone-50 sm:px-5 ${fadeInUp} ${staggerDelay(index)}`}
    >
      <span className="bg-forest-50 text-forest-600 flex size-8 shrink-0 items-center justify-center rounded-md">
        <TypeIcon className="size-4" aria-hidden="true" />
      </span>

      <div className="flex min-w-0 flex-1 flex-col gap-1.5 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="min-w-0">
          <p className="font-medium">{taskTitle(task.type, t)}</p>
          <p className="flex flex-wrap items-center gap-x-2 text-sm text-stone-600">
            <span>{localizedHorseName(task.horseName, t)}</span>
            {task.priority === 'high' ? (
              <span className="text-ink-soft inline-flex items-center gap-1 font-medium">
                <Flag className="size-3.5" aria-hidden="true" />
                {t.dashboard.highPriority}
              </span>
            ) : null}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 sm:shrink-0 sm:flex-col sm:items-end sm:gap-1">
          <time dateTime={task.dueAt} className="text-sm whitespace-nowrap text-stone-600">
            {formatDueLabel(task.dueAt, referenceIso, t, locale)}
          </time>
          <Badge tone={tone} icon={<StatusIcon className="size-3.5" aria-hidden="true" />}>
            {t.dashboard.taskStatus[task.status]}
          </Badge>
        </div>
      </div>
    </li>
  );
}

export function UpcomingTasks({
  tasks,
  referenceIso,
}: {
  tasks: UpcomingTask[];
  referenceIso: string;
}) {
  const t = useTranslations();

  return (
    <Card className={`flex h-full flex-col ${fadeInUp}`}>
      <CardHeader
        title={t.dashboard.tasks.sectionTitle}
        action={<SectionLink href="/tasks" label={t.dashboard.tasks.viewAllLabel} />}
      />
      {tasks.length === 0 ? (
        <SectionEmpty
          title={t.dashboard.tasks.emptyTitle}
          description={t.dashboard.tasks.emptyDescription}
        />
      ) : (
        <ul className="divide-y divide-stone-200">
          {tasks.map((task, index) => (
            <TaskRow key={task.id} task={task} referenceIso={referenceIso} index={index} />
          ))}
        </ul>
      )}
    </Card>
  );
}
