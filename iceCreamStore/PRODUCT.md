# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Vite + React + TypeScript + Tailwind CSS (current, front-end only). Planned migration to Next.js 14 (App Router) with PostgreSQL via Prisma and NextAuth.js when back-end is introduced. Deploy target: Vercel.

## Users

**Primary — the store owner (propietario).** Runs the counter on a tablet or phone with one free
hand and little time: takes orders from a Starbucks-style menu, builds artisanal ice creams scoop
by scoop, keeps a queue of orders waiting to be charged, restocks what runs out, and reviews income,
profit and demand by day, week or month in a visual dashboard that exports to PDF and CSV.

**Secondary — counter staff.** Same single mock account and the same tools as the owner.

Customers do **not** use the app; the menu exists to take orders at the counter, not for
self-service. Table booking stays as a public page (decision D5 of P6).

## Product Purpose

IceCreamStore is the owner's working tool for a physical ice cream shop: order taking with a
build modal, a counter queue with editing, dynamic categories and priced options (envases, extras,
toppings), inventory that is discounted as orders are queued or charged, and a sales dashboard
with comparisons, peak hours, star flavor and restocking signals. Everything runs in the browser
and persists in `localStorage`; there is no backend yet. The whole app is in Spanish.

## Positioning

A small-business ice cream shop site built with production-grade engineering practices (TypeScript end-to-end, Vite, Tailwind, progressive back-end introduction) — quality that scales from a static front-end to a full-stack product without front-end rewrites.

## Operating Context

- Physical store exists; the site complements the in-person experience.
- Customers arrive online from nearby, often deciding what to order or whether to visit.
- Staff work within the store context; the dashboard is a management aid, not a public surface.
- Owner checks analytics to make stocking and scheduling decisions.

## Capabilities and Constraints

- **P6 (current, 2026-10-17):** owner panel — see `specs/panel-propietario-2026-10-17/`. Prices in
  integer cents, income without IVA, optional costs for profit, demo data, PDF and CSV exports.
- **History — P1:** Static flavor catalog — name, description, image placeholder, size picker (small / medium / large), category filter (fruit / chocolate / classic). No cart or checkout.
- **P2 (next):** Table booking form (date, time, party size, name, contact) with client-side validation. No persistence yet.
- **P3+:** Back-end, inventory CRUD, staff auth, booking persistence, order queue, analytics.
- Data source for catalog: `src/data/flavors.json` — typed JSON imported at build time.
- Sizes are a static constant; no pricing logic in front-end phases.
- No real images in P1; image placeholders (color hex or label) only.
- Styling: plain CSS (`catalog.css`) — Tailwind available globally; component-level catalog styles isolated.

## Brand Commitments

Store name: **IceCreamStore** (working name; visual brand — colors, logo, tagline — is undecided and must not be fabricated).

## Evidence on Hand

- `specs/roadmap.md` — six-phase delivery plan (P0–P5).
- `specs/tech-stack.md` — confirmed stack choices and rationale.
- `specs/flavor-catalog-2026-10-01/requirements.md` — P1 scope and data shape.
- `src/data/flavors.json` — static flavor data (build-time import).
- Stakeholder briefs: Mary (engineering reliability, popular TypeScript stack), Susan (product catalog and booking), Steve (marketing, attractive site, modern browser).

## Product Principles

1. **Ship incrementally, never rewrite.** Each phase delivers a working product; back-end layers are additive.
2. **The owner's counter comes first.** Every frequent action costs few taps on a phone or tablet; visibility (dashboard, signals) serves stocking and staffing decisions.
3. **Type safety throughout.** TypeScript end-to-end, from data shapes to API contracts, is non-negotiable.
4. **Content before chrome.** Real flavors, real copy, real bookings — no fabricated testimonials, prices, or claims.
5. **Order taking stays open, management is gated.** The menu (`/`) and booking need no login; queue, dashboard, inventory, categories, options and settings sit behind `AuthGuard`.

## Accessibility & Inclusion

WCAG 2.1 AA compliance is a project requirement across all customer-facing and staff-facing surfaces.
