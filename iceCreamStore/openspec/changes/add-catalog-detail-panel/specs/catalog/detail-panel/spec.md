# Catalog Detail Panel Specification

## System Requirements

### Selection Behavior
- User clicks a flavor card in the catalog
- Clicking the same card again toggles the panel closed
- Clicking a different card switches the detail panel to show that flavor
- Pressing Escape key closes the panel
- Clicking outside the panel (on the catalog area) closes the panel

### Panel Content
The detail panel displays:
- Flavor name (heading)
- Color indicator matching the flavor's visual style
- Full description text
- Category badge
- Size options with pricing (if pricing data is available)
- An action button (e.g., "Add to Cart" or "Select")
- Close button (X icon, top right)

### Responsive Behavior
**Desktop (≥1024px)**
- Panel slides in from the right side
- Panel width is approximately 30-40% of viewport width
- Catalog grid adjusts to accommodate the panel (layout shift)
- Panel remains visible while scrolling catalog

**Tablet (768px - 1023px)**
- Panel takes up approximately 40-50% of the right side
- Catalog grid adjusts or becomes partially hidden
- Close button clearly visible

**Mobile (<768px)**
- Panel displays as a full-width overlay from the bottom (drawer style)
- Panel height approximately 60-70% of viewport height
- User can dismiss by:
  - Clicking the close button
  - Swiping down
  - Pressing Escape
  - Clicking the overlay backdrop (if present)

### State Management
- Track selected flavor ID in component state
- Clear selection when panel is closed
- Maintain selection while user scrolls through catalog
- Selection should persist through category filter changes (if a filtered-out flavor was selected, panel closes)

### Accessibility
- Close button must have proper aria-label
- Panel must be keyboard navigable (Tab key moves through interactive elements)
- Escape key functionality for closing
- Selected state should be clearly visually distinct
- Flavor card showing selected state (outline, background, or other visual indicator)

### Animation and Transitions
- Panel entrance: Smooth slide-in from right (desktop) or bottom (mobile)
- Catalog content: Smooth adjustment when panel opens/closes
- No janky layout shifts
