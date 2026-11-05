# P5 — Analytics Dashboard: Implementation Plan

## Group 1 — Analytics selectors

1. Confirm `inventoryCount: number` field exists on `IceCream` type and `inventorySlice` initial state (added in P3; verify before starting)
2. Create `src/store/selectors/analytics.ts` with client-side selector functions over Redux state:
   - `selectBookingsByDay(state, range: DateRange): DailyCount[]`
   - `selectBookingsByTimeSlot(state): SlotCount[]`
   - `selectBookingsByDayOfWeek(state): DayCount[]`
   - `selectLowStockItems(state, threshold?: number): IceCream[]`
3. Define result TypeScript types for each selector in `src/types/analytics.ts`

## Group 2 — Chart components

4. Install `recharts` (and `papaparse` for CSV export)
5. `BookingTrendChart` — line or bar chart of daily booking counts using Recharts `<LineChart>` / `<BarChart>`
6. `TimeSlotChart` — horizontal bar chart of bookings per 30-min slot
7. `DayOfWeekChart` — bar chart of bookings per weekday
8. `TopFlavorsChart` — bar chart derived from `inventoryCount` changes (or placeholder pending booking form update)
9. `LowStockAlert` — a list or table of items below the stock threshold; each row shows name and current count

## Group 3 — KPI stat tiles

10. `StatTile` component — reusable tile: label + large number + optional trend indicator
11. Compose tiles for: total bookings this week, most popular slot, items below stock threshold count

## Group 4 — CSV export

12. `exportBookingsCSV(bookings: Booking[]): void` utility in `src/lib/exportCsv.ts` — generates a CSV blob and triggers a browser download
13. "Export CSV" button on the dashboard: reads bookings from Redux state and calls `exportBookingsCSV`

## Group 5 — Dashboard page & integration

14. `AnalyticsDashboardPage` at `/staff/analytics` — composes KPI tiles, all charts, and the export button; data read from Redux store via `useSelector`
15. Protect `/staff/analytics` with `<AuthGuard>` from P3
16. Add "Analytics" link to the staff nav
17. Run `pnpm lint` and `pnpm tsc --noEmit`; fix any issues
18. Manual validation pass against `validation.md` checklist
19. Commit and open PR
