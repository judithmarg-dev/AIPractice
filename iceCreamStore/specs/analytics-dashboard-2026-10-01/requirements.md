# P5 — Analytics Dashboard: Requirements

## Scope

Managers get actionable insights from booking and inventory data. This phase is read-only — no new writes to the database. Requires P3 and P4 to be shipped first.

### In scope
- Booking trends over time: daily / weekly booking count chart
- Popular time slots: bar chart of bookings per time slot
- Peak days: day-of-week booking frequency
- Top flavors: most-requested flavors (requires bookings to carry flavor data — see note below)
- Low-stock alerts: ice cream items flagged when quantity falls below a threshold (requires an `inventory_count` column added to `ice_creams` in this phase)
- CSV export: download the currently visible bookings dataset as a `.csv` file

### Out of scope
- Revenue or financial figures (no pricing data in scope)
- Real-time streaming of analytics (static snapshot on page load is sufficient)
- User-level access control beyond "authenticated staff" (same auth as P3/P4)

### Note on flavor demand data

The P2 booking form does not capture which flavors a customer wants. To populate the "Top flavors" chart, either:
Derive demand from inventory count changes over time.

**Decision deferred to implementation** — choose (a) if the booking form change is low-effort; otherwise implement (b) and note it in the chart subtitle.

## Key decisions

| Decision | Choice | Rationale |
|---|---|---|
| Chart library | Recharts | Recommended in roadmap.md; React-native, lightweight, no canvas dependency |
| Data source | Supabase queries via Server Components | No separate analytics service at MVP scale |
| CSV export | Client-side generation (`Papa Parse` or manual `Blob`) | No server endpoint needed; data already in browser |
| Low-stock threshold | Configurable constant (default: 5 units) | Owners can adjust without a code change once a settings page exists |

## Audience alignment (mission.md)

This phase serves **store owners** exclusively — it gives them the stocking and trend data needed for business decisions. The customer experience is unchanged.
