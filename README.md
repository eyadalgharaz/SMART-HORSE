# SmartHorse Web

Primary V1 client for SmartHorse, per Architecture v1.0 §2 and Implementation Plan v1.0 §7.

**Stack:** Next.js 15 (App Router) · TypeScript (strict) · Tailwind CSS 4 · TanStack Query · Zod · Vitest + Testing Library · ESLint + Prettier

## Phase status

- **Phase A** — foundation, application shell, authentication UI.
- **Phase B** — the Dashboard, built on mock data.
- **Phase C** — Horse Management (list, profile, add, edit), built on mock data.
- **Phase D** — Health / Medical (records, timeline, vaccinations, upcoming
  events), built on mock data.
- **Phase E** — Training Management (programs, sessions, results, performance),
  built on mock data.
- **Phase F** — Tasks & Notifications (daily stable/farm work, a notification
  center, and a topbar bell), built on mock data.
- **Phase G** — Farms, Team & Roles + real Settings (Farm Profile, Team
  Members, Roles & Permissions, Account), built on mock data.
- **Phase H** — Authentication & Role-Based Frontend UX: explicit role
  selection at registration, the official five-role model, and a small
  role-aware UI foundation (`hasRole`/`hasAnyRole`), still entirely mock.
- **Phase I** — Role Dashboard Architecture: `/dashboard` is now a role-aware
  entry point that sends each signed-in user to their own dashboard route
  (`/dashboard/farm-owner`, `/dashboard/stable-manager`, `/dashboard/trainer`,
  `/dashboard/worker`, `/dashboard/doctor`). This phase is architecture
  preparation only — Trainer, Worker and Doctor are placeholders, ready for
  independent development. See
  [`docs/ROLE_DASHBOARD_DEVELOPMENT.md`](docs/ROLE_DASHBOARD_DEVELOPMENT.md).
- **Phase J** — Internationalization: a language switcher (EN / العربية) in
  the topbar switches the whole app, including a full RTL layout, with the
  choice persisted in `localStorage`. The application shell, all four
  authentication screens, role labels everywhere they appear, and the
  top-of-page content of every main feature route are localized with
  professionally-written Arabic, not literal translation.
- **Phase J (continued)** — The Dashboard specifically is now **completely**
  bilingual, including its mock data (task types, statuses, weekday names,
  relative dates, notification wording, and a curated set of demo horse
  names) — not just its static chrome — and has a full visual redesign: a
  new forest/sand/brass colour direction, a richer hero, a "Smart Actions"
  automation panel, Quick Actions, and tasteful `prefers-reduced-motion`-aware
  entrance/hover motion. See "Internationalization (Arabic / RTL)" and
  "Dashboard redesign" below.
- **Phase J (Horses)** — The Horses module (list, filters, table, cards,
  profile) is now fully localized too, including a **centralized, app-wide
  horse-name map** (`src/i18n/horse-names.ts`) with genuinely Arabic demo
  names for the full 24-horse roster (e.g. "Luna" displays as "ليلى", not a
  transliteration) — shared by the Dashboard, so the same horse has the same
  Arabic name everywhere it appears. Gender and status vocabulary
  (`src/i18n/horses.ts`) follows the same pattern already proven for farm
  roles. This is the template the remaining feature modules (Medical,
  Training, Tasks, Notifications, Settings/Team/Roles) should follow next —
  see the limitations note in "Internationalization" below for what's not
  covered yet.
- **Arabic localization (complete)** — Health, Training, Tasks,
  Notifications and every Settings page are now fully bilingual too, mock
  content, validation messages, toasts, charts and accessibility labels
  included. See "Internationalization (Arabic / RTL)".

Every other business module route is still a placeholder. There is no backend,
no API client and no business logic in this package.

## Run it locally

```bash
cd src/web/smarthorse-web
npm install
npm run dev          # http://localhost:3000
```

Other commands:

```bash
npm run build        # production build
npm run lint         # eslint
npm run format       # prettier --write .
npm run typecheck    # tsc --noEmit
npm test             # vitest run
```

## Reviewing the authentication screens

Authentication is mocked in the browser (`src/features/auth/mock/`). Any email
with a password of 8+ characters signs you in. Two reserved addresses exist so
the error states can be reviewed:

| Input                           | Screen             | Result                   |
| ------------------------------- | ------------------ | ------------------------ |
| `locked@smarthorse.test`        | Sign in            | account-locked error     |
| `taken@smarthorse.test`         | Create account     | email-already-used error |
| `/reset-password?token=expired` | Set a new password | expired-link error       |

Registration asks for a Role alongside the other fields, presented as five
selectable cards (icon, label, one-line description, a clear selected state
that never relies on colour alone). Choosing a role is required. The account
is created and signed in immediately — Register does not redirect to Login
first — and the chosen role travels with the new session from that point on,
matching how the rest of the app already treats a signed-in user's identity.

