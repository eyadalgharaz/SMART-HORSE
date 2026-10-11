import { cn } from '@/lib/cn';

const ARABIC = /[\u0600-\u06FF]/;

function initials(name: string): string {
  // Arabic letters join, so two initials would fuse into a syllable; a single
  // letter is the conventional Arabic monogram.
  if (ARABIC.test(name)) return name.trim().charAt(0);
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
