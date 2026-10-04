import { cn } from '@/lib/cn';

/** Decorative by default; give it a label when it is the only thing on screen. */
export function Spinner({ className, label }: { className?: string; label?: string }) {
  return (
    <span
      role={label ? 'status' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={cn(
        'inline-block size-5 animate-spin rounded-full border-2 border-current border-t-transparent',
        className,
      )}
    />
  );
}
