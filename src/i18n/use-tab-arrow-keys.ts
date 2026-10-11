'use client';

import { useCallback, type KeyboardEvent } from 'react';
import { useLocale } from './locale-provider';

/**
 * Arrow-key navigation for a horizontal tab list that follows reading
 * direction: in English → moves to the next tab, in Arabic (RTL) ← does,
 * because the tabs themselves are laid out right-to-left.
 */
export function useTabArrowKeys<T extends string>(
  ids: readonly T[],
  current: T,
  onChange: (id: T) => void,
  focusId: (id: T) => string,
) {
  const { dir } = useLocale();

  return useCallback(
    (event: KeyboardEvent<HTMLElement>) => {
      const forward = dir === 'rtl' ? 'ArrowLeft' : 'ArrowRight';
      const backward = dir === 'rtl' ? 'ArrowRight' : 'ArrowLeft';
      const delta = event.key === forward ? 1 : event.key === backward ? -1 : 0;
      if (delta === 0) return;
      event.preventDefault();
      const index = ids.indexOf(current);
      const next = ids[(index + delta + ids.length) % ids.length];
      if (next !== undefined) {
        onChange(next);
        document.getElementById(focusId(next))?.focus();
      }
    },
    [dir, ids, current, onChange, focusId],
  );
}
