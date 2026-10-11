'use client';

import { Avatar } from '@/components/ui/avatar';
import { useI18n } from '@/i18n';
import { formatLastActive, formatSettingsDate } from '../format';
import type { TeamMember } from '../types';
import { FarmRoleBadge, TeamMemberStatusBadge } from './team-status-badge';

/**
 * The team member list. A table from `lg` up, cards below — the same choice
 * every other list in the app makes. Each row opens the member's detail
 * dialog rather than navigating, so it renders as a button, not a link.
 */
export function TeamMemberList({
  members,
  onSelect,
}: {
  members: TeamMember[];
  onSelect: (member: TeamMember) => void;
}) {
  const { t, tc, locale } = useI18n();
  const tl = t.settings.team;
  const f = t.settings.fields;
  return (
    <>
      <div className="rounded-card hidden overflow-hidden border border-stone-200 bg-white lg:block">
        <table className="w-full border-collapse text-start">
          <caption className="sr-only">{tl.caption}</caption>
          <thead>
            <tr className="border-b border-stone-200 text-sm text-stone-600">
              <th scope="col" className="px-5 py-3 font-medium">
                {tl.member}
              </th>
              <th scope="col" className="px-3 py-3 font-medium">
                {f.email}
              </th>
              <th scope="col" className="px-3 py-3 font-medium">
                {f.role}
              </th>
              <th scope="col" className="px-3 py-3 font-medium">
                {f.status}
              </th>
              <th scope="col" className="hidden px-3 py-3 font-medium xl:table-cell">
                {tl.joined}
              </th>
              <th scope="col" className="px-5 py-3 text-end font-medium">
                <span className="sr-only">{t.common.actions}</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-200">
            {members.map((member) => (
              <tr key={member.id} className="hover:bg-stone-50">
                <td className="px-5 py-3 align-middle">
                  <div className="flex items-center gap-3">
                    <Avatar name={tc(member.fullName)} className="size-8 shrink-0 text-sm" />
                    <span className="font-medium">{tc(member.fullName)}</span>
                  </div>
                </td>
                <td className="px-3 py-3 align-middle text-stone-600">
                  <span dir="ltr">{member.email}</span>
                </td>
                <td className="px-3 py-3 align-middle">
                  <FarmRoleBadge role={member.role} />
                </td>
                <td className="px-3 py-3 align-middle">
                  <TeamMemberStatusBadge status={member.status} />
                </td>
                <td className="hidden px-3 py-3 align-middle whitespace-nowrap xl:table-cell">
                  {formatSettingsDate(member.joinedAt, locale)}
                </td>
                <td className="px-5 py-3 text-end align-middle">
                  <button
                    type="button"
                    onClick={() => onSelect(member)}
                    className="text-pasture-600 hover:text-pasture-700 -my-1 rounded-md px-1.5 py-1.5 text-sm font-medium hover:underline"
                  >
                    {t.common.view}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="grid gap-3 sm:grid-cols-2 lg:hidden">
        {members.map((member) => (
          <li key={member.id}>
            <button
              type="button"
              onClick={() => onSelect(member)}
              className="rounded-card block w-full border border-stone-200 bg-white p-4 text-start"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar name={tc(member.fullName)} className="size-9 shrink-0" />
                  <div className="min-w-0">
                    <p className="truncate font-medium">{tc(member.fullName)}</p>
                    <p className="truncate text-sm text-stone-600" dir="ltr">
                      {member.email}
                    </p>
                  </div>
                </div>
                <TeamMemberStatusBadge status={member.status} />
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 border-t border-stone-200 pt-3 text-sm text-stone-600">
                <FarmRoleBadge role={member.role} />
                <span>
                  {tl.lastActiveWhen(formatLastActive(member.lastActiveAt, undefined, locale))}
                </span>
              </div>
            </button>
          </li>
        ))}
      </ul>
    </>
  );
}
