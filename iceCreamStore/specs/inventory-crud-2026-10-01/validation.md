# P3 — Inventory CRUD: Validation

## Merge bar

P3 is ready to merge when **all** of the following pass.

### 1. Automated checks (CI must be green)
- `pnpm lint` — zero ESLint errors or warnings
- `pnpm tsc --noEmit` — zero TypeScript errors

### 2. Auth checks

| Scenario | Expected result |
|---|---|
| Visit `/staff` without being logged in | Redirected to `/login` |
| Submit valid staff credentials on `/login` | Redirected to `/staff/inventory`; Redux `isAuthenticated` is `true` |
| Submit invalid credentials on `/login` | Error message shown; Redux `error` is set; `isAuthenticated` remains `false` |
| Click "Sign out" | Redux `auth` state cleared; redirected to `/login` |
| Visit `/staff` after signing out | Redirected to `/login` |

### 3. Inventory CRUD checks

| Scenario | Expected result |
|---|---|
| Load `/staff/inventory` as authenticated staff | All non-archived ice cream items listed (seeded from `flavors.json`) |
| Click "Add item", fill form, submit | New item appears in the list; item present in Redux `inventory` state |
| Click "Edit" on an existing item | Form pre-filled; saving changes updates the item in Redux state |
| Click "Archive" on an item | Item disappears from the list; `archived: true` in Redux state (not deleted) |

### 4. Booking persistence checks

| Scenario | Expected result |
|---|---|
| Complete the P2 booking form and submit | Booking appears in Redux `bookings` state with `status: 'pending'` |
| Page refresh after booking | Booking is not present (in-memory only — expected behavior; noted in requirements) |

### 5. Code review checklist
- No Supabase keys or `.env.local` references in any committed file
- All CRUD operations go through Redux actions — no direct state mutation
- `AuthGuard` is the single enforcement point for `/staff/*` routes
- Hardcoded credentials are in a named constant, not inline in the action
- `archived` items are excluded via a selector, not filtered in component JSX
- `crypto.randomUUID()` used for all new entity IDs

## Definition of done

All automated checks green + all scenario checks pass + code review checklist ticked = **ready to merge to `main`**.
