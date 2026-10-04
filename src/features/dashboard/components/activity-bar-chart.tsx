'use client';

import { cn } from '@/lib/cn';
import { useLocale, useTranslations } from '@/i18n';
import { calendarDayDifference, formatWeekdayLong, formatWeekdayShort } from '../format';
import { axisCeiling, axisTicks, barPercent } from '../chart-scale';
import type { ActivityDay } from '../types';

interface ActivityBarChartProps {
  days: ActivityDay[];
  /** Snapshot time, used to mark which bar is today. */
  referenceIso: string;
  /** Names the measure for assistive tech, e.g. "Sessions logged per day". */
  caption: string;
}

/**
 * A single-series bar chart in plain HTML/CSS — a chart library would be
 * heavier than this whole feature.
 *
 * Accessibility: the drawing is hidden from assistive tech and replaced by a
 * real data table, so screen-reader users get exact values instead of a
 * picture. Sighted users never need hover, because every bar carries its value,
 * and "today" is marked by a label as well as a colour.
 *
 * RTL: the grid uses logical `start`/`end` positioning (not fixed left/right),
 * so in Arabic the value axis sits on the reading-start edge and the day grid
 * — a native CSS grid — reorders itself the same way text does: oldest day at
 * the start (visually the right, in RTL), today at the end.
 */
export function ActivityBarChart({ days, referenceIso, caption }: ActivityBarChartProps) {
  const t = useTranslations();
  const { locale } = useLocale();
  const reference = new Date(referenceIso);
  const ceiling = axisCeiling(Math.max(...days.map((day) => day.sessions)));
  const ticks = axisTicks(ceiling);

  const columns = days.map((day) => {
    const isToday = calendarDayDifference(new Date(day.date), reference) === 0;
    return {
      ...day,
      isToday,
      percent: barPercent(day.sessions, ceiling),
      shortLabel: isToday ? t.dashboard.relativeDay.today : formatWeekdayShort(day.date, locale),
      longLabel: isToday
        ? `${formatWeekdayLong(day.date, locale)} (${t.dashboard.relativeDay.today.toLowerCase()})`
        : formatWeekdayLong(day.date, locale),
    };
  });

  return (
    <figure className="flex flex-1 flex-col">
      <figcaption className="sr-only">{caption}</figcaption>

      <table className="sr-only">
        <caption>{caption}</caption>
        <thead>
          <tr>
            <th scope="col">{t.dashboard.activity.dayColumnHeader}</th>
            <th scope="col">{t.dashboard.activity.sessionsColumnHeader}</th>
          </tr>
        </thead>
        <tbody>
          {columns.map((column) => (
            <tr key={column.date}>
              <th scope="row">{column.longLabel}</th>
              <td>{column.sessions}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div aria-hidden="true" className="flex flex-1 flex-col">
        {/* Plot area: gridlines and bars are positioned against this box. */}
        <div className="relative min-h-44 flex-1 ps-8">
          {ticks.map((tick) => (
            <div
              key={tick}
              className={cn(
                'absolute start-8 end-0 border-t',
                tick === 0 ? 'border-stone-300' : 'border-stone-200',
              )}
              style={{ bottom: `${barPercent(tick, ceiling)}%` }}
            >
              <span className="absolute -start-8 -top-2 w-6 text-end text-xs leading-4 text-stone-600 tabular-nums">
                {tick}
              </span>
            </div>
          ))}

          <ol className="absolute inset-y-0 start-8 end-0 grid grid-cols-7 gap-1.5 sm:gap-3">
            {columns.map((column) => (
              <li key={column.date} className="relative">
                <span
                  className={cn(
                    'absolute inset-x-0 text-center text-xs leading-4 tabular-nums',
                    column.isToday ? 'font-semibold' : 'text-stone-600',
                  )}
                  style={{ bottom: `calc(${column.percent}% + 4px)` }}
                >
                  {column.sessions}
                </span>
                <span
                  className={cn(
                    'absolute inset-x-0 bottom-0 mx-auto w-full max-w-8 rounded-t-sm transition-[height] duration-500 ease-out motion-reduce:transition-none sm:max-w-12',
                    column.isToday ? 'bg-brass-400' : 'bg-forest-600',
                  )}
                  style={{ height: `${column.percent}%` }}
                />
              </li>
            ))}
          </ol>
        </div>

        <ul className="mt-2 grid grid-cols-7 gap-1.5 ps-8 sm:gap-3">
          {columns.map((column) => (
            <li
              key={column.date}
              className={cn(
                'text-center text-xs whitespace-nowrap',
                column.isToday ? 'font-semibold' : 'text-stone-600',
              )}
            >
              {column.shortLabel}
            </li>
          ))}
        </ul>
      </div>
    </figure>
  );
}
