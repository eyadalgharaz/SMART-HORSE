import type { LucideIcon } from 'lucide-react';
import { CalendarClock, FileText, HeartPulse, Syringe } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { formatNameList, formatRecordDate, type OverviewSummary } from '../format';

/**
 * The four figures at the top of the Medical overview. Each is derived from the
 * same collections the tabs below show, so a figure can never disagree with the
 * list it summarises.
 *
 * Deliberately plain: a number, a label and one supporting line. Colour is left
 * to the badges in the lists, where it marks a state that needs a decision — a
 * wall of coloured tiles would make everything look equally urgent.
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

export function MedicalSummary({ summary }: { summary: OverviewSummary }) {
  const { attention, vaccinations, visits, recent } = summary;

  return (
    <section aria-labelledby="medical-summary-heading">
      <h2 id="medical-summary-heading" className="sr-only">
        Health summary
      </h2>
      <ul className="grid gap-4 min-[360px]:grid-cols-2 sm:gap-5 xl:grid-cols-4">
        <SummaryTile
          label="Horses requiring attention"
          value={attention.count}
          icon={HeartPulse}
          detail={attention.count > 0 ? formatNameList(attention.names) : 'None right now'}
        />

        <SummaryTile
          label="Vaccinations due"
          value={vaccinations.count}
          icon={Syringe}
          detail={
            vaccinations.overdue > 0
              ? `${vaccinations.overdue} overdue`
              : vaccinations.nextDate
                ? `Next: ${formatRecordDate(vaccinations.nextDate)}`
                : 'All up to date'
          }
        />

        <SummaryTile
          label="Upcoming vet visits"
          value={visits.count}
          icon={CalendarClock}
          detail={visits.nextDate ? `Next: ${formatRecordDate(visits.nextDate)}` : 'None scheduled'}
        />

        <SummaryTile
          label="Records last 30 days"
          value={recent.count}
          icon={FileText}
          detail={
            recent.latest
              ? `Latest: ${recent.latest.horseName}, ${formatRecordDate(recent.latest.date)}`
              : 'Nothing recorded yet'
          }
        />
      </ul>
    </section>
  );
}
