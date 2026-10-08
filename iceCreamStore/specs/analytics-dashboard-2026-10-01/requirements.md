# P5 — Analytics Dashboard: Requirements

## Scope

Managers get actionable insights from booking and inventory data held in the Redux store. This phase is read-only — no new writes to state. Requires P3 and P4 to be shipped first.

### In scope
- Booking trends over time: daily / weekly booking count chart (from Redux `bookings` state)
- Popular time slots: bar chart of bookings per time slot
- Peak days: day-of-week booking frequency
- Top flavors: most-requested flavors (see note below)
- Low-stock alerts: ice cream items where `inventoryCount` falls below a threshold (field added to `IceCream` type in P3)
- CSV export: download the currently visible bookings dataset as a `.csv` file

### Out of scope
- Revenue or financial figures (no pricing data in scope)
- Real-time streaming of analytics (snapshot from Redux state on component render is sufficient)
- User-level access control beyond "authenticated staff" (same `AuthGuard` as P3/P4)
- Real database queries (no backend in scope at this phase)

### Removed (2026-10-07)
- ~~Data source: Supabase queries via Server Components~~ — **REMOVED 2026-10-07**: Supabase and Next.js removed; analytics read from Redux store client-side via selectors
- ~~`inventory_count` Supabase migration~~ — **REMOVED 2026-10-07**: `inventoryCount` field added directly to Redux `IceCream` type in P3

### Note on flavor demand data

The P2 booking form does not capture which flavors a customer wants. To populate the "Top flavors" chart, derive demand from `inventoryCount` changes over time (or show a placeholder until a flavor-selection field is added to the booking form).

## Key decisions

| Decision | Choice | Rationale |
|---|---|---|
| Chart library | Recharts | Recommended in roadmap.md; React-native, lightweight, no canvas dependency |
| Data source | Redux store selectors (client-side) | ~~Supabase Server Components~~ removed 2026-10-07; Redux store is the source of truth |
| CSV export | Client-side generation (`Papa Parse` or manual `Blob`) | No server endpoint needed; data already in Redux state |
| Low-stock threshold | Configurable constant (default: 5 units) | Owners can adjust without a code change once a settings page exists |

## Audience alignment (mission.md)

This phase serves **staff and owners** — it gives them the stocking and trend data needed for business decisions. No customer-facing surface exists in this app.
