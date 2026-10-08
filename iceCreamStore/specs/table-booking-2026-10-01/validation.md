# P2 — Table Booking: Validation

## Merge bar

P2 is ready to merge when **all** of the following pass.

### 1. Automated checks (CI must be green)
- `pnpm lint` — zero ESLint errors or warnings
- `pnpm tsc --noEmit` — zero TypeScript errors

### 2. Visual / manual checks

| Scenario | Expected result |
|---|---|
| Load `/booking` on tablet (768 px – 1023 px) | Form renders correctly; all fields visible; no horizontal scroll |
| Load `/booking` on desktop (≥ 1024 px) | Form renders in two-column layout; all fields visible |
| Submit form with all fields empty | Per-field error messages appear; form does not advance |
| Enter a past date and submit | Date field shows a validation error |
| Enter an invalid email (no `@`) and submit | Email field shows a validation error |
| Enter a phone number with fewer than 7 digits and submit | Phone field shows a validation error |
| Fill all fields correctly and submit | Confirmation screen appears with the submitted details |
| On confirmation screen, click "Back to home" | Navigates to home / flavor catalog |
| Navigate directly to `/booking/confirmation` with no prior submission | Redirects to `/booking` |

### 3. Code review checklist
- `Booking` type has no `any`; all fields explicitly typed
- `bookingService.submitBooking` stub is separate from UI components (easy to swap for a real call in P3)
- Time slots constant is the single source of truth (not duplicated in component JSX)
- No inline styles; layout uses Tailwind utility classes consistent with P1

## Definition of done

All automated checks green + all manual scenarios pass + code review checklist ticked = **ready to merge to `main`**.