**Role persistence across a login is a small, deliberate mock extension.**
Beyond the session itself, the mock auth layer now also keeps a lightweight
"account directory" in `localStorage` (`smarthorse.mock-accounts`) purely so
that logging out and back in with a registered email still returns that
account's chosen role, name and a "this email is already registered" check —
without it, a role picked at registration would be forgotten the moment the
session ended. Any email that was never registered can still sign in as a
lightweight demo account exactly as before this phase (defaulting to Farm
Owner) — this directory is not a real user database, has no real password
storage, and disappears with the rest of the mock.

Sign out from the account menu in the topbar, which also shows the signed-in
person's name and role label.

## Reviewing the Dashboard

`/dashboard` is the role-aware entry point (see "Role dashboard architecture"
below) — it detects the signed-in user's role and redirects to
`/dashboard/<role>`. Farm Owner and Stable Manager land on the existing
farm-wide overview built in Phase B (`src/features/dashboard/mock/`). Dates
are generated relative to the current time, so "Today", "Tomorrow" and "10
minutes ago" are always true. Append a switch to `/dashboard` (it's preserved
across the redirect) to review the other states — or append it directly to
`/dashboard/farm-owner` or `/dashboard/stable-manager`:

| URL                     | State                                            |
| ----------------------- | ------------------------------------------------ |
| `/dashboard`            | normal data                                      |
| `/dashboard?mock=slow`  | loading skeleton (request takes about 4 seconds) |
| `/dashboard?mock=error` | error state with "Try again"                     |
| `/dashboard?mock=empty` | a farm with no data: every panel's empty state   |

These switches live only in the mock service and disappear with it.

## Role dashboard architecture

As of Phase I, every signed-in user's role decides which dashboard they see:

```
/dashboard  →  reads the session's farmRole  →  /dashboard/<role-slug>
```

| Role           | Route                       | Status                              |
| -------------- | --------------------------- | ----------------------------------- |
| Farm Owner     | `/dashboard/farm-owner`     | the existing Phase B farm overview  |
| Stable Manager | `/dashboard/stable-manager` | the existing Phase B farm overview  |
| Trainer        | `/dashboard/trainer`        | placeholder — ready for development |
| Worker         | `/dashboard/worker`         | placeholder — ready for development |
| Doctor         | `/dashboard/doctor`         | placeholder — ready for development |

Each role's dashboard lives in its own folder,
`src/features/dashboards/<role>/`, with no dependency between role folders
and no dependency from a shared business feature back into a role dashboard.
This lets different developers build different role dashboards in parallel
without touching each other's files or the shared application.

**Full guide for anyone building a role dashboard:**
[`docs/ROLE_DASHBOARD_DEVELOPMENT.md`](docs/ROLE_DASHBOARD_DEVELOPMENT.md) —
what you own, what you must not touch, how shared features are consumed, git
strategy, and the integration process.

This is architecture preparation only: routing and folder ownership are in
place, but Trainer, Worker and Doctor have no real dashboard content yet.
Still frontend/mock-only — see "The farm role model" and the Security note
below for what that means for authorization.

## Internationalization (Arabic / RTL)

A language switcher (`EN` / `العربية`) sits in the topbar and is available on
every authenticated and authentication page. Switching language:

- Sets `<html dir lang>` at the root, putting the **entire app** into RTL —
  not a per-page toggle.
- Takes effect immediately, with no page reload, and persists to
  `localStorage` (`smarthorse.locale`) across navigation and refresh.
- A tiny inline script in `app/layout.tsx` applies the saved `lang`/`dir`
  before first paint, so a returning Arabic user never sees the layout flip
  from LTR to RTL. Text strings still hydrate from the English server render
  for a moment; that brief English flash is the remaining trade-off of a
  backend-free, `localStorage`-based preference.
- The browser tab title follows the active language
  (`components/layout/document-title.tsx`).
- Requires no backend, same as every other preference in this app today.

**Architecture** (`src/i18n/`):

- `dictionaries/en.ts` is canonical; `dictionaries/ar.ts` is typed against it
  (`ar: Dictionary`), so a missing Arabic key is a TypeScript error, not a
  blank string or a silent English fallback at runtime.
- `locale-provider.tsx` exposes `useLocale()` (current locale, `setLocale`,
  resolved `dir`) and `useTranslations()` (the active locale's full, typed
  dictionary — components read `t.shell.nav.dashboard`, not a string key).
