'use client';

import { useId, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { useI18n, useRoleDescription, useRoleLabel } from '@/i18n';
import { cn } from '@/lib/cn';
import type { Role } from '../types';

const ACCESS_TONE: Record<Role['permissions'][number]['access'], string> = {
  Full: 'text-pasture-700',
  Manage: 'text-ink-soft',
  'View only': 'text-stone-600',
  None: 'text-stone-400',
};

/**
 * One role, its description and member count up front, with its full
 * permission summary tucked behind a native disclosure toggle. Five roles
 * with eight areas each would be a wall of text if always open; expanding on
 * demand is what "clicking a role opens a detailed view" means here, without
 * a second dialog or route for something this short.
 */
export function RoleCard({ role, memberCount }: { role: Role; memberCount: number }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const { t } = useI18n();
  const r = t.settings.roles;
  // The role's name and description come from the shared, localized role
  // vocabulary (keyed by the role id), not the service's English strings.
  const name = useRoleLabel(role.id);
  const description = useRoleDescription(role.id);

  return (
    <Card>
      <CardHeader
        title={name}
        description={description}
        headingLevel={3}
        action={
          <span className="rounded-full bg-stone-100 px-2.5 py-1 text-xs font-medium text-stone-700 tabular-nums">
            {r.members(memberCount)}
          </span>
        }
      />
      <CardBody>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((value) => !value)}
          className="text-pasture-600 flex items-center gap-1.5 text-sm font-medium"
        >
          <ChevronDown
            className={cn('size-4 transition-transform', open && 'rotate-180')}
            aria-hidden="true"
          />
          {open ? r.hidePermissions : r.showPermissions}
        </button>

        {open ? (
          <dl
            id={panelId}
            className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 border-t border-stone-200 pt-3 sm:grid-cols-4"
          >
            {role.permissions.map((permission) => (
              <div key={permission.area}>
                <dt className="text-sm text-stone-600">
                  {t.settings.areas[permission.area] ?? permission.area}
                </dt>
                <dd className={cn('text-sm font-medium', ACCESS_TONE[permission.access])}>
                  {t.settings.access[permission.access] ?? permission.access}
                </dd>
              </div>
            ))}
          </dl>
        ) : null}
      </CardBody>
    </Card>
  );
}
