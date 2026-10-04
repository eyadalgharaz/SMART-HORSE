import { cn } from '@/lib/cn';

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export function Avatar({ name, className }: { name: string; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'bg-pasture-100 text-pasture-700 flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
        className,
      )}
    >
      {initials(name)}
    </span>
  );
}
