import { cn } from '@/lib/cn';

/**
 * Placeholder block for content that is still loading. Purely decorative: the
 * region that contains skeletons announces the loading state, not the blocks.
 * Motion is switched off globally by the reduced-motion rule in globals.css.
 */
export function Skeleton({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn('block animate-pulse rounded-md bg-stone-200', className)}
    />
  );
}
