# Roadmap

Six nano-phases, each independently shippable. Phases P0–P2 are pure front-end. Phases P3–P5 introduce the back-end progressively.

---

## P0 — Skeleton
_Goal: runnable repo, shared conventions, CI green._

- Vite + React + TypeScript project scaffold
- Tailwind CSS configured
- ESLint / Prettier / path aliases
- Folder structure agreed (pages, components, hooks, types)
- CI pipeline (lint + type-check)

## P1 — Flavor catalog
_Goal: customers can browse ice creams (static data)._

- Flavor list page with name, description, image placeholder
- Size picker (small / medium / large)
- Filter by flavor category (fruit, chocolate, classic, …)
- Responsive layout (Steve's modern-browser requirement)

## P2 — Table booking
_Goal: customers can reserve a table (front-end form, no persistence yet)._

- Booking form: date, time, party size, name, contact
- Client-side validation
- Confirmation screen / success state
- Stub: form submits to a mock service or local state

## P3 — Inventory CRUD
_Back-end introduced. Goal: staff can manage the ice cream catalog._

- PostgreSQL + Prisma schema (IceCream, Flavor, Size)
- Next.js migration (or API layer added alongside Vite)
- Staff-only auth (NextAuth.js)
- Inventory dashboard: list, add, edit, archive items
- Booking data persisted to DB

## P4 — Order queue
_Goal: staff can see and manage incoming bookings._

- Booking list view with status (pending / confirmed / cancelled)
- Status transitions with optimistic UI
- Basic notifications (in-app or email stub)

## P5 — Analytics dashboard
_Goal: managers get actionable insights (Steve's marketing + Mary's dashboard)._

- Sales / booking trends over time
- Popular flavors, peak hours
- Low-stock alerts
- Charts (Recharts or similar)
- Export to CSV

---

> Phases may overlap in a sprint, but each phase's deliverable must be demo-able on its own.