- `roles.ts` adds `useRoleLabel`/`useRoleDescription`/`useRoleOptions`,
  reading localized wording for the same five `FarmRole` identifiers defined
  in `features/auth/roles.ts`. **The identifiers themselves — `FarmOwner`,
  `StableManager`, `Trainer`, `Worker`, `Doctor` — and the canonical English
  `farmRoleLabels`/`farmRoleDescriptions`/`farmRoleOptions` are untouched.**
  Only their displayed wording is now locale-aware, and only at the specific
  places in the UI that call these new hooks.
- No new dependency: this is a small custom React Context, not an i18n
  library — the project didn't need one for two locales and a page count
  this size.

**Arabic wording is written per screen, not translated sentence-by-sentence**
("Health" reads as "الصحة", not a literal rendering of "Medical"); see the
comment at the top of `dictionaries/ar.ts`.

**RTL implementation:** logical CSS properties and Tailwind's built-in
`rtl:`/`ltr:` variants are used instead of hard-coded `left`/`right` wherever
a shared layout component needed it — the mobile sidebar drawer slides in
from the correct edge in both directions, the active-nav-item indicator uses
`border-s-2` (inline-start) instead of a fixed side, dropdown/menu positioning
uses `end-0` instead of `right-0`, and every back/forward chevron icon found
across the app mirrors with `rtl:rotate-180`.

**Coverage: every route is localized**, in both languages: auth screens, shell,
all role dashboards, Horses, Health (Medical), Training, Tasks, Notifications
and every Settings page (Account, Farm, Team, Roles & Permissions), including
their forms, tables, filters, tabs, empty/error/loading states, toasts and
success messages, badges, chart labels, `aria-label`s and placeholders.

How the rest fits together (all under `src/i18n/`):

- **Module dictionaries** — `dictionaries/modules/{medical,training,tasks,
notifications,settings}.{en,ar}.ts` are merged into the main dictionary;
  `tests/i18n/dictionary-shape.test.ts` still guarantees `en`/`ar` key parity.
- **Pluralization & interpolation** — dictionary entries can be functions
  (`count(n)`, `belongsTo(name)`); Arabic uses `arabicPlural()` (built on
  `Intl.PluralRules('ar')`) for zero/one/two/few/many forms.
- **Dates & numbers** — `format.ts` (`formatDate`, `formatClockTime`,
  `formatDecimal`…) and `relative.ts` ("in 3 days", "2 weeks ago"). English
  output is byte-for-byte what it was (`en-GB`); Arabic uses `ar-u-nu-latn`
  (Arabic month names, Latin digits). Each feature's `format.ts` takes an
  optional `locale` that defaults to `'en'`.
- **Demo content** — the mock data stays English (it is the "database"); its
  Arabic display text lives in `content/ar/*.ts` and is applied at render time
  via `useI18n().tc`. IDs, enums and stored values never change. Edit forms use
  `restoreSource()` so an untouched, translated field saves its original stored
  value. `tests/i18n/content-coverage.test.ts` fails if a mock string gains no
  Arabic translation.
- **System messages** — Zod/service error strings are translated at display
  time (`content/ar-messages.ts`, `useI18n().tm`, used by `useFormErrors`), so
  schemas and services are unchanged.
- **Search** in Arabic matches both the Arabic display text and the stored
  English values.
- **RTL details** — logical properties throughout (`ms-/ps-/start-/text-start`,
  `border-s`), arrow-key tab navigation reverses in RTL (`useTabArrowKeys`),
  only directional icons mirror (logos and symbolic icons do not), and email,
  phone and URL inputs stay LTR.

**Not translated, by design:** anything a user types (horse notes, names,
emails), the `SmartHorse` brand, and the English name derived from a login
email. Native date pickers follow the browser's own locale. Arabic uses the
system Arabic font stack (no web font was added).

## Dashboard redesign

The Dashboard (Phase B content, reused by the Farm Owner and Stable Manager
role dashboards) got a visual pass alongside the localization work above.
Nothing about its data or service seam changed — `useDashboard()`,
`dashboard-service.ts` and the mock's review switches (`?mock=slow|error|empty`)
all work exactly as before.

- **Colour** — three new token groups in `globals.css` (`forest` — a deep
  emerald primary, `sand` — a warm cream/beige, `brass` — a restrained
  gold/amber accent), **additive** to the existing `pasture`/`bay` tokens
  every other module still uses. Used only where the Dashboard redesign
  specifically calls for it (the hero, Smart Actions, chart accents) —
  the rest of the app keeps its current look on purpose.
- **Hero** — `DashboardHeader` now shows the farm name, a one-line contextual
  summary, and two compact operational chips (upcoming visits, pending
  tasks) pulled from the same summary figures the metric cards below show.
- **Metric cards, Health, Activity, Tasks, Notifications** — redesigned with
  icon chips, trend indicators, hover elevation and an accessible progress
  bar, built on the same `DashboardOverview` data as before.
