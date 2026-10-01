# P5 — Analytics Dashboard: Validation

## Merge bar

P5 is ready to merge when **all** of the following pass.

### 1. Automated checks (CI must be green)
- `pnpm lint` — zero ESLint errors or warnings
- `pnpm tsc --noEmit` — zero TypeScript errors

### 2. Dashboard access checks

| Scenario | Expected result |
|---|---|
| Visit `/staff/analytics` without auth | Redirected to `/login` |
| Visit `/staff/analytics` as authenticated staff | Dashboard loads with all charts and KPI tiles |

### 3. Chart checks

| Scenario | Expected result |
|---|---|
| At least one booking exists in DB | Booking trend chart renders with data points; no blank/error state |
| No bookings exist | Charts render empty states (e.g. "No data yet") rather than crashing |
| Multiple bookings span different days | Trend chart shows multiple days with correct counts |
| Bookings exist for different time slots | Time slot chart reflects relative frequencies correctly |
| An ice cream item has `inventory_count` < 5 | It appears in the Low Stock alerts section |
| All items are at or above threshold | Low stock section shows "All items sufficiently stocked" or equivalent |

### 4. CSV export checks

| Scenario | Expected result |
|---|---|
| Click "Export CSV" | Browser downloads a `.csv` file |
| Open the downloaded file | Rows match the bookings shown in the P4 queue; columns include date, time, name, email, phone, party size, status |

### 5. Code review checklist
- All Recharts components receive typed data props (no `any`)
- `exportBookingsCSV` is a pure utility with no DOM side effects beyond the download trigger
- `LOW_STOCK_THRESHOLD` is a named constant, not a magic number
- Query functions in `analytics.ts` are server-only (no Supabase anon key in client bundle)
- Charts degrade gracefully with empty data arrays

## Definition of done

All automated checks green + all scenario checks pass + code review checklist ticked = **ready to merge to `main`**.
