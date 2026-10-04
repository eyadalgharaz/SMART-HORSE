'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface DropdownProps {
  /** Rendered inside the trigger button. */
  trigger: ReactNode;
  triggerLabel: string;
  children: (close: () => void) => ReactNode;
  className?: string;
}

/** Click-outside / Escape dismissible menu. Items are plain buttons or links. */
export function Dropdown({ trigger, triggerLabel, children, className }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: MouseEvent) {
      if (!container.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <div ref={container} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={triggerLabel}
        onClick={() => setOpen((value) => !value)}
        className="flex items-center gap-2 rounded-md px-1.5 py-1 hover:bg-stone-100"
      >
        {trigger}
      </button>
      {open ? (
        <div
          role="menu"
          className={cn(
            'absolute end-0 z-30 mt-1 w-56 rounded-md border border-stone-200 bg-white py-1 shadow-sm',
            className,
          )}
        >
          {children(() => setOpen(false))}
        </div>
      ) : null}
    </div>
  );
}
