# P2 — Table Booking: Implementation Plan

## Group 1 — Types & stub service

1. Define `Booking` TypeScript type in `src/types/booking.ts`
   - Fields: `id`, `date`, `time`, `partySize`, `firstName`, `lastName`, `email`, `phone`
2. Create `src/services/bookingService.ts` — stub with a single `submitBooking(booking: Booking): Promise<void>` that resolves immediately (replace with real API in P3)
3. Generate the 30-minute time slot array as a typed constant in `src/data/timeSlots.ts`

## Group 2 — Form field components

4. `DateInput` — date picker constrained to today onwards; wraps `<input type="date">` with validation state props
5. `TimeSelect` — dropdown that renders the 30-min time slot options
6. `PartySizeInput` — number input or +/− stepper, clamped to 1–20
7. `ContactFields` — renders first name, last name, email, phone inputs with error messages

## Group 3 — Booking form page

8. `BookingFormPage` — composes all field components into a single `<form>`
9. Wire client-side validation: validate on submit, display per-field error messages, block submission while invalid
10. On valid submit: call `bookingService.submitBooking`, then transition to confirmation screen
11. Responsive layout: single column on mobile, two-column field grid on desktop

## Group 4 — Confirmation screen

12. `BookingConfirmationPage` (or conditional render within `BookingFormPage`) — shows a summary of the submitted booking details and a "Back to home" link
13. Ensure the confirmation screen is not reachable by direct URL navigation (no booking data → redirect to form)

## Group 5 — Integration & polish

14. Add route for `/booking` and `/booking/confirmation` in `App.tsx` (or equivalent router config)
15. Add a "Book a Table" call-to-action on the Flavor Catalog page linking to `/booking`
16. Run `pnpm lint` and `pnpm tsc --noEmit`; fix any issues
17. Manual validation pass against `validation.md` checklist
18. Commit and open PR
