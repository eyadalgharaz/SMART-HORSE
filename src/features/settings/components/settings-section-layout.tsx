import type { ReactNode } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { SettingsNav } from './settings-nav';

/**
 * The frame every Settings subpage sits in: the shared page header, the
 * section nav, and the page's own content. Kept as a layout component rather
 * than a Next.js route layout because each subpage's header title and
 * description differ and are known only to the page itself.
 */
export function SettingsSectionLayout({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <>
      <PageHeader title={title} description={description} action={action} />
      <div className="grid gap-6 lg:grid-cols-[14rem_1fr]">
        <SettingsNav />
        <div className="min-w-0">{children}</div>
      </div>
    </>
  );
}
