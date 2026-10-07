# P3 — Inventory CRUD: Implementation Plan

> **2026-10-07 — Plan rewritten**: Next.js and Supabase removed (app failures). Groups 0–2 below replace the original Next.js migration, Supabase setup, and auth groups. See requirements.md for full change history.

## Group 0 — Redux Toolkit store setup

1. Install `@reduxjs/toolkit` and `react-redux`
2. Create `src/store/index.ts` — configure the Redux store with all slices
3. Wrap `<App>` in `<Provider store={store}>` in `main.tsx`
4. Verify `pnpm lint` and `pnpm tsc --noEmit` green before continuing

## Group 1 — Mock auth slice

5. Create `src/store/slices/authSlice.ts` — state: `{ isAuthenticated: boolean; error: string | null }`
6. Actions: `login(credentials)` validates against a hardcoded staff credential constant; sets `isAuthenticated: true` on match, `error` on mismatch. `logout()` clears session.
7. `LoginPage` — email + password form; dispatches `login` action on submit; shows error from Redux state
8. `AuthGuard` component — reads `isAuthenticated` from Redux; redirects unauthenticated users to `/login`
9. Wrap all `/staff/*` routes with `<AuthGuard>`
10. "Sign out" button dispatches `logout`

## Group 2 — Inventory slice

11. Create `src/store/slices/inventorySlice.ts` — state: `IceCream[]`; seed initial state from `src/data/flavors.json`
12. Actions: `addItem(item)`, `updateItem(item)`, `archiveItem(id)` (sets `archived: true`)
13. Selectors: `selectActiveItems` (filters out archived), `selectItemById(id)`

## Group 3 — Inventory dashboard

14. `InventoryListPage` at `/staff/inventory` — reads from `selectActiveItems`; renders a table with name, category, and action buttons
15. `InventoryFormPage` — shared form for add and edit; fields match the `IceCream` state shape
16. Add flow: dispatch `addItem` with a new `crypto.randomUUID()` id → redirect to list
17. Edit flow: pre-fill form from `selectItemById` → dispatch `updateItem` → redirect to list
18. Archive action: dispatch `archiveItem(id)`; item disappears from list

## Group 4 — Booking persistence

19. Create `src/store/slices/bookingsSlice.ts` — state: `Booking[]`; actions: `addBooking(booking)`, `updateBookingStatus(id, status)`
20. Update `bookingService.ts` (from P2): replace the no-op stub with a Redux `dispatch(addBooking(...))` call
21. Verify the confirmation screen still shows after a successful dispatch; error state is unchanged (dispatch does not throw)

## Group 5 — Integration & polish

22. Add staff nav link in the app header (visible only when `isAuthenticated`)
23. Run `pnpm lint` and `pnpm tsc --noEmit`; fix any issues
24. Manual validation pass against `validation.md` checklist
25. Commit and open PR
