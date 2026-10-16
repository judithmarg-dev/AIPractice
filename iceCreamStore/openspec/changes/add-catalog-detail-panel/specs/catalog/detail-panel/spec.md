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
**Mobile (<768px)** ← base design target
- Panel slides up from the bottom as a full-width drawer (max 80% of viewport height)
- A backdrop dims the catalog; tapping it closes the panel
- Close button clearly visible
- Focus moves into the panel and is trapped until it closes

**Tablet (≥768px)**
- Panel slides in from the right as a drawer over the catalog
- Panel width is `min(380px, 85vw)`; a backdrop dims the catalog

**Desktop (≥1024px)**
- Panel is a sticky side column of about 360px; the catalog grid adjusts to accommodate it
- Panel remains visible while scrolling catalog

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
- Panel entrance: Smooth slide-up from the bottom on mobile; slide-in from the right on tablet and desktop
- Catalog content: Smooth adjustment when panel opens/closes
- No janky layout shifts
