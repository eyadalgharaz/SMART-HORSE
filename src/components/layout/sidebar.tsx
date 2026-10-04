'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useTranslations } from '@/i18n';
import { Brand } from './brand';
import { SidebarNav } from './sidebar-nav';

interface SidebarProps {
  /** Mobile drawer state. The desktop sidebar is always visible. */
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const t = useTranslations();

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }
    if (open) document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  return (
    <>
      {/* Desktop: a permanent column. */}
      <aside className="bg-ink hidden w-60 shrink-0 flex-col lg:flex">
        <div className="flex h-14 items-center border-b border-white/10 px-5">
          <Brand tone="light" />
        </div>
        <SidebarNav />
      </aside>

      {/* Mobile: an overlay drawer. */}
      <div
        className={cn('bg-ink/50 fixed inset-0 z-40 lg:hidden', open ? 'block' : 'hidden')}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        id="sh-sidebar"
        aria-label={t.shell.mainNav}
        aria-hidden={!open}
        // Off-screen is not hidden from the keyboard: `inert` keeps the closed
        // drawer's links out of the tab order until it is opened.
        inert={!open}
        className={cn(
          'bg-ink fixed inset-y-0 start-0 z-50 flex w-64 flex-col transition-transform duration-200 lg:hidden',
          // Slides in from the same edge the drawer sits on in both
          // directions: off-screen towards the start edge when closed.
          open ? 'translate-x-0' : 'ltr:-translate-x-full rtl:translate-x-full',
        )}
      >
        <div className="flex h-14 items-center justify-between border-b border-white/10 ps-5 pe-2">
          <Brand tone="light" />
          <button
            type="button"
            onClick={onClose}
            className="flex size-9 items-center justify-center rounded-md text-white/70 hover:bg-white/10 hover:text-white"
          >
            <X className="size-5" aria-hidden="true" />
            <span className="sr-only">{t.shell.closeNavigation}</span>
          </button>
        </div>
        <SidebarNav onNavigate={onClose} />
      </aside>
    </>
  );
}
