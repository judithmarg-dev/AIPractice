# P4 — Order Queue: Validation

## Merge bar

P4 is ready to merge when **all** of the following pass.

### 1. Automated checks (CI must be green)
- `pnpm lint` — zero ESLint errors or warnings
- `pnpm tsc --noEmit` — zero TypeScript errors

### 2. Booking list checks

| Scenario | Expected result |
|---|---|
| Load `/staff/bookings` as authenticated staff | All bookings listed, newest first; status badge matches Redux state |
| Load `/staff/bookings` without auth | Redirected to `/login` |
| Submit a new booking from the P2 form | New row appears in the list immediately (Redux state update is synchronous) |

### 3. Status transition checks

| Scenario | Expected result |
|---|---|
| Click "Confirm" on a `pending` booking | Badge turns green (`confirmed`) immediately; Redux state updated |
| Click "Cancel" on a `pending` booking | Badge turns red (`cancelled`); Redux state updated; action buttons disappear |
| Click "Cancel" on a `confirmed` booking | Badge turns red (`cancelled`); Redux state updated |
| Simulate dispatch error on status change | Badge reverts to original state; error toast is shown |
| Try to confirm a `cancelled` booking (no button rendered) | Action is not possible in the UI |

### 4. Notification checks

| Scenario | Expected result |
|---|---|
| A new booking is submitted while `/staff/bookings` is open | Banner or counter appears immediately (Redux store subscription is synchronous) |

### 5. Code review checklist
- `BookingStatus` type is the single source of truth; no raw string literals for statuses in components
- Optimistic update and revert logic is isolated in one place (e.g. a custom hook `useBookingStatus`)
- Redux store subscription is cleaned up on component unmount

## Definition of done

All automated checks green + all scenario checks pass + code review checklist ticked = **ready to merge to `main`**.
