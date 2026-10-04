import { cn } from '@/lib/cn';

/**
 * Wordmark with a horseshoe glyph — an open arc with two heel points.
 * The only decorative element in the product; everything else stays plain.
 */
export function Brand({ className, tone = 'ink' }: { className?: string; tone?: 'ink' | 'light' }) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <svg viewBox="0 0 24 24" className="size-6" aria-hidden="true" fill="none">
        <path
          d="M6.2 20.5V15a5.8 5.8 0 1 1 11.6 0v5.5"
          stroke="var(--color-bay-500)"
          strokeWidth="2.6"
          strokeLinecap="round"
        />
        <circle cx="6.2" cy="20.5" r="1.4" fill="var(--color-bay-500)" />
        <circle cx="17.8" cy="20.5" r="1.4" fill="var(--color-bay-500)" />
      </svg>
      <span
        className={cn(
          'text-[15px] font-semibold tracking-tight',
          tone === 'light' ? 'text-white' : 'text-ink',
        )}
      >
        SmartHorse
      </span>
    </div>
  );
}
