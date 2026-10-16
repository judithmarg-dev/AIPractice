# Roadmap

Six nano-phases, each independently shippable. Phases P0–P2 are pure front-end. Phases P3–P5 introduce the state management layer progressively.

---

## P0 — Skeleton
_Goal: runnable repo, shared conventions, CI green._

- Vite + React + TypeScript project scaffold
- Tailwind CSS configured
- ESLint / Prettier / path aliases
- Folder structure agreed (pages, components, hooks, types)
- CI pipeline (lint + type-check)

## P1 — Flavor catalog
_Goal: staff can browse and present the ice cream catalog (static data)._

- Flavor list page with name, description, image placeholder
- Size picker (small / medium / large)
- Filter by flavor category (fruit, chocolate, classic, …)
- Mobile-first layout (base styles target phones; tablet ≥ 768 px and desktop ≥ 1024 px layer on top)

## P2 — Table booking
_Goal: staff can enter a table reservation on behalf of a customer (front-end form, no persistence yet)._

- Staff-side booking entry form: date, time, party size, customer name and contact
- Client-side validation
- Confirmation screen / success state visible to staff
- Stub: form submits to local React state (booking lost on page reload)

## P3 — Inventory CRUD
_State management introduced. Goal: staff can manage the ice cream catalog._

- Redux Toolkit store setup (slices: `catalog`, `bookings`, `inventory`, `auth`)
- ~~PostgreSQL + Prisma schema~~ — removed 2026-10-07; see decision log
- ~~Next.js migration~~ — removed 2026-10-07; staying on Vite + React
- ~~Staff-only auth (NextAuth.js / Supabase Auth)~~ — removed 2026-10-07; replaced with mock auth Redux slice
- Inventory dashboard: list, add, edit, archive items (via Redux dispatch)
- Booking data persisted to Redux store (in-memory)

## P4 — Order queue
_Goal: staff can see and manage incoming bookings._

- Booking list view with status (pending / confirmed / cancelled) from Redux store
- Status transitions with optimistic UI (dispatched to Redux)
- Basic notifications: in-app banner when new `pending` booking detected via Redux store subscriber

## P5 — Analytics dashboard
_Goal: managers get actionable insights (Steve's marketing + Mary's dashboard)._

- Sales / booking trends over time (from Redux store)
- Popular flavors, peak hours
- Low-stock alerts (`inventoryCount` field on Redux IceCream state)
- Charts (Recharts or similar)
- Export to CSV

---

> Phases may overlap in a sprint, but each phase's deliverable must be demo-able on its own.

---

## Decision log

| Date | Decision | Reason |
|---|---|---|
| 2026-10-07 | Remove Supabase + Next.js; replace with Redux Toolkit | App failed to run after Supabase and Next.js were added. Reverting to Vite + React; managing state in-memory with Redux Toolkit. Backend strategy re-evaluated post-MVP. |
| 2026-10-08 | Narrow scope to staff-admin only; adopt tablet-first design _(tablet-first superseded 2026-10-16)_ | Customers are no longer a user type of the app. All screens are designed for a staff member or owner on a tablet (≥ 768 px base). P1 catalog and P2 booking become staff-side tools; customer-facing framing removed from all specs. Mobile (< 768 px) breakpoints are out of scope. |
| 2026-10-16 | Replace tablet-first with mobile-first | The menu and order screens are designed phone-first (the order mock is phone-width). Base styles target phones; tablet (`min-width: 768px`) and desktop (`min-width: 1024px`) layer on top. Supersedes the 2026-10-08 tablet-first decision and puts mobile back in scope. |
