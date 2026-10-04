'use client';

import { useState, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { navItems } from '@/config/navigation';
import { useTranslations } from '@/i18n';
import { Sidebar } from './sidebar';
import { Topbar } from './topbar';

/**
 * Topbar across the top, sidebar on the left in LTR (mirrored to the right
 * in RTL — see Sidebar), scrollable content beside it. Content is capped at
 * max-w-6xl: wide enough for a four-column dashboard row, narrow enough that
 * lines and cards never stretch across a large monitor.
 */
export function AppShell({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const t = useTranslations();
  const current = navItems.find((item) => pathname.startsWith(item.href));

  return (
    <div className="flex min-h-dvh overflow-x-hidden">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          onOpenSidebar={() => setSidebarOpen(true)}
          title={current ? t.shell.nav[current.key] : 'SmartHorse'}
        />
        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
