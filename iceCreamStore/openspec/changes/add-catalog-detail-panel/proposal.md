# Catalog Detail Panel

## What
Add an interactive right-side panel that opens when staff select a flavor from the catalog. The panel displays detailed information about the selected flavor and is optimised for tablet and desktop viewports.

## Why
Currently, the flavor catalog shows only basic card information. Staff need a way to see more details about a flavor (full description, size options, allergen information, etc.) without leaving the catalog view — for example, when helping a customer at the counter choose a flavor. A detail panel allows quick inspection while keeping the catalog visible.

## Scope
- Create a detail panel component that displays flavor information
- Add selection state management to track the currently selected flavor
- Implement tablet-first behavior: panel design targets ≥ 768 px; adapts to desktop (< 768 px is out of scope)
- Integrate click handlers on catalog cards to open the panel
- Add a close button or dismissal mechanism for the panel

## Out of scope
- Complex animations or transitions (can be added later)
- Flavor reviews or ratings
- Shopping cart integration
- User preferences or favorites
- Pricing calculations beyond display

## Assumptions
- Flavor type already contains the necessary data for detail display
- The detail panel should be accessible via keyboard (Escape to close)
- Tablet (≥ 768 px) is the smallest supported viewport; mobile is out of scope
