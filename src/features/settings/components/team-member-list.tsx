'use client';

import { Avatar } from '@/components/ui/avatar';
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
  return (
    <>
      <div className="rounded-card hidden overflow-hidden border border-stone-200 bg-white lg:block">
        <table className="w-full border-collapse text-left">
          <caption className="sr-only">Team members</caption>
          <thead>
            <tr className="border-b border-stone-200 text-sm text-stone-600">
              <th scope="col" className="px-5 py-3 font-medium">
                Member
              </th>
              <th scope="col" className="px-3 py-3 font-medium">
                Email
              </th>
              <th scope="col" className="px-3 py-3 font-medium">
                Role
              </th>
              <th scope="col" className="px-3 py-3 font-medium">
                Status
              </th>
              <th scope="col" className="hidden px-3 py-3 font-medium xl:table-cell">
                Joined
              </th>
              <th scope="col" className="px-5 py-3 text-right font-medium">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-200">
            {members.map((member) => (
              <tr key={member.id} className="hover:bg-stone-50">
                <td className="px-5 py-3 align-middle">
                  <div className="flex items-center gap-3">
                    <Avatar name={member.fullName} className="size-8 shrink-0 text-sm" />
                    <span className="font-medium">{member.fullName}</span>
                  </div>
                </td>
                <td className="px-3 py-3 align-middle text-stone-600">{member.email}</td>
                <td className="px-3 py-3 align-middle">
                  <FarmRoleBadge role={member.role} />
                </td>
                <td className="px-3 py-3 align-middle">
                  <TeamMemberStatusBadge status={member.status} />
                </td>
                <td className="hidden px-3 py-3 align-middle whitespace-nowrap xl:table-cell">
                  {formatSettingsDate(member.joinedAt)}
                </td>
                <td className="px-5 py-3 text-right align-middle">
                  <button
                    type="button"
                    onClick={() => onSelect(member)}
                    className="text-pasture-600 hover:text-pasture-700 -my-1 rounded-md px-1.5 py-1.5 text-sm font-medium hover:underline"
                  >
                    View
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
              className="rounded-card block w-full border border-stone-200 bg-white p-4 text-left"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar name={member.fullName} className="size-9 shrink-0" />
                  <div className="min-w-0">
                    <p className="truncate font-medium">{member.fullName}</p>
                    <p className="truncate text-sm text-stone-600">{member.email}</p>
                  </div>
                </div>
                <TeamMemberStatusBadge status={member.status} />
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 border-t border-stone-200 pt-3 text-sm text-stone-600">
                <FarmRoleBadge role={member.role} />
                <span>Last active {formatLastActive(member.lastActiveAt)}</span>
              </div>
            </button>
          </li>
        ))}
      </ul>
    </>
  );
}
