# Catalog Detail Panel Specification

## System Requirements

### Selection Behavior
- Staff clicks a flavor card in the catalog
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
- An action button (e.g., "Select for Order") — no cart or customer-facing checkout in scope
- Close button (X icon, top right)

### Responsive Behavior
**Tablet (768px – 1023px)** ← primary design target
- Panel slides in from the right side
- Panel width is approximately 40-50% of viewport width
- Catalog grid adjusts to accommodate the panel (layout shift)
- Close button clearly visible
- Panel remains visible while scrolling catalog

**Desktop (≥1024px)**
- Panel width is approximately 30-40% of viewport width
- Catalog grid adjusts to accommodate the panel
- Panel remains visible while scrolling catalog

**Mobile (<768px)** — out of scope
- Not a target viewport for this tool; no mobile behavior required

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
- Panel entrance: Smooth slide-in from right (tablet and desktop)
- Catalog content: Smooth adjustment when panel opens/closes
- No janky layout shifts
