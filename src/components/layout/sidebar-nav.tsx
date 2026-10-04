'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/cn';
import { navigation } from '@/config/navigation';
import { useTranslations } from '@/i18n';

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const t = useTranslations();

  return (
    <nav aria-label={t.shell.mainNav} className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
      {navigation.map((section, index) => (
        <div key={section.heading ?? `section-${index}`}>
          {section.heading ? (
            <h2 className="mb-1.5 px-3 text-xs font-medium text-white/60">
              {t.shell.sections[section.heading]}
            </h2>
          ) : null}
          <ul className="space-y-0.5">
            {section.items.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'flex items-center gap-3 rounded-md border-s-2 px-3 py-2 text-sm transition-colors',
                      active
                        ? 'border-bay-400 bg-white/10 font-medium text-white'
                        : 'border-transparent text-white/70 hover:bg-white/5 hover:text-white',
                    )}
                  >
                    <Icon className="size-4 shrink-0" aria-hidden="true" />
                    <span className="truncate">{t.shell.nav[item.key]}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
