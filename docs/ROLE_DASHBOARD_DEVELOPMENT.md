# SmartHorse Role Dashboard Development Guide

This document exists so a developer can open this repository — with no other
context from anyone — and immediately know which role dashboard they're
building, where their code belongs, and how it fits into the rest of
SmartHorse. If you were just handed a ZIP of this project and told "you're
building the Doctor dashboard," start here.

This is a **frontend-only, mock-data project**. There is no backend yet. See
[§11](#11-backend-boundary).

---

## 1. Project architecture

```
App (Next.js App Router)
    ↓
Role Dashboard        (features/dashboards/<role>/)
    ↓
Shared Business Features   (features/horses, medical, training, tasks, notifications, settings)
    ↓
Shared UI / infrastructure (components/ui, components/layout)
```

The dependency direction only ever points **downward**. A role dashboard may
import a shared business feature; a shared business feature must never import
a role dashboard. See [§7](#7-dependency-rules).

## 2. Roles

The five official, user-facing SmartHorse roles are:

- Farm Owner
- Stable Manager
- Trainer
- Worker
- Doctor

These come from **exactly one place**: `src/features/auth/roles.ts`
(`FarmRole`, `farmRoleLabels`, `farmRoleDescriptions`, `farmRoleValues`,
`farmRoleOptions`, plus the `hasRole`/`hasAnyRole` UX helpers). Nothing in
this guide, and nothing you write, should define a second list of roles.

## 3. Where each role lives

| Role           | Your folder                           | Route                       |
| -------------- | ------------------------------------- | --------------------------- |
| Farm Owner     | `features/dashboards/farm-owner/`     | `/dashboard/farm-owner`     |
| Stable Manager | `features/dashboards/stable-manager/` | `/dashboard/stable-manager` |
| Trainer        | `features/dashboards/trainer/`        | `/dashboard/trainer`        |
| Worker         | `features/dashboards/worker/`         | `/dashboard/worker`         |
| Doctor         | `features/dashboards/doctor/`         | `/dashboard/doctor`         |

**Naming note — read this before you get confused:** `features/dashboard/`
(singular) already existed before this architecture and is the Phase B
farm-wide overview (horses/tasks/health/activity at a glance). It is a
**shared business feature**, not a role folder — Farm Owner's and Stable
Manager's dashboards currently consume it (see below). `features/dashboards/`
(**plural**) is where the five role folders from this guide live. They are
different directories with a one-letter difference in the name; keep them
straight.

**Current state of each role folder**, so you know what you're walking into:

- **Trainer, Worker, Doctor** — placeholder only. A single container
  component rendering "`<Role>` Dashboard — ready for implementation." This
  is genuinely unbuilt; it's yours to design.
- **Farm Owner, Stable Manager** — their container component currently just
  renders the existing shared `DashboardPage` from `features/dashboard/`
  (Phase B). That view already covers what these two management roles need
  day one, so it was wired up rather than duplicated. If Farm Owner or
  Stable Manager needs something the shared overview doesn't provide, extend
  it inside your own role folder (e.g. render the shared `DashboardPage`
  plus additional owner-only panels next to it) rather than forking a copy
  of it.

## 4. What a role developer MAY modify

**MAY modify freely:**

```
features/dashboards/<your-role>/**
```

**MAY add inside your folder:**

- your dashboard container/page component
- widgets, cards, tables, charts specific to your role
- hooks
- types
- mock data
- a service seam (interface + mock implementation), if your role needs data
  that doesn't fit an existing shared feature
- tests
- role-specific formatting/helper functions

You do not need anyone's permission to add files inside your own role
folder, and no other developer's role folder should ever need to change
because of something you did in yours.

## 5. What you should NOT modify (unless necessary and coordinated)

- `features/auth/roles.ts` — the role model. If you think a role is missing
  a capability, that's a product conversation, not a dashboard change.
- `features/dashboards/routes.ts` — the route registry. All five roles are
  already registered; you shouldn't need to touch this file at all.
- `features/dashboards/components/dashboard-role-redirect.tsx` — the
  `/dashboard` entry point.
- Shared business features (`features/horses`, `features/medical`,
  `features/training`, `features/tasks`, `features/notifications`,
  `features/settings`) — consume them, don't fork them (see §6).
- Shared UI (`components/ui/`, `components/layout/`)
- App routing outside your own `app/(app)/dashboard/<your-role>/page.tsx`
- The global layout (`app/(app)/layout.tsx`, `app/layout.tsx`)
- Other role dashboards — `features/dashboards/<another-role>/`
- `package.json`
- Global styling (`src/app/globals.css`, the design tokens)
- Existing database/API contracts (there are none yet — see §11)

If a change here genuinely seems necessary, raise it with whoever is
coordinating the parallel work before making it. A change to any of these
files affects every other role developer.

## 6. Shared feature usage

Role dashboards should **consume**, not duplicate:

- `features/horses`
- `features/medical`
- `features/training`
- `features/tasks`
- `features/notifications`
- `features/settings`

Each already exposes a service seam and hooks (e.g. `useHorses()`,
`useHorseSessions()`, `useTasks()`) — call those from your dashboard the same
way the existing feature pages do. Do **not** create, for example,
`features/dashboards/doctor/medical/` — the Doctor dashboard imports from
`features/medical`, it doesn't reimplement it.

## 7. Dependency rules

**Allowed:**

```
Trainer Dashboard   → Training, Horses, Tasks
Doctor Dashboard     → Medical, Horses, Tasks
Worker Dashboard     → Tasks, Horses
Farm Owner Dashboard → Dashboard (shared overview), any shared feature
Stable Manager Dashboard → Dashboard (shared overview), any shared feature
```

**Not allowed:**

```
Medical  → Doctor Dashboard      (shared feature must never import a role dashboard)
Training → Trainer Dashboard
Doctor Dashboard  → Trainer Dashboard   (no role dashboard imports another)
Trainer Dashboard → Doctor Dashboard
```

If you find yourself wanting to import from another role's folder, the thing
you need probably belongs in a shared feature instead — surface that as a
question rather than importing across the boundary.

## 8. Mock-data rules

You may create role-specific mock data inside your own dashboard folder
(e.g. `features/dashboards/trainer/mock/`) for anything that isn't already
covered by a shared feature's existing mock data. Don't duplicate mock data
a shared feature already provides — call its hooks and use what it returns.

## 9. Git / branch strategy

One branch per role, touching only that role's folder:

```
feature/trainer-dashboard        → features/dashboards/trainer/**  and app/(app)/dashboard/trainer/**
feature/doctor-dashboard         → features/dashboards/doctor/**   and app/(app)/dashboard/doctor/**
feature/worker-dashboard         → features/dashboards/worker/**  and app/(app)/dashboard/worker/**
feature/farm-owner-dashboard     → features/dashboards/farm-owner/**  and app/(app)/dashboard/farm-owner/**
feature/stable-manager-dashboard → features/dashboards/stable-manager/**  and app/(app)/dashboard/stable-manager/**
```

Because each role's files live in their own folder and no two roles' folders
overlap, two developers working on different roles should produce **zero
merge conflicts** against each other, even working at the same time.

## 10. Integration process

1. Build inside your role folder.
2. Add/update tests for your role (`tests/dashboards/` or a folder mirroring
   your feature, following the project's existing test conventions).
3. Run `npm test`.
4. Run `npm run typecheck`.
5. Run `npm run lint`.
6. Run `npm run format:check`.
7. Run `npm run build`.
8. Submit a PR touching only your role's files (plus, if genuinely
   necessary, a small addition to a shared feature — flag this clearly in
   the PR description).
9. Integrate the role dashboard.
10. Only then resolve any shared-file changes, with whoever owns that shared
    area.

## 11. Backend boundary

This project is still **frontend/mock-only**. There is no backend, no
database, no real API, no JWT, and no real authentication or authorization.

Role dashboards must not implement backend authentication or authorization.
When the backend eventually arrives, the path is the same one every existing
feature already follows:

```
UI → hooks → service interface → mock implementation (today) → HTTP implementation (later) → backend
```

**The frontend role model is not a security boundary.** `hasRole`/
`hasAnyRole` (from `features/auth/roles.ts`) and the `/dashboard/<role>`
routing in this architecture are UX/visibility conveniences — they decide
what a user _sees_, never what they're _allowed to do_. Real authorization
will be enforced by the backend once it exists (see the Security note in the
project README).

---

## The Role Dashboard Contract

`src/features/dashboards/types.ts` defines `RoleDashboardContext` — a small,
documented type describing what every role dashboard container can assume
about its environment. It isn't passed as a prop (your container reads
`useAuth()` directly, the same as every other authenticated page in this
app) — it exists so the assumption is written down rather than tribal
knowledge:

- By the time your dashboard renders, `useAuth().user` is guaranteed
  non-null. `RequireAuth` (Phase A) already keeps signed-out visitors out of
  the whole authenticated app, and `/dashboard`'s role redirect only ever
  sends a signed-in user to their own role's route.
- `user.farmRole` matches your role — a Trainer's dashboard is only ever
  reached by a user whose `farmRole` is `'Trainer'`.

## How you're reached (for reference — you shouldn't need to touch this)

```
/dashboard                       (features/dashboards/components/dashboard-role-redirect.tsx)
    reads useAuth().user.farmRole
    ↓
roleDashboardPath(farmRole)      (features/dashboards/routes.ts)
    ↓
router.replace('/dashboard/<your-role>')
    ↓
app/(app)/dashboard/<your-role>/page.tsx
    ↓
your dashboard container component
```
