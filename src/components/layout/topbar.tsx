'use client';

import { Menu } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Avatar } from '@/components/ui/avatar';
import { Dropdown } from '@/components/ui/dropdown';
import { useAuth } from '@/features/auth/auth-provider';
import { useTranslations } from '@/i18n';
import { useRoleLabel } from '@/i18n/roles';
import { NotificationBell } from '@/features/notifications/components/notification-bell';
import { LanguageSwitcher } from './language-switcher';

export function Topbar({ onOpenSidebar, title }: { onOpenSidebar: () => void; title: string }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const t = useTranslations();
  const roleLabel = useRoleLabel(user?.farmRole ?? 'FarmOwner');

  async function handleSignOut() {
    await logout();
    router.replace('/login');
  }

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-stone-200 bg-white px-3 sm:px-5">
      <button
        type="button"
        onClick={onOpenSidebar}
        aria-controls="sh-sidebar"
        className="text-ink-soft flex size-9 items-center justify-center rounded-md hover:bg-stone-100 lg:hidden"
      >
        <Menu className="size-5" aria-hidden="true" />
        <span className="sr-only">{t.shell.openNavigation}</span>
      </button>

      <h1 className="truncate text-sm font-semibold">{title}</h1>

      <div className="ms-auto flex items-center gap-2">
        <LanguageSwitcher />
        <NotificationBell />
        <Dropdown
          triggerLabel={t.common.accountMenu}
          trigger={
            <>
              <Avatar name={user?.fullName ?? 'SmartHorse user'} />
              <span className="hidden text-sm sm:inline">{user?.fullName}</span>
            </>
          }
        >
          {() => (
            <>
              <div className="border-b border-stone-200 px-3 pt-1 pb-2">
                <p className="truncate text-sm font-medium">{user?.fullName}</p>
                <p className="truncate text-xs text-stone-600">{user?.email}</p>
                {user?.farmRole ? <p className="mt-1 text-xs text-stone-600">{roleLabel}</p> : null}
              </div>
              <button
                type="button"
                role="menuitem"
                onClick={handleSignOut}
                className="w-full px-3 py-2 text-start text-sm hover:bg-stone-100"
              >
                {t.common.signOut}
              </button>
            </>
          )}
        </Dropdown>
      </div>
    </header>
  );
}
