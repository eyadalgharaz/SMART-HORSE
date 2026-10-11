'use client';

import Link from 'next/link';
import { useI18n } from '@/i18n';
import { formatSessionDate } from '../format';
import type { TrainingProgram } from '../types';
import { TrainingProgramStatusBadge } from './training-status-badge';

/**
 * The programs view: one card per program. Programs are far fewer than
 * sessions and each carries more prose (goals, notes), so a card list reads
 * better here than a dense table — and it needs no separate mobile layout.
 */
export function TrainingProgramsList({ programs }: { programs: TrainingProgram[] }) {
  const { t, tc, locale } = useI18n();
  const p = t.training.programs;

  return (
    <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {programs.map((program) => (
        <li key={program.id}>
          <div className="rounded-card flex h-full flex-col border border-stone-200 bg-white p-4 sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-semibold break-words">{tc(program.name)}</h3>
              <TrainingProgramStatusBadge status={program.status} />
            </div>

            <Link
              href={`/training/horses/${program.horseId}`}
              className="hover:text-pasture-600 mt-1 text-sm font-medium hover:underline"
            >
              {tc(program.horseName)}
            </Link>

            {program.description ? (
              <p className="mt-2 text-sm text-stone-600">{tc(program.description)}</p>
            ) : null}

            <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5 text-sm">
              <dt className="text-stone-600">{p.trainer}</dt>
              <dd className="text-end">
                {program.trainerName ? tc(program.trainerName) : t.common.unassigned}
              </dd>
              <dt className="text-stone-600">{p.started}</dt>
              <dd className="text-end">{formatSessionDate(program.startDate, locale)}</dd>
              <dt className="text-stone-600">{p.ends}</dt>
              <dd className="text-end">
                {program.endDate ? formatSessionDate(program.endDate, locale) : p.ongoing}
              </dd>
            </dl>

            {program.goals ? (
              <p className="mt-3 border-t border-stone-200 pt-3 text-sm text-stone-600">
                <span className="text-ink font-medium">{p.goal}</span>
                {tc(program.goals)}
              </p>
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  );
}
