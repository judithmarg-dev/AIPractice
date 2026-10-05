# Catalog Detail Panel

## What
Add an interactive right-side panel that opens when users select a flavor from the catalog. The panel displays detailed information about the selected flavor and maintains responsive behavior on all screen sizes.

## Why
Currently, the flavor catalog shows only basic card information. Users need a way to see more details about a flavor (full description, pricing options, allergen information, etc.) without leaving the catalog view. A detail panel improves the browsing experience by allowing quick inspection of flavors while maintaining context with the catalog grid.

## Scope
- Create a detail panel component that displays flavor information
- Add selection state management to track the currently selected flavor
- Implement responsive behavior that adapts to mobile, tablet, and desktop viewports
- Integrate click handlers on catalog cards to open the panel
- Add a close button or dismissal mechanism for the panel
- Ensure the panel overlays appropriately without blocking critical catalog content on small screens

## Out of scope
- Complex animations or transitions (can be added later)
- Flavor reviews or ratings
- Shopping cart integration
- User preferences or favorites
- Pricing calculations beyond display

## Assumptions
- Flavor type already contains the necessary data for detail display
- The detail panel should be accessible via keyboard (Escape to close)
- Mobile viewport should show panel as an overlay or full-width drawer
