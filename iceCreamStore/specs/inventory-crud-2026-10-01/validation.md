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
| Submit valid staff credentials on `/login` | Redirected to `/staff/inventory` |
| Click "Sign out" | Session cleared; redirected to `/login` |
| Visit `/staff` after signing out | Redirected to `/login` |

### 3. Inventory CRUD checks

| Scenario | Expected result |
|---|---|
| Load `/staff/inventory` as authenticated staff | All non-archived ice cream items listed |
| Click "Add item", fill form, submit | New item appears in the list; row exists in Supabase `ice_creams` table |
| Click "Edit" on an existing item | Form pre-filled; saving changes updates the row in Supabase |
| Click "Archive" on an item | Item disappears from the list; `archived = true` in Supabase (row not deleted) |

### 4. Booking persistence checks

| Scenario | Expected result |
|---|---|
| Complete the P2 booking form and submit | Row appears in the Supabase `bookings` table with `status = pending` |
| Submit fails (e.g. network error) | Confirmation screen shows an error message; no duplicate row in DB |

### 5. Code review checklist
- `.env.local` is in `.gitignore`; no Supabase keys committed
- RLS policies are applied; `anon` role cannot write to `ice_creams` or `bookings`
- All Supabase calls are in Server Actions or server-side utilities (no secret keys in client bundle)
- `archived` items are excluded from list queries (not fetched and filtered in JS)

## Definition of done

All automated checks green + all scenario checks pass + code review checklist ticked = **ready to merge to `main`**.
