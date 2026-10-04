import type { LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { ChevronRight, ClipboardList, Dumbbell, FolderOpen, Stethoscope } from 'lucide-react';
import { Card, CardBody, CardHeader } from '@/components/ui/card';

/**
 * The profile is designed to become a horse's whole record, so it says which
 * records belong to it and which have arrived.
 *
 * Health, Training and Tasks are delivered, so those rows are real links to
 * the horse's medical history, training profile and its tasks (pre-filtered
 * to this horse). The rest stay deliberately inert: no counts, no sample rows
 * and nothing to click, because a number that is not real or a button that
 * goes nowhere costs more trust than an honest placeholder saves.
 */
const planned: { label: string; icon: LucideIcon }[] = [
  { label: 'Files and documents', icon: FolderOpen },
];

export function HorseFutureRecords({ horseId }: { horseId: string }) {
  return (
    <Card>
      <CardHeader
        title="Records"
        description="These attach to the horse as each module is delivered."
        headingLevel={3}
      />
      <CardBody>
        <ul className="grid gap-2 sm:grid-cols-2">
          <li>
            <Link
              href={`/medical/horses/${horseId}`}
              className="hover:border-pasture-500 hover:bg-pasture-50 flex items-center gap-2.5 rounded-md border border-stone-200 px-3 py-2.5 text-sm"
            >
              <Stethoscope className="text-pasture-600 size-4 shrink-0" aria-hidden="true" />
              <span className="text-ink-soft font-medium">Health records</span>
              <ChevronRight
                className="ms-auto size-4 shrink-0 text-stone-500 rtl:rotate-180"
                aria-hidden="true"
              />
            </Link>
          </li>

          <li>
            <Link
              href={`/training/horses/${horseId}`}
              className="hover:border-pasture-500 hover:bg-pasture-50 flex items-center gap-2.5 rounded-md border border-stone-200 px-3 py-2.5 text-sm"
            >
              <Dumbbell className="text-pasture-600 size-4 shrink-0" aria-hidden="true" />
              <span className="text-ink-soft font-medium">Training records</span>
              <ChevronRight
                className="ms-auto size-4 shrink-0 text-stone-500 rtl:rotate-180"
                aria-hidden="true"
              />
            </Link>
          </li>

          <li>
            <Link
              href={`/tasks?horseId=${horseId}`}
              className="hover:border-pasture-500 hover:bg-pasture-50 flex items-center gap-2.5 rounded-md border border-stone-200 px-3 py-2.5 text-sm"
            >
              <ClipboardList className="text-pasture-600 size-4 shrink-0" aria-hidden="true" />
              <span className="text-ink-soft font-medium">Tasks</span>
              <ChevronRight
                className="ms-auto size-4 shrink-0 text-stone-500 rtl:rotate-180"
                aria-hidden="true"
              />
            </Link>
          </li>

          {planned.map(({ label, icon: Icon }) => (
            <li
              key={label}
              className="flex items-center gap-2.5 rounded-md border border-dashed border-stone-300 px-3 py-2.5 text-sm text-stone-600"
            >
              <Icon className="size-4 shrink-0 text-stone-500" aria-hidden="true" />
              <span className="text-ink-soft font-medium">{label}</span>
              <span className="ml-auto text-xs whitespace-nowrap">Not yet available</span>
            </li>
          ))}
        </ul>
      </CardBody>
    </Card>
  );
}
