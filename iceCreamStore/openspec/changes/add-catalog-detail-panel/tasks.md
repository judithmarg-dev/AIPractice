# Catalog Detail Panel Implementation Tasks

## Phase 1: Component Structure

### Task 1.1: Create FlavorDetailPanel Component
**Effort: 1.5 hours**
- [x] Create `src/components/FlavorDetailPanel.tsx`
- [x] Define component props: `flavor: Flavor | null`, `onClose: () => void`, `selectedSize: Size`
- [x] Create basic structure with header (title + close button) and body sections
- [x] Add placeholder styling (can iterate on styles in later tasks)
- [x] Implement close button click handler
- [x] Add prop validation (handle null flavor gracefully)

### Task 1.2: Update FlavorCard Component
**Effort: 1 hour**
- [x] Add `isSelected` prop to FlavorCard component signature
- [x] Add `onClick` handler prop to FlavorCard
- [x] Update styling to show selected state (border or outline change)
- [x] Ensure click is on entire card area (good hit target)
- [x] Maintain existing functionality

### Task 1.3: Update FlavorCatalogPage Component
**Effort: 1.5 hours**
- [x] Add `selectedFlavorId` state with `useState`
- [x] Create handler function `handleFlavorSelect(flavorId: string)`
- [x] Implement toggle behavior (clicking selected flavor closes panel)
- [x] Pass `isSelected` prop to FlavorCard components
- [x] Pass `onClick` handler to FlavorCard components
- [x] Render FlavorDetailPanel component below catalog with selected flavor
- [x] Pass flavor object, onClose handler, and selectedSize to detail panel

## Phase 2: Responsive Styling

### Task 2.1: Desktop Layout (≥ 1024px)
**Effort: 1.5 hours**
- [x] Update `src/index.css` or create `src/components/FlavorDetailPanel.css`
- [x] Create CSS Grid layout in catalog container
- [x] Catalog section: grid-column for flexible width
- [x] Detail panel: grid-column for fixed width (~360px)
- [x] Add media query for desktop breakpoint
- [x] Ensure smooth transitions when panel opens/closes
- [x] Test layout doesn't cause horizontal scrolling

### Task 2.2: Tablet Layout (768px - 1023px)
**Effort: 1 hour**
- [x] Add media query for tablet breakpoint
- [x] Adjust panel width to ~300px
- [x] Reduce catalog columns (3-4 instead of 6)
- [x] Ensure content remains readable and accessible
- [x] Test on actual tablet devices or emulation

### Task 2.3: Mobile Layout (< 768px) — ~~completed~~ OBSOLETE (2026-10-08)
**Out of scope:** Mobile viewport removed from target by mission change. Completed work for the mobile drawer is superseded; tablet (768px) is now the smallest supported breakpoint. No regression fix required — the mobile CSS will not be served to target devices, but may be left in place or removed in a cleanup pass.

## Phase 3: Interactivity & State Management

### Task 3.1: Keyboard Navigation
**Effort: 1 hour**
- [x] Add Escape key handler to FlavorCatalogPage
  - [x] Listen for keydown event on window or parent container
  - [x] Close panel when Escape is pressed
- [x] Ensure FlavorCard items are keyboard-focusable
- [x] Ensure close button is focusable and clickable
- [x] Test Tab key navigation through all interactive elements

### Task 3.2: Click-Outside Dismissal
**Effort: 0.5 hours**
- [x] Add backdrop overlay click handler
- [x] Clicking overlay dismisses panel

### Task 3.3: Panel Content Display
**Effort: 1 hour**
- [x] Render flavor name in panel header
- [x] Display flavor category badge
- [x] Show flavor description text
- [x] Add color indicator/preview matching flavor's style
- [x] Display size options (if applicable)
- [x] Create placeholder for action button (style only, no functionality)

## Phase 4: Visual Polish & Testing

### Task 4.1: Animations & Transitions
**Effort: 1 hour**
- [x] Add CSS transitions for panel slide-in/slide-out
- [x] Smooth grid layout adjustment when panel appears/disappears
- [x] Panel entrance animation: slide from right (tablet and desktop)
- [x] Ensure animations don't cause performance issues
- [x] Set reasonable transition duration (200-400ms)

### Task 4.2: Visual Feedback
**Effort: 0.5 hours**
- [x] Ensure selected flavor card has clear visual distinction
- [x] Add hover states to interactive elements
- [x] Ensure close button has clear visual feedback
- [x] Test in both light and dark modes (if applicable)

### Task 4.3: Responsive Testing
**Effort: 1.5 hours**
- [ ] Test on desktop browsers (Chrome, Firefox, Safari)
- [ ] Test on tablet screen sizes (iPad-like, 768px)
- [ ] ~~Test on mobile screen sizes (iPhone-like, 375px, 425px)~~ — out of scope (2026-10-08)
- [ ] ~~Test landscape orientation on mobile~~ — out of scope (2026-10-08)
- [ ] Test with browser devtools responsive design mode
- [ ] Verify no layout shifts or scrolling issues
- [ ] Check that all interactive elements remain accessible

### Task 4.4: Accessibility Testing
**Effort: 1 hour**
- [x] Test keyboard navigation (Tab, Shift+Tab, Enter, Escape)
- [x] Verify close button has proper aria-label
- [ ] Check color contrast ratios meet WCAG AA standards
- [ ] Test with screen reader (if available)
- [x] Ensure semantic HTML structure
- [x] Verify focus management when panel is open

## Phase 5: Integration & QA

### Task 5.1: End-to-End Testing
**Effort: 1 hour**
- [x] Click flavor card → panel opens with correct data ✓
- [x] Click close button → panel closes ✓
- [x] Click different card → panel updates to new flavor ✓
- [x] Click same card again → panel closes ✓
- [x] Press Escape → panel closes ✓
- [ ] Scroll catalog while panel is open → panel remains visible (desktop)
- [ ] Test on multiple device sizes with real data

### Task 5.2: Code Cleanup & Documentation
**Effort: 0.5 hours**
- [x] Remove any console.log or debugging code
- [x] Ensure consistent code formatting
- [x] Add JSDoc comments for component props
- [x] Verify TypeScript types are correct
- [x] Check for any unused imports

### Task 5.3: Performance Review
**Effort: 0.5 hours**
- [x] Check for unnecessary re-renders
- [x] Verify CSS is optimized
- [x] Test panel opening/closing performance
- [x] Ensure smooth 60fps animations
- [x] Check bundle size impact

## Summary
- **Total Estimated Effort: 15 hours**
- **Number of Tasks: 20**
- **Critical Path: Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5**

## Dependencies
- All phases depend on Phase 1 (component structure)
- Phase 2 can run parallel to Phase 3 after Phase 1 is complete
- Phase 4 depends on Phase 3 (state management for animations)
- Phase 5 is final validation and requires all previous phases
