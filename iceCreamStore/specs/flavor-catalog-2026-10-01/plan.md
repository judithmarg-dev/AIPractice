# P1 — Flavor Catalog: Implementation Plan

## Group 0 — Styling decision

1. Frappe UI evaluated — incompatible (Vue-only library with hard Vue peer deps)
2. Plain CSS used in `src/catalog.css` with existing project design tokens (no new dependency needed)

## Group 1 — Data & types

1. Define `Flavor` TypeScript type in `src/types/flavor.ts`
2. Create `src/data/flavors.json` with ≥ 6 flavors across all three categories (fruit, chocolate, classic)
3. Verify JSON imports cleanly and TypeScript is satisfied (`tsc --noEmit`)

## Group 2 — Core UI components

4. `FlavorCard` component — displays name, description, and image placeholder for a single flavor
5. `SizePicker` component — renders S / M / L buttons, accepts `selected` + `onChange` props
6. `CategoryFilter` component — renders category buttons (All + each category), highlights active filter

## Group 3 — Catalog page

7. `FlavorCatalogPage` (or equivalent page file) — composes the above components
8. Wire category filter: filter the flavor list by selected category (show all when none selected)
9. Wire size picker: track selected size in local state (no downstream effect yet)
10. Tablet-first layout: base grid targets 768 px+ (2–3 columns); desktop adapts upward from there; sub-768 px is out of scope

## Group 4 — Integration & polish

11. Connect page to app router / main `App.tsx`
12. Run `pnpm lint` and `pnpm tsc --noEmit`; fix any issues
13. Manual validation pass against `validation.md` checklist
14. Commit and open PR
