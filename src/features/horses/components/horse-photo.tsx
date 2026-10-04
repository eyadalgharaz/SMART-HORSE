'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/cn';

type Size = 'sm' | 'md' | 'lg';

const sizes: Record<Size, string> = {
  sm: 'size-10 rounded-md text-sm',
  md: 'size-14 rounded-md text-base',
  lg: 'size-24 rounded-card text-2xl sm:size-28',
};

function monogram(name: string): string {
  return name.trim().charAt(0).toUpperCase() || '?';
}

/**
 * A horse's picture, or its initial when there is none. The fallback also takes
 * over when an image fails to load, so a broken or missing file never leaves a
 * hole in the layout — the list stays usable with no images at all.
 *
 * `next/image` is deliberately not used: these are local mock illustrations and
 * later the source will be a user upload of unknown dimensions, so there is
 * nothing for the optimiser to do.
 *
 * The alt text is empty on purpose. The horse's name is always rendered beside
 * the picture, so describing it again would only repeat the row for a screen
 * reader (WCAG 1.1.1, decorative image).
 */
export function HorsePhoto({
  name,
  src,
  size = 'sm',
  className,
}: {
  name: string;
  src: string | null;
  size?: Size;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  useEffect(() => setFailed(false), [src]);

  const shape = cn('shrink-0 overflow-hidden bg-stone-100', sizes[size], className);

  if (!src || failed) {
    return (
      <span
        aria-hidden="true"
        className={cn(
          shape,
          'text-pasture-700 bg-pasture-50 flex items-center justify-center font-semibold',
        )}
      >
        {monogram(name)}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- see note above.
    <img
      src={src}
      alt=""
      loading="lazy"
      onError={() => setFailed(true)}
      className={cn(shape, 'object-cover')}
    />
  );
}