- **Smart Actions** (`components/smart-actions.tsx`) — a new automation-style
  panel. This is a **frontend UX simulation only**: every card is derived
  live from figures already on the dashboard (vaccinations due this week,
  overdue tasks, a visit scheduled tomorrow) — there is no rule engine, no
  scheduler, no backend and no real automation of any kind.
- **Quick Actions** (`components/quick-actions.tsx`) — links to three
  existing routes only (`/horses/new`, `/tasks/new`, `/notifications`); no
  fabricated routes.
- **Motion** — a single shared entrance keyframe (`sh-fade-up` in
  `globals.css`) plus small helpers in `features/dashboard/components/layout.ts`
  (`fadeInUp`, `staggerDelay`, `hoverLift`). Every animated element is wrapped
  in Tailwind's `motion-safe:` variant with a `motion-reduce:opacity-100`
  fallback, so `prefers-reduced-motion: reduce` shows the dashboard fully in
  place with no animation at all.
- **RTL** — the activity chart's gridlines and axis labels use logical
  `start`/`end` positioning rather than fixed `left`/`right`, so the value
  axis sits on the correct reading-start edge and the day grid (a native CSS
  grid) reorders itself the same way text does in Arabic.

## Structure

```
src/
├── app/                 # routes (App Router)
│   ├── (auth)/          # /login /register /forgot-password /reset-password
│   ├── (app)/           # /dashboard, /horses (Phase C), /medical (Phase D),
│   │                    # /training /tasks /notifications /settings — placeholders
│   ├── layout.tsx       # document shell
│   ├── providers.tsx    # QueryClient + AuthProvider
│   └── globals.css      # design tokens (the only place colours are defined)
├── components/
│   ├── layout/          # app shell: sidebar, topbar, brand, page header
│   └── ui/              # button, input, password input, form field, card,
│                        # alert, badge, avatar, dropdown, spinner, empty state
├── config/navigation.ts # sidebar model
├── features/auth/       # schemas, service seam, provider, guards, forms, roles.ts
├── features/dashboard/  # Phase B farm overview: types, service seam, query hook,
│   │                    # formatting, components/ (one per panel), mock/ — SHARED, singular
├── features/dashboards/ # Phase I role dashboards: routes.ts, types.ts, and one
│   │                    # folder per role (farm-owner/, stable-manager/, trainer/,
│   │                    # worker/, doctor/) — plural, not the same as features/dashboard/
├── features/horses/     # types, service seam, query/mutation hooks, formatting,
│   │                    # vocabulary, schemas, components/ (list, profile, forms), mock/
├── features/medical/    # types, vocabulary, service seam, hooks/, formatting,
│   │                    # schemas, components/ (overview, timeline, forms), mock/
├── i18n/                # Phase J: dictionaries/en.ts + ar.ts, locale-provider.tsx
│   │                    # (useLocale/useTranslations), roles.ts (localized role labels)
├── hooks/
├── lib/
└── types/
tests/                   # vitest specs mirroring src
docs/
└── ROLE_DASHBOARD_DEVELOPMENT.md  # guide for role-dashboard developers
```

## Replacing the mock authentication

`src/features/auth/auth-service.ts` is the only seam. It exports an
`AuthService` (declared in `types.ts`) that components consume through
`useAuth()` and direct calls. To go live:

1. Write an HTTP implementation of `AuthService` against `/api/v1`.
2. Change the one export in `auth-service.ts`.
3. Delete `src/features/auth/mock/`, including the mock account directory it
   keeps in `localStorage` — a real backend is the account store from then on.

No component imports the mock, so nothing else changes.

## The farm role model

`FarmRole` — `FarmOwner`, `StableManager`, `Trainer`, `Worker`, `Doctor` — and
its vocabulary (`farmRoleLabels`, `farmRoleDescriptions`, `farmRoleValues`,
`farmRoleOptions`) are defined once, in `src/features/auth/roles.ts`. It is
the single source of truth: Settings (`features/settings/vocabulary.ts`)
re-exports it rather than redefining it, and Registration's role cards read
from it directly, so the five roles and their labels can never drift apart
between the two places that show them.

`roles.ts` also has two small, deliberately unambitious helpers for
role-aware UI:

```ts
hasRole(user, 'FarmOwner');
hasAnyRole(user, ['FarmOwner', 'StableManager']);
```

These are for showing or hiding UI only — a visibility convenience, not a
permission engine and not a security boundary. Nothing in the frontend
enforces access based on role; the backend is the only real authority
(see "Security note" below). Nothing yet calls these helpers outside of
their own tests — they exist as the foundation a future phase can build
role-aware visibility on top of, per Phase H's brief.

## Replacing the mock Dashboard

