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

### Tablet Layout (primary design target, 768px – 1023px)
```
┌─────────────────────────────────┬──────────────┐
│                                 │              │
│     Catalog Grid (3-4 cols)     │   Detail     │
│                                 │   Panel      │
│                                 │   (~300px)   │
│                                 │              │
└─────────────────────────────────┴──────────────┘
```

## Styling Approach

### Breakpoints
- Tablet (primary target): 768px – 1023px
- Desktop: ≥ 1024px
- Mobile (< 768px): **out of scope** — not a target viewport for this staff-admin tool

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

### Tablet (768px - 1023px)
- Similar to desktop but narrower
- Panel width: ~300-350px
- Catalog columns: 3-4 instead of 6
- May need absolute positioning if space is tight

### Mobile (< 768px) — out of scope
- Not a target viewport; no mobile-specific layout required

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
