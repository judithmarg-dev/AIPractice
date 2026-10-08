# P1 — Flavor Catalog: Validation

## Merge bar

P1 is ready to merge when **all** of the following pass.

### 1. Automated checks (CI must be green)
- `pnpm lint` — zero ESLint errors or warnings
- `pnpm tsc --noEmit` — zero TypeScript errors

### 2. Visual / manual checks

| Scenario | Expected result |
|---|---|
| Load flavor list page on tablet (768 px – 1023 px) | All flavors render in a multi-column grid; name, description, and image placeholder visible; no horizontal scroll |
| Load flavor list page on desktop (≥ 1024 px) | All flavors render in a grid; name, description, and image placeholder visible |
| Click a category filter (e.g. "Fruit") | Only flavors in that category are shown |
| Click the active filter again or "All" | Full catalog is restored |
| Select a size (S / M / L) | Selected size is visually highlighted; selection persists while browsing |
| No filter selected (initial state) | All flavors are shown |

### 3. Code review checklist
- `flavors.json` has at least 6 entries covering all three categories
- No `any` types in flavor-related code
- Components are in `src/components/`; page-level component in `src/pages/` (or equivalent agreed structure)
- No inline styles; all visual styles in `src/catalog.css` using project CSS tokens

## Definition of done

All automated checks green + all manual scenarios pass + code review checklist ticked = **ready to merge to `main`**.
