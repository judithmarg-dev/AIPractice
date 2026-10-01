# P4 — Order Queue: Requirements

## Scope

Staff can view and manage all incoming table bookings. This phase surfaces the booking data persisted in P3 and adds status-transition controls. Requires P3 to be shipped first.

### In scope
- Booking list view: shows all bookings with key details (name, date, time, party size, status)
- Status transitions: staff can move a booking from `pending` → `confirmed` or `pending`/`confirmed` → `cancelled`
- Optimistic UI: the status badge updates immediately on click; reverts on API failure
- Basic in-app notification stub: a toast or banner when a new `pending` booking is detected (polling or Supabase Realtime)

### Out of scope
- Email or SMS notifications to the customer (deferred)
- Staff-to-customer messaging
- Filtering or search (deferred; list is short at MVP scale)
- Cancellation by the customer (deferred to a later phase)

## Booking status model

```
pending → confirmed
pending → cancelled
confirmed → cancelled
```

Transitions not in the list above are invalid and must be blocked in the UI and on the server.

## Key decisions

| Decision | Choice | Rationale |
|---|---|---|
| Optimistic UI | Local state update → server confirm → revert on error | Snappy UX; consistent with how the booking service stub was designed |
| New-booking alert | Supabase Realtime subscription (or 30-second polling fallback) | Supabase Realtime is already in scope from P3; avoids a separate WebSocket service |
| Status control | Dropdown or action buttons per row | Inline action is faster than a modal for simple two-option transitions |

## Audience alignment (mission.md)

This phase serves **store owners**: they gain the operational visibility needed to confirm or cancel reservations. Clients are unaffected (no customer-facing change in this phase).
