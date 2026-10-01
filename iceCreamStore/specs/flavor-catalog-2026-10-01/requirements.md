# P1 — Flavor Catalog: Requirements

## Scope

Customers can browse the ice cream catalog. All data is static (front-end only, no backend).

### In scope
- Flavor list page: name, description, image placeholder per flavor
- Size picker: Small / Medium / Large (UI selection, no pricing logic yet)
- Category filter: fruit, chocolate, classic (at minimum); filter is additive / single-select
- Responsive layout: works on mobile and modern desktop browsers

### Out of scope
- Cart, add-to-order, or checkout flow (deferred to a later phase)
- Real images or CDN assets (placeholders only)
- Backend or persistence of any kind

## Data

Flavors are stored in `src/data/flavors.json` — a typed JSON array imported at build time.
Shape (minimum):
```json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "category": "fruit | chocolate | classic",
  "imagePlaceholder": "string (color hex or label)"
}
```
Sizes are a static constant (not in the JSON): `["small", "medium", "large"]`.

## Key decisions

| Decision | Choice | Rationale |
|---|---|---|
| Data source | `src/data/flavors.json` | Easy to swap for an API fetch without changing component logic |
| State management | React local state / hooks | Context not needed at this scale; aligns with tech-stack guidance |
| Styling | Frappe UI | Component library with built-in design system; replaces raw Tailwind utility classes |
| Filter behavior | Single-select category filter (show all when none selected) | Simplest UX; can be extended to multi-select later |

## Audience alignment (mission.md)

This phase serves **clients** exclusively. Owners gain no new visibility here — that comes in P3+ with inventory and analytics. Every UI decision should optimise for a smooth, low-friction browsing experience.
