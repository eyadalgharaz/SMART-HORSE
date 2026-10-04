import { Card, CardBody, CardHeader } from '@/components/ui/card';
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
  return (
    <Card className="flex h-full flex-col">
      <CardHeader title="Health status" headingLevel={3} />
      <CardBody className="flex flex-1 flex-col gap-2">
        {health ? (
          <>
            <div>
              <MedicalStatusBadge status={health.status} />
            </div>
            {health.note ? <p className="text-sm">{health.note}</p> : null}
            <p className="mt-auto text-sm text-stone-600">
              Set {formatRelativeDay(health.updatedAt).toLowerCase()}
            </p>
          </>
        ) : (
          <p className="text-sm text-stone-600">
            No health status has been recorded for this horse yet.
          </p>
        )}
      </CardBody>
    </Card>
  );
}
