/**
 * Two-column rows share one definition so the columns line up from row to row:
 * equal halves on large screens, a 3:2 split once the sidebar leaves room
 * (`xl`), and a single stacked column below `lg`. `minmax(0, …)` lets long
 * content shrink instead of forcing horizontal scroll.
 */
export const twoColumnGrid =
  'grid items-stretch gap-4 sm:gap-5 lg:grid-cols-2 xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]';

/**
 * Entrance motion for dashboard cards/panels (Phase J): a short fade-and-rise,
 * applied only within `motion-safe:` so `prefers-reduced-motion: reduce`
 * renders everything in its final place with no animation. Combine with a
 * `staggerDelay(index)` class for a staggered group.
 */
export const fadeInUp =
  'motion-safe:opacity-0 motion-safe:animate-[sh-fade-up_0.45s_ease-out_forwards] motion-reduce:opacity-100';

const STAGGER_DELAYS = ['delay-0', 'delay-75', 'delay-150', 'delay-200', 'delay-300', 'delay-500'];

/** A `motion-safe:delay-*` class for the Nth item in a staggered entrance group. */
export function staggerDelay(index: number): string {
  const step = STAGGER_DELAYS[Math.min(index, STAGGER_DELAYS.length - 1)];
  return `motion-safe:${step}`;
}

/** Subtle hover elevation for interactive cards — never the only cue for anything clickable. */
export const hoverLift =
  'transition duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md motion-reduce:hover:translate-y-0';
