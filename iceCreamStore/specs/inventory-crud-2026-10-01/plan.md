# P3 — Inventory CRUD: Implementation Plan

## Group 0 — Framework migration

1. Scaffold Next.js 14 App Router project alongside (or replacing) the Vite app; preserve existing component and type files
2. Configure path aliases and Tailwind CSS in the Next.js config to match the current setup
3. Verify `pnpm lint` and `pnpm tsc --noEmit` green before continuing

## Group 1 — Supabase setup

4. Create a Supabase project; record the `SUPABASE_URL` and `SUPABASE_ANON_KEY` in `.env.local` (never committed)
5. Run the `ice_creams` and `bookings` SQL migrations via the Supabase SQL editor (scripts in `supabase/migrations/`)
6. Enable Row-Level Security (RLS) on both tables; add policies so only authenticated users (staff) can write
7. Install `@supabase/supabase-js` and create `src/lib/supabaseClient.ts`

## Group 2 — Auth

8. Enable Supabase Auth email/password provider in the Supabase dashboard
9. `LoginPage` — email + password form; calls `supabase.auth.signInWithPassword`
10. Server-side session check in the staff layout (Next.js middleware or `auth()` server utility); redirect unauthenticated requests to `/login`
11. "Sign out" button in the staff nav

## Group 3 — Inventory dashboard

12. `InventoryListPage` — fetches all non-archived ice creams from Supabase; renders a table with name, category, and action buttons
13. `InventoryFormPage` — shared form for add and edit; fields match the `ice_creams` schema
14. Add flow: `POST` via Server Action → `supabase.from('ice_creams').insert(…)` → redirect to list
15. Edit flow: `GET` item, pre-fill form → `PATCH` via Server Action → redirect to list
16. Archive action: Server Action sets `archived = true`; item disappears from list without a hard delete

## Group 4 — Booking persistence

17. Update `bookingService.ts` (from P2): replace the stub with a real Supabase insert into `bookings`
18. Verify the confirmation screen still shows after a successful insert; show an error state on failure

## Group 5 — Integration & polish

19. Seed the `ice_creams` table from `src/data/flavors.json` (one-off migration script or Supabase SQL)
20. Add staff nav link in the app header (visible only when authenticated)
21. Run `pnpm lint` and `pnpm tsc --noEmit`; fix any issues
22. Manual validation pass against `validation.md` checklist
23. Commit and open PR
