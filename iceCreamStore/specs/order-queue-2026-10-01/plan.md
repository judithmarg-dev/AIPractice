# P4 — Order Queue: Implementation Plan

## Group 1 — Data layer

1. Add a `updateBookingStatus(id: string, status: BookingStatus): Promise<void>` function to `bookingService.ts`; wraps `supabase.from('bookings').update({ status }).eq('id', id)`
2. Define `BookingStatus` union type (`'pending' | 'confirmed' | 'cancelled'`) in `src/types/booking.ts`
3. Add a `listBookings(): Promise<Booking[]>` function — fetches all bookings ordered by `created_at desc`

## Group 2 — Booking list UI

4. `BookingQueuePage` at `/staff/bookings` — fetches booking list server-side on load; renders `BookingRow` per entry
5. `BookingRow` component — displays name, date, time, party size, and a `StatusBadge`
6. `StatusBadge` — colour-coded chip: yellow for `pending`, green for `confirmed`, red for `cancelled`

## Group 3 — Status transitions

7. Add inline action controls to `BookingRow`: "Confirm" button (shown when `pending`), "Cancel" button (shown when `pending` or `confirmed`)
8. On action click: apply optimistic state update in local state → call `updateBookingStatus` → on error revert state and show an error toast

## Group 4 — New-booking notifications

9. Subscribe to Supabase Realtime `INSERT` events on the `bookings` channel
10. On new insert: increment a `newBookings` counter and show a banner ("X new booking(s) — click to refresh")
11. Fallback: if Realtime is unavailable, poll `listBookings` every 30 seconds and compare lengths

## Group 5 — Integration & polish

12. Add "Bookings" link to the staff nav (alongside "Inventory")
13. Protect `/staff/bookings` with the same auth middleware from P3
14. Run `pnpm lint` and `pnpm tsc --noEmit`; fix any issues
15. Manual validation pass against `validation.md` checklist
16. Commit and open PR
