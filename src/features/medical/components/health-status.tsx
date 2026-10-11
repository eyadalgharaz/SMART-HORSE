'use client';

import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { useI18n } from '@/i18n';
import { formatRelativeDay } from '../format';
import type { HorseHealth } from '../types';
import { MedicalStatusBadge } from './medical-status-badge';

/**
 * A horse's health status as shown on its medical profile.
 *
 * These statuses are entered by a person and stored as they were entered. They
 * are not a prediction and not a score: SmartHorse does not analyse health in
 * this phase, and the card says so by attributing the status to the last time
 * someone set it rather than to the system.
 */
export function HealthStatusCard({ health }: { health: HorseHealth | null }) {
  const { t, tc, locale } = useI18n();

  return (
    <Card className="flex h-full flex-col">
      <CardHeader title={t.medical.healthCard.title} headingLevel={3} />
      <CardBody className="flex flex-1 flex-col gap-2">
        {health ? (
          <>
            <div>
              <MedicalStatusBadge status={health.status} />
            </div>
            {health.note ? <p className="text-sm">{tc(health.note)}</p> : null}
            <p className="mt-auto text-sm text-stone-600">
              {t.medical.healthCard.setWhen(formatRelativeDay(health.updatedAt, undefined, locale))}
            </p>
          </>
        ) : (
          <p className="text-sm text-stone-600">{t.medical.healthCard.none}</p>
        )}
      </CardBody>
    </Card>
  );
}
