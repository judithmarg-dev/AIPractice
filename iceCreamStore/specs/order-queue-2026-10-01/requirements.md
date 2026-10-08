# P4 — Order Queue: Requirements

## Scope

Staff can view and manage all incoming table bookings. This phase surfaces the booking data in the Redux `bookings` slice (persisted in P3) and adds status-transition controls. Requires P3 to be shipped first.

### In scope
- Booking list view: shows all bookings with key details (name, date, time, party size, status)
- Status transitions: staff can move a booking from `pending` → `confirmed` or `pending`/`confirmed` → `cancelled`
- Optimistic UI: the status badge updates immediately on dispatch; reverts on error
- Basic in-app notification stub: a toast or banner when a new `pending` booking is detected via Redux store subscription

### Out of scope
- Email or SMS notifications to the customer (deferred)
- Staff-to-customer messaging
- Filtering or search (deferred; list is short at MVP scale)
- Cancellation by the customer (deferred to a later phase)
- Real-time updates from a backend (no backend in scope; state is in-memory)

## Booking status model

```
pending → confirmed
pending → cancelled
confirmed → cancelled
```

Transitions not in the list above are invalid and must be blocked in the UI.

## Key decisions

| Decision | Choice | Rationale |
|---|---|---|
| Optimistic UI | Local component state update → dispatch → revert on error | Snappy UX; consistent with original design intent |
| New-booking alert | Redux store subscriber (`store.subscribe`) comparing `bookings` length | ~~Supabase Realtime~~ removed 2026-10-07; Redux store is the source of truth; subscription is instant |
| Status control | Dropdown or action buttons per row | Inline action is faster than a modal for simple two-option transitions |

## Audience alignment (mission.md)

This phase serves **staff and owners**: they gain the operational visibility needed to confirm or cancel reservations. No customer-facing surface exists in this app.