`src/features/dashboard/dashboard-service.ts` is the only seam. It exports a
`DashboardService` (declared in `types.ts`) with a single method,
`getOverview()`, which the `useDashboard()` query hook calls. The shape of
`DashboardOverview` is what a future `GET /api/v1/dashboard` response needs to
return. Dates are ISO 8601 strings and the UI does all display formatting.

1. Write an HTTP implementation of `DashboardService` against `/api/v1`.
2. Change the one export in `dashboard-service.ts`.
3. Delete `src/features/dashboard/mock/`.

Components only receive plain data and never import the mock. Loading, error and
retry already run through TanStack Query, so real API failures surface in the
same error state.

The Dashboard is a read-only aggregation view: it displays figures owned by other
modules and edits nothing. "View all" links go to the existing module routes.

## Reviewing Horse Management

`/horses` renders 24 realistic mock horses (`src/features/horses/mock/`), shared
in part with the Dashboard's sample stable (Luna, Storm, Duke, Thunder, Shadow,
Willow appear in both). The same review switches as the Dashboard work here,
appended to `/horses`:

| URL                  | State                                            |
| -------------------- | ------------------------------------------------ |
| `/horses`            | normal data                                      |
| `/horses?mock=slow`  | loading skeleton (request takes about 4 seconds) |
| `/horses?mock=error` | error state with "Try again"                     |
| `/horses?mock=empty` | a farm with no horses yet                        |

Routes:

```
/horses                 the list — search, filter, table (desktop) / cards (mobile)
/horses/new              add a horse
/horses/:horseId         a horse's profile — identity, identification, ownership
/horses/:horseId/edit    edit a horse, pre-populated
```

Adding or editing a horse changes an in-memory array inside the mock service, so
the change is visible immediately in the list and on the profile; like the auth
and dashboard mocks it resets on reload. A photo chosen on the Add or Edit form
is a local preview only (`URL.createObjectURL`) — nothing is uploaded anywhere.

## Replacing the mock Horses service

`src/features/horses/horse-service.ts` is the only seam. It exports a
`HorseService` (declared in `types.ts`) with four methods — `listHorses`,
`getHorse`, `createHorse`, `updateHorse` — which `use-horses.ts`, `use-horse.ts`
and `use-save-horse.ts` call through TanStack Query. `Horse` and `HorseInput` are
the shapes a future `/api/v1/horses` needs to accept and return; dates are ISO
8601 strings and the UI does all display and age formatting.

1. Write an HTTP implementation of `HorseService` against `/api/v1/horses`.
2. Change the one export in `horse-service.ts`.
3. Delete `src/features/horses/mock/`.

Components only receive plain data and never import the mock. A horse id with no
matching record surfaces as `HorseNotFoundError`, which the profile and edit
routes render as a "Horse not found" state rather than a crash or a blank form.

## Reviewing Health / Medical

`/medical` renders 46 realistic mock medical records across the same horses as
Horse Management (`src/features/medical/mock/`). Dates are generated relative to
the current time, so "overdue", "due soon" and "Tomorrow" are always true. The
same review switches as the Dashboard and Horses work here:

| URL                   | State                                            |
| --------------------- | ------------------------------------------------ |
| `/medical`            | normal data                                      |
| `/medical?mock=slow`  | loading skeleton (request takes about 4 seconds) |
| `/medical?mock=error` | error state with "Try again"                     |
| `/medical?mock=empty` | a farm with no medical data yet                  |

Routes:

```
/medical                                      overview — summary, then Records,
                                              Vaccinations and Upcoming tabs
/medical/horses/:horseId                      one horse's medical profile and timeline
/medical/horses/:horseId/new                  add a medical record
/medical/horses/:horseId/edit/:recordId       edit a record, pre-populated
```

The sidebar's **Health** entry points at `/medical`. The old `/health`
placeholder route redirects there, so older links still work.

Records open in a dialog rather than on their own page: someone scanning a long
list or a horse's timeline is usually comparing entries, and a full navigation
would lose their place each time.

Adding or editing a record changes an in-memory array inside the mock service,
so the change is visible immediately in the list, the horse's timeline, the
vaccination register and the upcoming events; like the other mocks it resets on
reload. Files chosen in the attachment picker are recorded as metadata only
(name, size, type) — nothing is read or uploaded.

Two things are calculated rather than stored, so they can never disagree with the
dates beside them:

- **Vaccination status** (Up to date / Due soon / Overdue / Scheduled) is derived
  from the dose dates against today. An overdue dose stays flagged even once a
  later appointment is booked.
- **Vaccinations and upcoming events** are derived from the records themselves,
  which is why saving one record updates all three views.

**Health status** (Healthy, Monitoring, Needs attention, Under treatment,
Recovering) is entered by a person and stored as entered. It is not a prediction
and not a score — there is no health analysis in this phase.

