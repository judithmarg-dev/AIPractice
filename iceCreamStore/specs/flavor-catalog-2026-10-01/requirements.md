# P1 — Flavor Catalog: Requirements

## Scope

Staff can browse and present the ice cream catalog to customers at the counter. All data is static (front-end only, no backend).

### In scope
- Flavor list page: name, description, image placeholder per flavor
- Size picker: Small / Medium / Large (UI selection, no pricing logic yet)
- Category filter: fruit, chocolate, classic (at minimum); filter is additive / single-select
- Mobile-first layout: base styles target phones; tablet (≥ 768 px) and desktop (≥ 1024 px) add columns and the side panel

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
| Styling | Plain CSS (`catalog.css`) | Frappe UI is Vue-only and incompatible with React; plain CSS with the project's existing design tokens used instead |
| Filter behavior | Single-select category filter (show all when none selected) | Simplest UX; can be extended to multi-select later |

## Audience alignment (mission.md)

This phase serves **staff**. They use the catalog at the counter to help customers choose and to verify the current menu. Every UI decision should optimise for a quick, low-friction touch experience on a phone or tablet. Owners gain deeper visibility starting in P3+ with inventory and analytics.
