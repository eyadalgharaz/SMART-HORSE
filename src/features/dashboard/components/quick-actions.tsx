'use client';

import Link from 'next/link';
import { Bell, Plus } from 'lucide-react';
import { useTranslations } from '@/i18n';
import { fadeInUp, hoverLift } from './layout';

/**
 * Shortcuts into existing routes only — no new or placeholder pages. Kept to
 * three: the two generic "create" entry points that exist without picking a
 * horse first (`/horses/new`, `/tasks/new`), plus the Notifications list.
 * Training/Medical "add" routes require a horseId in the path
 * (`/training/horses/:id/new`), so there is no single generic URL for them to
 * link to here without inventing one.
 */
const ACTIONS = [
  { key: 'addHorse', href: '/horses/new', icon: Plus },
  { key: 'addTask', href: '/tasks/new', icon: Plus },
  { key: 'viewNotifications', href: '/notifications', icon: Bell },
] as const;

export function QuickActions() {
  const t = useTranslations();

  return (
    <section aria-labelledby="dashboard-quick-actions-heading" className={fadeInUp}>
      <h2 id="dashboard-quick-actions-heading" className="mb-2 text-sm font-medium text-stone-600">
        {t.dashboard.quickActions.sectionTitle}
      </h2>
      <ul className="flex flex-wrap gap-2.5">
        {ACTIONS.map(({ key, href, icon: Icon }) => (
          <li key={key}>
            <Link
              href={href}
              className={`text-ink inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-medium ${hoverLift}`}
            >
              <Icon className="text-forest-600 size-4" aria-hidden="true" />
              {t.dashboard.quickActions[key]}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
