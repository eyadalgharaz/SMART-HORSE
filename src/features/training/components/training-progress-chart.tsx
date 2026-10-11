'use client';

import { cn } from '@/lib/cn';
import { axisCeiling, axisTicks, barPercent } from '@/features/dashboard/chart-scale';
import { useI18n } from '@/i18n';
import { formatShortDate } from '../format';
import type { ProgressPoint } from '../format';

interface TrainingProgressChartProps {
  points: ProgressPoint[];
  /** Which metric to plot. */
  metric: 'distanceKm' | 'avgSpeedKmh';
  /** Names the measure for assistive tech, e.g. "Distance per session, most recent ten sessions". */
  caption: string;
  /** Shown after each value, e.g. "km" or "km/h". */
  unit: string;
}

/**
 * A single-series bar chart in plain HTML/CSS, following the same recipe as
 * the Dashboard's activity chart — a chart library would be heavier than
 * this whole feature, and reusing the pattern keeps the two modules visually
 * consistent.
 *
 * RTL: the value axis uses logical `start`/`end` positioning, so in Arabic it
 * sits on the reading-start (right) edge, and the session grid — a native CSS
 * grid — flows in reading order: oldest session first, most recent last.
 *
 * Accessibility: the drawing is hidden from assistive tech and replaced by a
 * real data table, so screen-reader users get exact values instead of a
 * picture.
 */
export function TrainingProgressChart({
  points,
  metric,
  caption,
  unit,
}: TrainingProgressChartProps) {
  const { t, locale } = useI18n();
  const values = points.map((point) => point[metric] ?? 0);
  const ceiling = axisCeiling(Math.max(...values, 0), metric === 'distanceKm' ? 4 : 5);
  const ticks = axisTicks(ceiling);

  const columns = points.map((point) => {
    const value = point[metric] ?? 0;
    return {
      ...point,
      value,
      percent: barPercent(value, ceiling),
      shortLabel: formatShortDate(point.date, locale),
    };
  });

  return (
    <figure className="flex flex-col">
      <figcaption className="sr-only">{caption}</figcaption>

      <table className="sr-only">
        <caption>{caption}</caption>
        <thead>
          <tr>
            <th scope="col">{t.training.chart.sessionDate}</th>
            <th scope="col">{t.training.chart.value(unit)}</th>
          </tr>
        </thead>
        <tbody>
          {columns.map((column) => (
            <tr key={column.sessionId}>
              <th scope="row">{column.shortLabel}</th>
              <td>{column.value.toFixed(1)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div aria-hidden="true" className="flex flex-col">
        <div className="relative min-h-36 ps-9">
          {ticks.map((tick) => (
            <div
              key={tick}
              className={cn(
                'absolute start-9 end-0 border-t',
                tick === 0 ? 'border-stone-300' : 'border-stone-200',
              )}
              style={{ bottom: `${barPercent(tick, ceiling)}%` }}
            >
              <span className="absolute -start-9 -top-2 w-7 text-end text-xs leading-4 text-stone-600 tabular-nums">
                {tick}
              </span>
            </div>
          ))}

          <ol
            className="absolute inset-y-0 start-9 end-0 grid gap-1.5 sm:gap-2"
            style={{
              gridTemplateColumns: `repeat(${Math.max(columns.length, 1)}, minmax(0, 1fr))`,
            }}
          >
            {columns.map((column) => (
              <li key={column.sessionId} className="relative">
                <span
                  className="absolute inset-x-0 text-center text-xs leading-4 text-stone-600 tabular-nums"
                  style={{ bottom: `calc(${column.percent}% + 4px)` }}
                >
                  {column.value > 0 ? column.value.toFixed(1) : ''}
                </span>
                <span
                  className="bg-pasture-500 absolute inset-x-0 bottom-0 mx-auto w-full max-w-8 rounded-t-sm sm:max-w-10"
                  style={{ height: `${column.percent}%` }}
                />
              </li>
            ))}
          </ol>
        </div>

        <ol
          className="mt-2 grid gap-1.5 ps-9 sm:gap-2"
          style={{ gridTemplateColumns: `repeat(${Math.max(columns.length, 1)}, minmax(0, 1fr))` }}
        >
          {columns.map((column) => (
            <li
              key={column.sessionId}
              className="text-center text-xs whitespace-nowrap text-stone-600"
            >
              {column.shortLabel}
            </li>
          ))}
        </ol>
      </div>
    </figure>
  );
}
