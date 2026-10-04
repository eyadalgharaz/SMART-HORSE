'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { useGenderLabel, useHorseName, useTranslations } from '@/i18n';
import { formatAge } from '../format';
import type { Horse } from '../types';
import { HorsePhoto } from './horse-photo';
import { HorseStatusBadge } from './horse-status-badge';

/**
 * The horse list on a wide screen. Seven columns is the limit for a list people
 * scan rather than read: identity, the three things they filter by, who holds
 * the record, and the way in. Everything else lives on the profile.
 *
 * Below `lg` this is hidden and the card list takes over — a table that narrow
 * either scrolls sideways or shrinks past readability.
 */
export function HorseTable({ horses }: { horses: Horse[] }) {
  const t = useTranslations();

  return (
    <div className="rounded-card hidden overflow-hidden border border-stone-200 bg-white lg:block">
      <table className="w-full border-collapse text-left">
        <caption className="sr-only">{t.horses.table.caption}</caption>
        <thead>
          <tr className="border-b border-stone-200 text-sm text-stone-600">
            <th scope="col" className="px-5 py-3 font-medium">
              {t.horses.table.horse}
            </th>
            <th scope="col" className="px-3 py-3 font-medium">
              {t.horses.table.breed}
            </th>
            <th scope="col" className="px-3 py-3 font-medium">
              {t.horses.table.gender}
            </th>
            <th scope="col" className="px-3 py-3 font-medium">
              {t.horses.table.age}
            </th>
            <th scope="col" className="hidden px-3 py-3 font-medium xl:table-cell">
              {t.horses.table.owner}
            </th>
            <th scope="col" className="px-3 py-3 font-medium">
              {t.horses.table.status}
            </th>
            <th scope="col" className="px-5 py-3 text-end font-medium">
              <span className="sr-only">{t.horses.table.actions}</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-200">
          {horses.map((horse) => (
            <HorseRow key={horse.id} horse={horse} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function HorseRow({ horse }: { horse: Horse }) {
  const t = useTranslations();
  const displayName = useHorseName(horse.name);
  const genderLabel = useGenderLabel(horse.gender);

  return (
    <tr className="hover:bg-stone-50">
      <th scope="row" className="px-5 py-3 font-normal">
        <span className="flex items-center gap-3">
          <HorsePhoto name={displayName} src={horse.imageUrl} />
          <span className="min-w-0">
            <Link
              href={`/horses/${horse.id}`}
              className="hover:text-pasture-600 block truncate font-medium"
            >
              {displayName}
            </Link>
            <span className="block truncate text-sm text-stone-600">{horse.color}</span>
          </span>
        </span>
      </th>
      <td className="px-3 py-3">{horse.breed}</td>
      <td className="px-3 py-3">{genderLabel}</td>
      <td className="px-3 py-3 whitespace-nowrap">{formatAge(horse.birthDate)}</td>
      <td className="hidden px-3 py-3 xl:table-cell">
        {horse.owner ? (
          horse.owner.name
        ) : (
          <span className="text-stone-500 italic">{t.horses.unassigned}</span>
        )}
      </td>
      <td className="px-3 py-3">
        <HorseStatusBadge status={horse.status} />
      </td>
      <td className="px-5 py-3 text-end">
        <Link
          href={`/horses/${horse.id}`}
          aria-label={t.horses.table.viewHorse(displayName)}
          className="text-pasture-500 hover:text-pasture-700 -my-1 inline-flex items-center gap-0.5 rounded-md px-1.5 py-1.5 text-sm font-medium hover:underline"
        >
          <span>{t.horses.view}</span>
          <ChevronRight className="size-4 rtl:rotate-180" aria-hidden="true" />
        </Link>
      </td>
    </tr>
  );
}
