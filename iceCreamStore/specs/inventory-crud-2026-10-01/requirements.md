# P3 — Inventory CRUD: Requirements

## Scope

Staff can manage the ice cream catalog (add, edit, archive items) through a protected dashboard. This phase introduces Redux Toolkit as the global state layer. Data is in-memory (persists across navigation, lost on page reload).

> **2026-10-07 — Scope change:** Supabase and Next.js were removed because they caused app failures. The backend scope is now delivered as Redux Toolkit slices. See decision log in `roadmap.md`.

### In scope
- Redux Toolkit store setup: slices for `catalog`, `bookings`, `inventory`, `auth`
- Mock staff auth: hardcoded credentials checked against Redux `auth` slice; protected routes redirect unauthenticated users to `/login`
- Inventory dashboard: list all ice creams, add a new item, edit an existing item, archive (soft-delete) an item — all via Redux dispatch
- Booking submissions from P2 persisted to Redux `bookings` slice on form submit

### Removed (2026-10-07)
- ~~Next.js 14 (App Router) migration from the Vite scaffold~~ — **REMOVED 2026-10-07**: Next.js caused app failures; staying on Vite + React
- ~~Supabase as the hosted Postgres database (no local DB needed)~~ — **REMOVED 2026-10-07**: replaced by Redux Toolkit in-memory store
- ~~Staff-only auth via Supabase Auth (email/password)~~ — **REMOVED 2026-10-07**: replaced by mock auth Redux slice (hardcoded credentials)
- ~~Booking submissions from P2 persisted to Supabase on form submit~~ — **REMOVED 2026-10-07**: persisted to Redux store instead (in-memory)

### Out of scope
- Role granularity beyond "staff" (admin vs. viewer roles deferred)
- Image uploads or CDN (placeholder values only, as in P1)
- Public-facing catalog API (still served from static data in the front-end for now)
- Real-time inventory sync to the customer-facing catalog (deferred to P5)
- Real database persistence (deferred; backend strategy TBD post-MVP)

## State shape (replaces Supabase schema)

### `inventory` slice — `IceCream[]`
| Field | Type | Notes |
|---|---|---|
| id | string | UUID generated client-side |
| name | string | Not empty |
| description | string | |
| category | `'fruit' \| 'chocolate' \| 'classic'` | |
| imagePlaceholder | string | |
| inventoryCount | number | Default 0; used for low-stock alerts in P5 |
| archived | boolean | Default false; soft-delete |
| createdAt | string | ISO timestamp set on creation |

### `bookings` slice — `Booking[]`
| Field | Type | Notes |
|---|---|---|
| id | string | UUID generated client-side |
| date | string | ISO date |
| time | string | 30-min slot, e.g. `"14:30"` |
| partySize | number | |
| firstName | string | |
| lastName | string | |
| email | string | |
| phone | string | |
| status | `'pending' \| 'confirmed' \| 'cancelled'` | Default `'pending'` |
| createdAt | string | ISO timestamp |

## Key decisions

| Decision | Choice | Rationale |
|---|---|---|
| State | Redux Toolkit | Replaces Supabase; consistent global state across catalog, bookings, inventory, auth |
| Auth | Mock Redux `auth` slice (hardcoded credentials) | Supabase Auth removed; sufficient for MVP staff access without a real backend |
| Persistence | In-memory (Redux store) | Data survives navigation but not page reload; real persistence deferred |
| Delete | Soft-delete (`archived: true`) | Preserves booking references; consistent with original design |
| IDs | `crypto.randomUUID()` | No database to generate UUIDs; browser API is sufficient |

## Audience alignment (mission.md)

This phase serves **staff and owners**: they can maintain the catalog and have bookings persisted (in-memory) for operational visibility. The P1 catalog and P2 booking entry tools remain unchanged for staff users.
