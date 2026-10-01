# P3 — Inventory CRUD: Requirements

## Scope

Staff can manage the ice cream catalog (add, edit, archive items) through a protected dashboard. This phase introduces the backend layer: Supabase as the hosted database, Next.js for the full-stack runtime, and auth to protect staff routes. Booking data submitted in P2 is also persisted here.

### In scope
- Next.js 14 (App Router) migration from the Vite scaffold
- Supabase as the hosted Postgres database (no local DB needed)
- Staff-only auth via Supabase Auth (email/password)
- Inventory dashboard: list all ice creams, add a new item, edit an existing item, archive (soft-delete) an item
- Booking submissions from P2 persisted to Supabase on form submit

### Out of scope
- Role granularity beyond "staff" (admin vs. viewer roles deferred)
- Image uploads or CDN (placeholder values only, as in P1)
- Public-facing catalog API (still served from static data in the front-end for now)
- Real-time inventory sync to the customer-facing catalog (deferred to P5)

## Supabase schema (minimum)

### `ice_creams`
| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | Supabase default |
| name | text | Not null |
| description | text | |
| category | text | `fruit \| chocolate \| classic` |
| image_placeholder | text | |
| archived | boolean | Default false; soft-delete |
| created_at | timestamptz | Supabase default |

### `bookings`
| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | Supabase default |
| date | date | Not null |
| time | text | 30-min slot string, e.g. "14:30" |
| party_size | integer | Not null |
| first_name | text | Not null |
| last_name | text | Not null |
| email | text | Not null |
| phone | text | Not null |
| status | text | `pending \| confirmed \| cancelled`; default `pending` |
| created_at | timestamptz | Supabase default |

## Key decisions

| Decision | Choice | Rationale |
|---|---|---|
| Database | Supabase (hosted Postgres) | No local DB setup; free tier sufficient for MVP; instant REST + Realtime APIs |
| Auth | Supabase Auth (email/password) | Same SDK as DB; avoids NextAuth config overhead at this scale |
| Framework | Next.js 14 App Router | Enables Server Actions / Server Components for secure DB access; aligns with tech-stack plan |
| Inventory delete | Soft-delete (`archived` flag) | Preserves historical booking references; safer than hard-delete |

## Audience alignment (mission.md)

This phase serves **store owners**: they can maintain the catalog and have bookings persisted for future visibility. The customer experience (P1 catalog, P2 booking) is unchanged from the outside.
