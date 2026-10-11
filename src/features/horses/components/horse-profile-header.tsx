'use client';

import { Pencil } from 'lucide-react';
import { ButtonLink } from '@/components/ui/button';
import { useGenderLabel, useHorseName, useI18n } from '@/i18n';
import { formatAge } from '../format';
import type { Horse } from '../types';
import { HorsePhoto } from './horse-photo';
import { HorseStatusBadge } from './horse-status-badge';

/**
 * Identity band at the top of a horse's record: who this is, in one glance, and
 * the one action that belongs to the whole record. Kept short on purpose — the
 * name is the focus and the details start immediately below it.
 */
export function HorseProfileHeader({ horse }: { horse: Horse }) {
  const { t, tc, locale } = useI18n();
  const displayName = useHorseName(horse.name);
  const genderLabel = useGenderLabel(horse.gender);

  return (
    <div className="rounded-card border border-stone-200 bg-white p-4 sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <HorsePhoto name={displayName} src={horse.imageUrl} size="lg" />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <h2 className="text-xl font-semibold break-words sm:text-2xl">{displayName}</h2>
            <HorseStatusBadge status={horse.status} />
          </div>
          <p className="mt-1 text-stone-600">{tc(horse.breed)}</p>
          <p className="text-stone-600">
            {genderLabel} · {formatAge(horse.birthDate, undefined, locale)}
          </p>
        </div>

        <ButtonLink
          href={`/horses/${horse.id}/edit`}
          variant="secondary"
          className="self-start sm:self-center"
        >
          <Pencil className="size-4" aria-hidden="true" />
          {t.horses.editHorse}
        </ButtonLink>
      </div>
    </div>
  );
}
