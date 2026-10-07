# P4 — Order Queue: Implementation Plan

## Group 1 — Data layer

1. Add `updateBookingStatus(id: string, status: BookingStatus): void` to `bookingService.ts`; dispatches the `updateBookingStatus` Redux action from `bookingsSlice`
2. Define `BookingStatus` union type (`'pending' | 'confirmed' | 'cancelled'`) in `src/types/booking.ts` (if not already added in P3)
3. Add `selectAllBookings` selector in `bookingsSlice.ts` — returns all bookings ordered by `createdAt` descending

## Group 2 — Booking list UI

4. `BookingQueuePage` at `/staff/bookings` — reads from `selectAllBookings` via `useSelector`; renders `BookingRow` per entry
5. `BookingRow` component — displays name, date, time, party size, and a `StatusBadge`
6. `StatusBadge` — colour-coded chip: yellow for `pending`, green for `confirmed`, red for `cancelled`

## Group 3 — Status transitions

7. Add inline action controls to `BookingRow`: "Confirm" button (shown when `pending`), "Cancel" button (shown when `pending` or `confirmed`)
8. On action click: apply optimistic local state update → dispatch `updateBookingStatus` action → on error (if dispatch throws) revert state and show an error toast

## Group 4 — New-booking notifications

9. In `BookingQueuePage`, subscribe to the Redux store via `store.subscribe`; compare previous and current `bookings.length`
10. On new booking detected: increment a `newBookings` counter and show a banner ("X new booking(s) — click to refresh")
11. Clean up the store subscription on component unmount

## Group 5 — Integration & polish

12. Add "Bookings" link to the staff nav (alongside "Inventory")
13. Protect `/staff/bookings` with the same `<AuthGuard>` from P3
14. Run `pnpm lint` and `pnpm tsc --noEmit`; fix any issues
15. Manual validation pass against `validation.md` checklist
16. Commit and open PR
