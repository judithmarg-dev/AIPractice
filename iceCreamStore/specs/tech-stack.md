# Tech Stack

## Current

| Layer | Choice | Notes |
|-------|--------|-------|
| Framework | Vite + React | Fast dev loop; no SSR needed |
| Language | TypeScript | End-to-end type safety from day one |
| Styling | Tailwind CSS | Utility-first; aligns with Mary's "popular stack" requirement |
| State | Redux Toolkit | In-memory copy of the store data used by the UI |
| Database | Supabase (hosted Postgres) | Source of truth; `src/store/remoteSync.ts` loads tables into Redux and writes back changed rows. Schema + RLS in `supabase/migrations/001_initial.sql` |
| Auth | Supabase Auth | Staff email/password sign-in; replaces the mock auth slice |

## Removed (2026-10-07)

The following layers were added but then removed because Supabase + Next.js caused app failures. See decision log in `roadmap.md`.

| Layer | Was | Reason removed |
|-------|-----|----------------|
| Full-stack | Next.js 14 (App Router) | App failures; added complexity without sufficient benefit at current scale |
| Database | Supabase (hosted Postgres) | App failures; replaced by Redux Toolkit in-memory store |
| Auth | Supabase Auth | Depended on Supabase; replaced by mock auth Redux slice |
| Deploy | Vercel | Tied to Next.js; no longer applicable |

## Re-added (2026-11-04)

Supabase returns as a plain client from the Vite SPA (no Next.js). Redux reducers are unchanged; a sync layer keeps Supabase as the source of truth. Setup steps (Spanish): `instructions.md`.

## Guiding principle

Keep the front-end logic in Redux Toolkit and treat Supabase as a thin persistence + auth layer behind it.
