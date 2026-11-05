# Catalog Detail Panel Design

## Component Architecture

### New Components
1. **FlavorDetailPanel** - Main detail panel component
   - Props: `flavor: Flavor | null`, `onClose: () => void`, `selectedSize: Size`
   - Handles responsive layout and presentation of flavor details
   - Manages internal close button click

2. **FlavorCard** - Update existing component
   - Add `isSelected` prop to show selection state
   - Add `onClick` handler to trigger panel opening
   - Visual feedback when selected (outline or highlight)

### Updated Components
1. **FlavorCatalogPage** - Main page component
   - Add `selectedFlavorId` state
   - Pass selected flavor to detail panel
   - Handle panel close events
   - Manage click events from catalog cards

## Layout Structure

### Desktop Layout (CSS Grid)
```
┌─────────────────────────────────┬──────────────┐
│                                 │              │
│     Catalog Grid (6 cols)       │   Detail     │
│                                 │   Panel      │
│                                 │   (2 cols)   │
│                                 │              │
└─────────────────────────────────┴──────────────┘
```

### Mobile Layout (base, < 768px)
```
┌────────────────────┐
│ Catalog (2 cols)   │
│                    │
├────────────────────┤  ← backdrop dims the catalog
│ Detail panel       │
│ (bottom drawer,    │
│  max 80vh)         │
└────────────────────┘
```

### Tablet Layout (768px – 1023px)
The panel is a right-side drawer over the catalog (`min(380px, 85vw)`) with a backdrop; the catalog does not reflow.

## Styling Approach

### Breakpoints (mobile-first)
- Mobile (base, no media query): < 768px
- Tablet: `@media (min-width: 768px)`
- Desktop: `@media (min-width: 1024px)`

### Detail Panel Styling
- Background: Light (white) / Dark mode: dark gray
- Border/Shadow: Subtle shadow for depth
- Text: Readable contrast ratios (WCAG AA compliant)
- Spacing: Consistent padding (1rem, 1.5rem, 2rem)
- Font sizing: Semantic hierarchy (h3 for title, p for body)

### Selected Card Styling
- Border: 2px solid or colored outline
- Box-shadow: Optional subtle glow
- Opacity: Slightly reduced opacity for non-selected cards (optional)

## Responsive Implementation Details

### Desktop (≥ 1024px)
- Use CSS Grid layout with sidebar
- Catalog grid takes main space, panel takes right column
- Panel width: ~360-400px (adjust per design system)
- Smooth grid-auto-flow when panel visible/hidden
- Scrolling: Catalog scrolls, panel position fixed or sticky

### Mobile (base, < 768px)
- Panel is a fixed bottom drawer, full width, max-height 80vh, rounded top corners
- Backdrop dims the catalog; tapping it, the close button or Escape closes the panel
- Focus moves into the panel and is trapped while it is open
- Catalog tiles: 2 columns; category sidebar is a sticky horizontal pill row

### Tablet (≥ 768px)
- Panel becomes a right-side drawer, width `min(380px, 85vw)`, over the catalog with a backdrop
- Catalog tiles use `auto-fill` columns

## CSS Classes Structure
```
.flavor-detail-panel
  .flavor-detail-panel__overlay (backdrop click to close)
  .flavor-detail-panel__content
    .flavor-detail-panel__header
      .flavor-detail-panel__title
      .flavor-detail-panel__close-btn
    .flavor-detail-panel__body
      .flavor-detail-panel__image
      .flavor-detail-panel__info
      .flavor-detail-panel__actions
```

## Interaction Patterns

### Mouse/Touch
1. Staff clicks flavor card → Panel slides in, card shows selected state
2. User clicks close button → Panel slides out
3. Staff clicks outside panel → Panel closes
4. User selects different card → Panel content updates smoothly

### Keyboard
1. Tab through cards → Keyboard-focusable cards
2. Enter/Space on card → Open panel
3. Escape → Close panel
4. Tab through panel controls → Navigate interactive elements
5. Close button accessible via keyboard

## Performance Considerations
- Lazy render panel content only when visible
- CSS transitions for smooth animations (avoid JavaScript animations)
- No unnecessary re-renders of flavor grid when panel changes
- Consider using React.memo for FlavorCard if list is large
