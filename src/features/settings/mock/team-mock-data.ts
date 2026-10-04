import type { FarmRole } from '@/features/auth/types';
import type { TeamMember } from '../types';
import type { TeamMemberStatus } from '../vocabulary';

/**
 * Realistic sample team members for the same farm the other modules manage.
 * A few names deliberately echo the trainers and assignees already seeded in
 * Training and Tasks (Farida, Omar, Salma, Tarek, Yara, Mostafa, Hoda) — the
 * same people wearing the hat a trainer or assignee reference already gives
 * them elsewhere, which is what makes one farm feel like one farm. This file
 * does not import or reference those modules, though: Training and Tasks
 * intentionally keep their own lightweight `{ id, name }` references rather
 * than pointing at a real membership record, and Team Members does not
 * change that.
 *
 * The signed-in account itself is never one of these rows — see
 * `mock-account-service.ts` for why Account reads the live session instead.
 *
 * This file is fake data only — nothing here implies a backend exists.
 */

function daysAgo(days: number): string {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

function hoursAgo(hours: number): string {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
}

interface MemberSpec {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  role: FarmRole;
  status: TeamMemberStatus;
  joinedDaysAgo: number;
  lastActiveHoursAgo: number | null;
}

const MEMBER_SPECS: MemberSpec[] = [
  {
    id: 'team-farida',
    fullName: 'Farida El-Sayed',
    email: 'farida.elsayed@greenvalleyfarm.example',
    phone: '+20 100 555 0111',
    role: 'Trainer',
    status: 'active',
    joinedDaysAgo: 420,
    lastActiveHoursAgo: 2,
  },
  {
    id: 'team-omar',
    fullName: 'Omar Khalil',
    email: 'omar.khalil@greenvalleyfarm.example',
    phone: '+20 100 555 0112',
    role: 'Trainer',
    status: 'active',
    joinedDaysAgo: 380,
    lastActiveHoursAgo: 26,
  },
  {
    id: 'team-mona',
    fullName: 'Mona Reda',
    email: 'mona.reda@greenvalleyfarm.example',
    phone: null,
    role: 'Trainer',
    status: 'active',
    joinedDaysAgo: 200,
    lastActiveHoursAgo: 6,
  },
  {
    id: 'team-salma',
    fullName: 'Salma Youssef',
    email: 'salma.youssef@greenvalleyfarm.example',
    phone: '+20 100 555 0113',
    role: 'Doctor',
    status: 'active',
    joinedDaysAgo: 500,
    lastActiveHoursAgo: 5,
  },
  {
    id: 'team-tarek',
    fullName: 'Tarek Nassar',
    email: 'tarek.nassar@greenvalleyfarm.example',
    phone: '+20 100 555 0114',
    role: 'StableManager',
    status: 'active',
    joinedDaysAgo: 600,
    lastActiveHoursAgo: 1,
  },
  {
    id: 'team-yara',
    fullName: 'Yara Mostafa',
    email: 'yara.mostafa@greenvalleyfarm.example',
    phone: null,
    role: 'Worker',
    status: 'active',
    joinedDaysAgo: 150,
    lastActiveHoursAgo: 3,
  },
  {
    id: 'team-mostafa',
    fullName: 'Mostafa Adel',
    email: 'mostafa.adel@greenvalleyfarm.example',
    phone: '+20 100 555 0115',
    role: 'Worker',
    status: 'active',
    joinedDaysAgo: 90,
    lastActiveHoursAgo: 27,
  },
  {
    id: 'team-hoda',
    fullName: 'Hoda Kamal',
    email: 'hoda.kamal@greenvalleyfarm.example',
    phone: null,
    role: 'Worker',
    status: 'invited',
    joinedDaysAgo: 4,
    lastActiveHoursAgo: null,
  },
  {
    id: 'team-dina',
    fullName: 'Dina Farouk',
    email: 'dina.farouk@greenvalleyfarm.example',
    phone: null,
    role: 'Doctor',
    status: 'invited',
    joinedDaysAgo: 1,
    lastActiveHoursAgo: null,
  },
  {
    id: 'team-karim',
    fullName: 'Karim Abdallah',
    email: 'karim.abdallah@greenvalleyfarm.example',
    phone: '+20 100 555 0116',
    role: 'StableManager',
    status: 'suspended',
    joinedDaysAgo: 300,
    lastActiveHoursAgo: 25 * 24,
  },
];

export function buildTeamMemberMocks(): TeamMember[] {
  return MEMBER_SPECS.map((spec) => ({
    id: spec.id,
    fullName: spec.fullName,
    email: spec.email,
    phone: spec.phone,
    role: spec.role,
    status: spec.status,
    joinedAt: daysAgo(spec.joinedDaysAgo),
    lastActiveAt: spec.lastActiveHoursAgo === null ? null : hoursAgo(spec.lastActiveHoursAgo),
  }));
}
