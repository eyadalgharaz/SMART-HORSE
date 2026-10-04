import type { LucideIcon } from 'lucide-react';
import { CircleCheck } from 'lucide-react';

/**
 * Empty state for one dashboard panel. Deliberately quiet — an empty panel is
 * usually good news ("you're all caught up"), so it must not look like an error.
 */
export function SectionEmpty({
  title,
  description,
  icon: Icon = CircleCheck,
}: {
  title: string;
  description: string;
  icon?: LucideIcon;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-10 text-center">
      <span className="bg-pasture-50 text-pasture-600 flex size-10 items-center justify-center rounded-full">
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <p className="mt-3 font-medium">{title}</p>
      <p className="mt-1 max-w-sm text-sm text-stone-600">{description}</p>
    </div>
  );
}
