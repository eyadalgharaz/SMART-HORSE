'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Building2, ShieldCheck, User, Users } from 'lucide-react';
import { useTranslations, type Dictionary } from '@/i18n';
import { cn } from '@/lib/cn';

const SECTIONS: {
  href: string;
  key: keyof Dictionary['settings']['sections'];
  icon: typeof Building2;
}[] = [
  { href: '/settings/farm', key: 'farm', icon: Building2 },
  { href: '/settings/team', key: 'team', icon: Users },
  { href: '/settings/roles', key: 'roles', icon: ShieldCheck },
  { href: '/settings/account', key: 'account', icon: User },
];

/**
 * The section navigation every Settings subpage shares, on the reading-start
 * side (left in English, right in Arabic). A plain list of links rather than
 * tabs: each section is its own route with its own data, not a view over one
 * shared payload, so a link is the honest affordance.
 *
 * Collapses to a horizontal scroller below `lg` rather than stacking
 * vertically above the content, so a narrow screen never has to scroll past
 * the whole nav before reaching the page it opened.
 */
export function SettingsNav() {
  const pathname = usePathname();
  const t = useTranslations();

  return (
    <nav aria-label={t.settings.navLabel}>
      <ul className="flex gap-1 overflow-x-auto border-b border-stone-200 pb-px lg:block lg:space-y-1 lg:border-b-0 lg:pb-0">
        {SECTIONS.map((section) => {
          const active = pathname?.startsWith(section.href) ?? false;
          const Icon = section.icon;
          return (
            <li key={section.href} className="shrink-0 lg:shrink">
              <Link
                href={section.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex items-center gap-2.5 rounded-md px-3 py-2.5 text-sm font-medium whitespace-nowrap transition-colors lg:whitespace-normal',
                  active ? 'bg-pasture-50 text-pasture-700' : 'text-ink-soft hover:bg-stone-100',
                )}
              >
                <Icon className="size-4 shrink-0" aria-hidden="true" />
                {t.settings.sections[section.key].title}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
