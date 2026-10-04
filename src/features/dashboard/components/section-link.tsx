'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { useTranslations } from '@/i18n';

/**
 * "View all" link for a panel header. The visible text stays short
 * (`sectionLink.viewAll`); `label` is the full accessible name for this
 * specific panel ("View all tasks" / "عرض كل المهام") so several identical
 * links stay distinguishable and read naturally in either language — simple
 * English-style concatenation ("View all" + "tasks") doesn't produce correct
 * Arabic word order, so each panel supplies its own complete phrase instead.
 */
export function SectionLink({ href, label }: { href: string; label: string }) {
  const t = useTranslations();

  return (
    <Link
      href={href}
      aria-label={label}
      className="text-pasture-500 hover:text-pasture-700 -my-1.5 -me-1.5 inline-flex items-center gap-0.5 rounded-md px-1.5 py-1.5 text-sm font-medium hover:underline"
    >
      <span>{t.dashboard.sectionLink.viewAll}</span>
      <ChevronRight className="size-4 rtl:rotate-180" aria-hidden="true" />
    </Link>
  );
}
