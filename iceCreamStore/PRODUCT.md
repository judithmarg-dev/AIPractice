# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Vite + React + TypeScript + Tailwind CSS (current, front-end only). Planned migration to Next.js 14 (App Router) with PostgreSQL via Prisma and NextAuth.js when back-end is introduced. Deploy target: Vercel.

## Users

**Primary — Customers:** Local customers checking the ice cream catalog before or after visiting the physical store. They want a quick, low-friction way to see what flavors are available, pick a size, and reserve a table.

**Primary — Store owner / manager:** Wants to monitor store performance, popular flavors, booking trends, and low-stock alerts (P5 analytics dashboard). Not yet served by front-end-only phases.

**Secondary — Staff:** Will manage the ice cream inventory and booking queue (introduced in P3). Auth-gated, distinct from the customer-facing experience.

## Product Purpose

IceCreamStore is the digital presence of a physical ice cream shop. It lets customers browse the flavor catalog and book a table, and it gives the owner and staff a dashboard to manage inventory, bookings, and performance metrics. Phases ship independently: customer-facing catalog first, then booking, then staff tools, then analytics.

## Positioning

A small-business ice cream shop site built with production-grade engineering practices (TypeScript end-to-end, Vite, Tailwind, progressive back-end introduction) — quality that scales from a static front-end to a full-stack product without front-end rewrites.

## Operating Context

- Physical store exists; the site complements the in-person experience.
- Customers arrive online from nearby, often deciding what to order or whether to visit.
- Staff work within the store context; the dashboard is a management aid, not a public surface.
- Owner checks analytics to make stocking and scheduling decisions.

## Capabilities and Constraints

- **P1 (current):** Static flavor catalog — name, description, image placeholder, size picker (small / medium / large), category filter (fruit / chocolate / classic). No cart or checkout.
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
2. **Customer experience first, owner visibility second.** P0–P2 optimise for low-friction browsing and booking. Analytics wait until the product foundation is solid.
3. **Type safety throughout.** TypeScript end-to-end, from data shapes to API contracts, is non-negotiable.
4. **Content before chrome.** Real flavors, real copy, real bookings — no fabricated testimonials, prices, or claims.
5. **Staff and customer surfaces are distinct.** Auth-gated management tools never bleed into the public-facing experience.

## Accessibility & Inclusion

WCAG 2.1 AA compliance is a project requirement across all customer-facing and staff-facing surfaces.
