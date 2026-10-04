import type { LucideIcon } from 'lucide-react';
import {
  Bell,
  ClipboardList,
  Dumbbell,
  Fence,
  LayoutDashboard,
  Settings,
  Stethoscope,
} from 'lucide-react';

export interface NavItem {
  /** Matches a key under `shell.nav` in the i18n dictionaries — the label shown is looked up from there, not from this file. */
  key: 'dashboard' | 'horses' | 'health' | 'training' | 'tasks' | 'notifications' | 'settings';
  href: string;
  icon: LucideIcon;
  /** Backend module that will own this area (Module Specifications v1.0 §3). */
  module: string;
}

export interface NavSection {
  /** Matches a key under `shell.sections`, or null to render without a heading. */
  heading: 'stable' | 'account' | null;
  items: NavItem[];
}

/**
 * Hrefs and the backend module mapping use the approved domain vocabulary, so
 * the medical area routes to /medical while its nav key is "health" (Module
 * Specifications v1.0 §3). The visible label for each item — in every
 * language — comes from `shell.nav.<key>` in `src/i18n/dictionaries/`, not
 * from a `label` field here, so there is exactly one place that owns nav
 * wording per language.
 *
 * Marketplace and a standalone Reports area are deliberately absent: the
 * Commercial MVP places Marketplace out of V1 scope, and reporting sits inside
 * the read-only Dashboard module. Adding either needs a product decision.
 */
export const navigation: NavSection[] = [
  {
    heading: null,
    items: [{ key: 'dashboard', href: '/dashboard', icon: LayoutDashboard, module: 'Dashboard' }],
  },
  {
    heading: 'stable',
    items: [
      { key: 'horses', href: '/horses', icon: Fence, module: 'Horses' },
      { key: 'health', href: '/medical', icon: Stethoscope, module: 'Health' },
      { key: 'training', href: '/training', icon: Dumbbell, module: 'Training' },
      { key: 'tasks', href: '/tasks', icon: ClipboardList, module: 'Tasks' },
    ],
  },
  {
    heading: 'account',
    items: [
      { key: 'notifications', href: '/notifications', icon: Bell, module: 'Notifications' },
      { key: 'settings', href: '/settings', icon: Settings, module: 'Farms / Identity' },
    ],
  },
];

export const navItems: NavItem[] = navigation.flatMap((section) => section.items);
