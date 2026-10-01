# P1 — Flavor Catalog: Implementation Plan

## Group 0 — Setup Frappe UI

1. Install Frappe UI (`pnpm add frappe-ui`)
2. Register the plugin / import base styles in `main.ts` (per Frappe UI docs)
3. Verify a test component renders without errors

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
10. Responsive layout: Frappe UI grid/layout primitives — single column on mobile, multi-column on desktop

## Group 4 — Integration & polish

11. Connect page to app router / main `App.tsx`
12. Run `pnpm lint` and `pnpm tsc --noEmit`; fix any issues
13. Manual validation pass against `validation.md` checklist
14. Commit and open PR
