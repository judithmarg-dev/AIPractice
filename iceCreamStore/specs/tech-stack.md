# Tech Stack

## Current

| Layer | Choice | Notes |
|-------|--------|-------|
| Framework | Vite + React | Fast dev loop; no SSR needed |
| Language | TypeScript | End-to-end type safety from day one |
| Styling | Tailwind CSS | Utility-first; aligns with Mary's "popular stack" requirement |
| State | Redux Toolkit | Global state for catalog, bookings, inventory, and auth |

## Removed (2026-10-07)

The following layers were added but then removed because Supabase + Next.js caused app failures. See decision log in `roadmap.md`.

| Layer | Was | Reason removed |
|-------|-----|----------------|
| Full-stack | Next.js 14 (App Router) | App failures; added complexity without sufficient benefit at current scale |
| Database | Supabase (hosted Postgres) | App failures; replaced by Redux Toolkit in-memory store |
| Auth | Supabase Auth | Depended on Supabase; replaced by mock auth Redux slice |
| Deploy | Vercel | Tied to Next.js; no longer applicable |

## Guiding principle

Ship the front-end independently. State is managed in-memory via Redux Toolkit. Backend layers remain deferred until the Redux-based front-end is stable and the team selects a new backend strategy.