## Replacing the mock Medical service

`src/features/medical/medical-service.ts` is the only seam. It exports a
`MedicalService` (declared in `types.ts`) whose methods — `listRecords`,
`getRecord`, `getHorseHistory`, `listHorseHealth`, `listVaccinations`,
`listUpcomingEvents`, `createRecord`, `updateRecord` — the hooks in
`features/medical/hooks/` call through TanStack Query. `MedicalRecord` and
`MedicalRecordInput` are the shapes a future `/api/v1/medical` needs to accept
and return; dates are ISO 8601 strings and the UI does all display formatting.

1. Write an HTTP implementation of `MedicalService` against `/api/v1/medical`.
2. Change the one export in `medical-service.ts`.
3. Delete `src/features/medical/mock/`.

Components only receive plain data and never import the mock. A record id with no
matching record surfaces as `MedicalRecordNotFoundError`, which the edit route
renders as a "Medical record not found" state rather than a blank form; a record
that exists but belongs to another horse is treated the same way, so a stale URL
cannot rewrite the wrong horse's history.

In production, vaccinations and upcoming events are expected to be server-computed
endpoints. The mock derives them from the records (`mock/derive.ts`) purely so
edits stay consistent during review; that file disappears with the rest of the mock.

## Reviewing Training Management

`/training` renders 48 realistic mock training sessions and 10 training programs
across the same horses as Horse Management and Medical
(`src/features/training/mock/`). Sessions span roughly the last three months to
two weeks ahead, so "this week", "upcoming" and a horse's "last/next session" are
always true relative to today. The same review switches as the other modules
work here:

| URL                    | State                                            |
| ---------------------- | ------------------------------------------------ |
| `/training`            | normal data                                      |
| `/training?mock=slow`  | loading skeleton (request takes about 4 seconds) |
| `/training?mock=error` | error state with "Try again"                     |
| `/training?mock=empty` | a farm with no training data yet                 |

Routes:

```
/training                                     overview — summary, then Sessions,
                                               Programs and Upcoming tabs
/training/horses/:horseId                     one horse's training profile,
                                               summary, progress charts and timeline
/training/horses/:horseId/new                 add a training session
/training/horses/:horseId/edit/:sessionId     edit a session, pre-populated
```

The Horse profile's **Records** panel now links straight to
`/training/horses/:horseId`, alongside the existing Health link.

Unlike Medical, a session opens on its own edit page rather than in a dialog:
the overview's session table, the horse's timeline and the "Upcoming" list all
link directly to `/training/horses/:horseId/edit/:sessionId`. Add and Edit share
one form component (`training-session-form.tsx`) with identical fields and
validation.

Adding or editing a session changes an in-memory array inside the mock service,
so the change is immediately visible in the overview list, the horse's timeline,
its progress charts and its summary figures; like the other mocks it resets on
reload.

Two figures are always derived, never stored independently, so they can never
disagree with the list beneath them:

- The overview's four summary tiles (active programs, sessions this week,
  completed sessions, horses in training) are computed from the same sessions
  and programs collections the tabs below render.
- A horse's summary (total/completed sessions, current program, last/next
  session) is computed from that horse's own sessions and programs.

