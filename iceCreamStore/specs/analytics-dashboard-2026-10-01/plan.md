# P5 — Analytics Dashboard: Implementation Plan

## Group 1 — Data queries

1. Add `inventory_count` integer column to `ice_creams` in Supabase (migration in `supabase/migrations/`)
2. Create `src/lib/analytics.ts` with server-side query functions:
   - `getBookingsByDay(range: DateRange): Promise<DailyCount[]>`
   - `getBookingsByTimeSlot(): Promise<SlotCount[]>`
   - `getBookingsByDayOfWeek(): Promise<DayCount[]>`
   - `getLowStockItems(threshold?: number): Promise<IceCream[]>`
3. Define result TypeScript types for each query in `src/types/analytics.ts`

## Group 2 — Chart components

4. Install `recharts` (and `papaparse` for CSV export)
5. `BookingTrendChart` — line or bar chart of daily booking counts using Recharts `<LineChart>` / `<BarChart>`
6. `TimeSlotChart` — horizontal bar chart of bookings per 30-min slot
7. `DayOfWeekChart` — bar chart of bookings per weekday
8. `TopFlavorsChart` — bar chart (implement option (a) or (b) per the requirements decision)
9. `LowStockAlert` — a list or table of items below the stock threshold; each row shows name and current count

## Group 3 — KPI stat tiles

10. `StatTile` component — reusable tile: label + large number + optional trend indicator
11. Compose tiles for: total bookings this week, most popular slot, items below stock threshold count

## Group 4 — CSV export

12. `exportBookingsCSV(bookings: Booking[]): void` utility in `src/lib/exportCsv.ts` — generates a CSV blob and triggers a browser download
13. "Export CSV" button on the dashboard: fetches the full bookings dataset and calls `exportBookingsCSV`

## Group 5 — Dashboard page & integration

14. `AnalyticsDashboardPage` at `/staff/analytics` — composes KPI tiles, all charts, and the export button; data fetched server-side
15. Protect `/staff/analytics` with the same auth middleware from P3
16. Add "Analytics" link to the staff nav
17. Run `pnpm lint` and `pnpm tsc --noEmit`; fix any issues
18. Manual validation pass against `validation.md` checklist
19. Commit and open PR
