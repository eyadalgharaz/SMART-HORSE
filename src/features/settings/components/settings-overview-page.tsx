'use client';

import Link from 'next/link';
import { Building2, ChevronRight, ShieldCheck, User, Users } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { useTranslations, type Dictionary } from '@/i18n';

/**
 * Container for /settings: a landing page that names the four things a
 * person can manage here and links straight to each. Every card is a real
 * route from the moment it renders — there is nothing partially built behind
 * it to hide.
 */

const SECTIONS: {
  href: string;
  icon: typeof Building2;
  key: keyof Dictionary['settings']['sections'];
}[] = [
  { href: '/settings/farm', icon: Building2, key: 'farm' },
  { href: '/settings/team', icon: Users, key: 'team' },
  { href: '/settings/roles', icon: ShieldCheck, key: 'roles' },
  { href: '/settings/account', icon: User, key: 'account' },
];

export function SettingsOverviewPage() {
  const t = useTranslations();
  return (
    <>
      <PageHeader title={t.pages.settings.title} description={t.pages.settings.description} />

      <ul className="grid gap-4 sm:grid-cols-2">
        {SECTIONS.map((section) => {
          const Icon = section.icon;
          const copy = t.settings.sections[section.key];
          return (
            <li key={section.href}>
              <Link
                href={section.href}
                className="rounded-card hover:border-pasture-500 hover:bg-pasture-50 group flex h-full items-start gap-3 border border-stone-200 bg-white p-4 transition-colors sm:p-5"
              >
                <span className="bg-pasture-50 text-pasture-600 flex size-10 shrink-0 items-center justify-center rounded-md group-hover:bg-white">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold">{copy.title}</span>
                  <span className="mt-1 block text-sm text-stone-600">{copy.description}</span>
                </span>
                <ChevronRight
                  className="mt-1 size-4 shrink-0 text-stone-400 group-hover:text-stone-600 rtl:rotate-180"
                  aria-hidden="true"
                />
              </Link>
            </li>
          );
        })}
      </ul>
    </>
  );
}
