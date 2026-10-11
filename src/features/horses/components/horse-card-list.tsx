'use client';

import Link from 'next/link';
import { useGenderLabel, useHorseName, useI18n } from '@/i18n';
import { formatAge } from '../format';
import type { Horse } from '../types';
import { HorsePhoto } from './horse-photo';
import { HorseStatusBadge } from './horse-status-badge';

/**
 * The horse list on narrow screens. Identity first — picture, name, then the
 * details in the order someone scanning a yard list needs them.
 *
 * Each card has exactly one link, the horse's name, stretched over the card so
 * the whole tile is tappable. That keeps the touch target large without turning
 * a block of text into a button with an unreadable accessible name.
 */
export function HorseCardList({ horses }: { horses: Horse[] }) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:hidden">
      {horses.map((horse) => (
        <HorseCard key={horse.id} horse={horse} />
      ))}
    </ul>
  );
}

function HorseCard({ horse }: { horse: Horse }) {
  const { t, tc, locale } = useI18n();
  const displayName = useHorseName(horse.name);
  const genderLabel = useGenderLabel(horse.gender);

  return (
    <li className="rounded-card focus-within:outline-pasture-500 relative border border-stone-200 bg-white p-4 focus-within:outline-2 focus-within:outline-offset-2">
      <div className="flex items-start gap-3">
        <HorsePhoto name={displayName} src={horse.imageUrl} size="md" />

        <div className="min-w-0 flex-1">
          <h3 className="truncate font-medium">
            <Link href={`/horses/${horse.id}`} className="after:absolute after:inset-0">
              {displayName}
            </Link>
          </h3>
          <p className="truncate text-sm text-stone-600">
            {tc(horse.breed)} · {genderLabel} · {formatAge(horse.birthDate, undefined, locale)}
          </p>
          <p className="mt-2">
            <HorseStatusBadge status={horse.status} />
          </p>
        </div>
      </div>

      <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-1 border-t border-stone-200 pt-3 text-sm">
        <div className="flex min-w-0 gap-1.5">
          <dt className="text-stone-600">{t.horses.colorLabel}</dt>
          <dd className="truncate font-medium">{tc(horse.color)}</dd>
        </div>
        <div className="flex min-w-0 gap-1.5">
          <dt className="text-stone-600">{t.horses.ownerLabel}</dt>
          <dd className="truncate font-medium">
            {horse.owner ? tc(horse.owner.name) : t.horses.unassigned}
          </dd>
        </div>
      </dl>
    </li>
  );
}