**Result** is a short, free-text description of how a session went (e.g. "Held
pace comfortably; recovery time back to baseline within 10 minutes"). It is
entered by the trainer and stored as entered — there is no scoring, rating or
AI-based performance evaluation anywhere in this phase.

The progress charts (distance and average speed over a horse's most recent
tracked sessions) are drawn in plain HTML/CSS, following the same recipe as the
Dashboard's activity chart, and each carries a screen-reader-only data table
alongside the visual bars.

## Replacing the mock Training service

`src/features/training/training-service.ts` is the only seam. It exports a
`TrainingService` (declared in `types.ts`) whose methods — `listSessions`,
`getSession`, `getHorseSessions`, `listPrograms`, `listTrainers`,
`createSession`, `updateSession` — the hooks in `features/training/hooks/` call
through TanStack Query. `TrainingSession`, `TrainingSessionInput` and
`TrainingProgram` are the shapes a future `/api/v1/training` needs to accept and
return; dates are ISO 8601 strings and the UI does all display formatting.

1. Write an HTTP implementation of `TrainingService` against `/api/v1/training`.
2. Change the one export in `training-service.ts`.
3. Delete `src/features/training/mock/`.

Components only receive plain data and never import the mock. A session id with
no matching session surfaces as `TrainingSessionNotFoundError`, which the edit
route renders as a "Training session not found" state rather than a blank form;
a session that exists but belongs to another horse is treated the same way, so
a stale URL cannot rewrite the wrong horse's history.

Trainers are currently a lightweight `{ id, name }` reference
(`listTrainers`), not a user record — there is no User Management module yet.
A future backend can replace this with a real user/member reference without
changing how the UI reads or displays a trainer's name.

## Reviewing Tasks & Notifications

`/tasks` renders 55 realistic mock tasks across the same horses as the other
modules, plus several farm-wide tasks with no horse at all
(`src/features/tasks/mock/`). `/notifications` renders 32 mock notifications
(`src/features/notifications/mock/`), several of which reference real task ids
and real horse ids so opening one always lands somewhere real. The same review
switches as the other modules work on both pages independently:

| URL                     | State                                            |
| ----------------------- | ------------------------------------------------ |
| `/tasks`                | normal data                                      |
| `/tasks?mock=slow`      | loading skeleton (request takes about 4 seconds) |
| `/tasks?mock=error`     | error state with "Try again"                     |
| `/tasks?mock=empty`     | a farm with no tasks yet                         |
| `/notifications`        | normal data                                      |
| `/notifications?mock=…` | the same three states, for the notification list |

Routes:

```
/tasks                    overview — summary, filters, then All/Today/Upcoming/
                           Overdue/Completed tabs
/tasks/:taskId             task detail, with Edit and one-tap status actions
/tasks/new                 add a task
/tasks/:taskId/edit        edit a task, pre-populated
/notifications              notification center — All/Unread, mark (all) read
```

A task's **due-date state** (overdue / due today / upcoming) is never stored —
it is derived fresh from `dueAt` and `status` every time
(`deriveDueState` in `format.ts`), the same way Training derives a session's
timeline grouping. A completed or cancelled task is never "overdue": the
due-date state only describes work that still needs doing. The four overview
summary tiles and every tab are computed from that same derivation, so a
figure can never disagree with the list beneath it.

The Horse profile's **Records** panel now links Health, Training and Tasks;
the Tasks link opens `/tasks?horseId=:horseId`, pre-filtering the task list to
that horse.

The **topbar bell** (`features/notifications/components/notification-bell.tsx`)
shows an unread-count badge and a preview dropdown of the five most recent
notifications, built on the existing shared `Dropdown` primitive so it gets
click-outside and Escape-to-close for free. Opening any notification — from
the bell or from `/notifications` — marks it read and then navigates to its
related page if it has one; a system notification has nowhere to go, so it
simply becomes read in place.

**Task ↔ Notification relationship.** Assigning a task and completing a task
each call directly into the mock Notification service
(`pushNotification` in `mock-notification-service.ts`) to raise a new
notification, the same moment a real backend would publish an event. This is a
plain in-memory function call between the two mocks, not an event bus — try it
by adding a task with an assignee, or marking one complete, and opening the
bell. Nothing outside the two mock services calls `pushNotification`, and it
is not part of the public `NotificationService` contract a real backend will
implement.

## Replacing the mock Tasks service

`src/features/tasks/task-service.ts` is the only seam. It exports a
`TaskService` (declared in `types.ts`) whose methods — `listTasks`, `getTask`,
`listAssignees`, `createTask`, `updateTask`, `setTaskStatus` — the hooks in
`features/tasks/hooks/` call through TanStack Query. `Task` and `TaskInput` are
the shapes a future `/api/v1/tasks` needs to accept and return; dates are ISO
8601 strings and the UI does all display formatting.

1. Write an HTTP implementation of `TaskService` against `/api/v1/tasks`.
2. Change the one export in `task-service.ts`.
3. Delete `src/features/tasks/mock/`, and move the `pushNotification` call in
   the old mock service to wherever the real backend's task-assigned and
   task-completed events are handled (or drop it entirely if the backend
   raises those notifications server-side).

Components only receive plain data and never import the mock. A task id with
no matching task surfaces as `TaskNotFoundError`, which the edit and detail
routes render as a "Task not found" state rather than a blank page.

Assignees are currently a lightweight `{ id, name, role }` reference
(`listAssignees`), not a user record — there is no User/Team Management module
yet. A future backend can replace this with a real Farm membership reference
without changing how the UI reads or displays an assignee's name.

## Replacing the mock Notifications service

`src/features/notifications/notification-service.ts` is the only seam. It
exports a `NotificationService` (declared in `types.ts`) whose methods —
`listNotifications`, `markRead`, `markAllRead` — the hooks in
`features/notifications/hooks/` call through TanStack Query.

1. Write an HTTP implementation of `NotificationService` against
   `/api/v1/notifications`.
2. Change the one export in `notification-service.ts`.
3. Delete `src/features/notifications/mock/`.

Components only receive plain data and never import the mock. Where a
notification points to — a task, a horse's medical history, a horse's training
profile — is computed by one function, `notificationHref` in `format.ts`, so
Notifications never needs to know another module's URL structure beyond that
one place.

## Reviewing Farms, Team & Roles + Settings

`/settings` replaces the old placeholder with a real landing page linking to
the four areas below. Each has its own mock data and its own review switches:

| URL                 | State                                                               |
| ------------------- | ------------------------------------------------------------------- |
| `/settings/farm`    | normal data; `?mock=slow` / `?mock=error` supported                 |
| `/settings/team`    | normal data; `?mock=slow` / `?mock=error` / `?mock=empty` supported |
| `/settings/roles`   | normal data; `?mock=slow` / `?mock=error` supported                 |
| `/settings/account` | normal data; `?mock=slow` / `?mock=error` supported                 |

`?mock=empty` only has a visible effect on `/settings/team`: a farm always has
exactly one farm profile, one fixed set of roles, and one signed-in account,
so there is no "no data" state for those three pages to show — their mock
services say so in a comment rather than silently ignoring the switch.

Routes:

```
/settings                  landing page — four cards, each a real route
/settings/farm              farm profile — basic info, contact, location, branding
/settings/team               team roster — search, filters, invite, role change,
                              suspend/reactivate, remove
/settings/roles               the five existing farm roles and what each can access
/settings/account             the signed-in person's profile, password and preferences
```

**The role model is not new.** `FarmRole` (`FarmOwner`, `StableManager`,
`Trainer`, `Worker`, `Doctor` as of Phase H — see "The farm role model" above)
already existed before this phase — it's what the mock session already
authenticates with. Team Members assigns those same five roles and Roles &
Permissions describes them; neither invents a second role hierarchy.
`settings/vocabulary.ts` re-exports that vocabulary rather than redefining it.

**Nothing here is real authorization.** The Roles & Permissions page says so
directly on the page, not just in code comments: showing a role's access is
informational, and hiding or disabling a control in this frontend is not a
security boundary. The backend is the only thing that will ever enforce this.

**Cross-feature data is derived, not duplicated:**

- Farm Profile's "Team members" and "Total horses" figures reuse the existing
  Team and Horses queries rather than storing separate counts.
- Every role's member count on `/settings/roles` (`countMembersByRole` in
  `format.ts`) is computed from the live team roster, so it can never
  disagree with who is actually assigned that role.
