'use client';

import { useCallback, useEffect, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useTranslations } from '@/i18n';

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  /** Optional line under the title, e.g. the horse and date a record belongs to. */
  description?: string;
  /** Controls aligned along the bottom of the panel. */
  footer?: ReactNode;
  children: ReactNode;
  className?: string;
}

/**
 * A dialog over the page. The first one in SmartHorse, added for the medical
 * record detail: the records list and the timeline both need to show a whole
 * record without losing the reader's place in a long list, which a navigation
 * away and back would.
 *
 * Built from a plain element rather than `<dialog>` so behaviour is identical
 * in every browser and in jsdom. It does what a modal has to do to be usable
 * with a keyboard: focus moves in on open, Tab is trapped inside, Escape and
 * the backdrop close it, and focus returns to whatever opened it.
 *
 * On phones it sits at the bottom of the screen as a sheet and can grow to most
 * of the viewport; from `sm` up it is centred.
 */
export function Modal({
  open,
  onClose,
  title,
  description,
  footer,
  children,
  className,
}: ModalProps) {
  const panel = useRef<HTMLDivElement>(null);
  const titleId = useRef(`modal-title-${Math.random().toString(36).slice(2, 9)}`).current;
  const descriptionId = `${titleId}-description`;
  const t = useTranslations();

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onClose();
        return;
      }
      if (event.key !== 'Tab' || !panel.current) return;

      const focusable = [...panel.current.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
        (element) => element.offsetParent !== null || element === document.activeElement,
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) {
        event.preventDefault();
        return;
      }

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    },
    [onClose],
  );

  useEffect(() => {
    if (!open) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);

    // Focus the panel itself rather than the first control, so a screen reader
    // reads the dialog's title before anything inside it.
    panel.current?.focus();

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = overflow;
      previouslyFocused?.focus?.();
    };
  }, [open, handleKeyDown]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <div className="bg-ink/40 absolute inset-0" onClick={onClose} aria-hidden="true" />

      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        className={cn(
          'rounded-card relative flex max-h-[90dvh] w-full flex-col bg-white shadow-lg outline-none',
          'rounded-b-none sm:max-w-2xl sm:rounded-b-[var(--radius-card)]',
          className,
        )}
      >
        <header className="flex items-start gap-3 border-b border-stone-200 px-4 py-4 sm:px-5">
          <div className="min-w-0 flex-1">
            <h2 id={titleId} className="text-base font-semibold break-words">
              {title}
            </h2>
            {description ? (
              <p id={descriptionId} className="mt-0.5 text-sm text-stone-600">
                {description}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-ink-soft -me-1.5 -mt-1 flex size-9 shrink-0 items-center justify-center rounded-md hover:bg-stone-100"
          >
            <X className="size-5" aria-hidden="true" />
            <span className="sr-only">{t.common.close}</span>
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5">{children}</div>

        {footer ? (
          <footer className="flex flex-wrap justify-end gap-2 border-t border-stone-200 px-4 py-3 sm:px-5">
            {footer}
          </footer>
        ) : null}
      </div>
    </div>
  );
}