- The farm's id and name (`farm-mock-data.ts`) deliberately match the farm
  object already embedded in the Dashboard's own mock summary, so the two
  can never show different names for the same farm.
- Training's trainer references and Tasks' assignee references stay exactly
  as lightweight as they already were — this phase does not rewrite either
  module to point at a real team member record, even though several team
  members share a name with an existing trainer or assignee as flavour text.

**Account Settings reads the real session.** Unlike Farm/Team/Roles,
`mock-account-service.ts` does not invent a second identity: a person's name,
email and farm role already live in the signed-in session
(`authService.getSession()`), and a second, disconnected copy here would let
the Account page show a different name than the topbar. Saving a profile edit
also calls a small new `useAuth().updateUser()` (an additive, purely
client-side patch to `AuthProvider`'s state — it does not touch
`AuthService`) so the topbar avatar and the Dashboard greeting reflect the new
name immediately. Only phone number and preferences are genuinely new mock
state, since the session never tracked either. Password change is mock
only — nothing is logged, stored, or sent anywhere, and no password value is
ever kept in mock data.

Team member **status** follows `active` / `invited` / `suspended` — a
vocabulary introduced in this phase after confirming no equivalent already
existed elsewhere. **Removing a member**, unlike suspending one, goes through
its own confirmation dialog rather than acting immediately, and **Invite
Member** always says "invitation created" rather than "sent": this is a mock,
and no email is ever sent from the frontend.

## Replacing the mock Farm, Team, Role and Account services

Four independent seams, one per area, all under `src/features/settings/`:

- `farm-service.ts` — `getFarm`, `updateFarm`
- `team-service.ts` — `listMembers`, `inviteMember`, `updateMemberRole`,
  `setMemberStatus`, `removeMember`
- `role-service.ts` — `listRoles` (read-only: the five roles are fixed)
- `account-service.ts` — `getAccount`, `updateAccount`, `changePassword`,
  `getPreferences`, `updatePreferences`

1. Write an HTTP implementation of each service against its `/api/v1/...`
   endpoint.
2. Change the one export in each `*-service.ts` file.
3. Delete `src/features/settings/mock/`, and move the account identity lookup
   in `mock-account-service.ts` to wherever the real backend resolves the
   signed-in user (or drop it, if the backend's own `/account` response
   already includes name/email/role directly).

Components only receive plain data and never import a mock service directly.

## Security note

`RequireAuth` only keeps signed-out visitors out of the shell. It is navigation
convenience, not a security boundary — authorization is enforced by the backend
(Master Prompt v1.0 §4).
