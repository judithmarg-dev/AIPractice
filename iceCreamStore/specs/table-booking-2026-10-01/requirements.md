# P2 — Table Booking: Requirements

## Scope

Staff can enter a table reservation on behalf of a customer using a front-end form. All data is stored in local React state only — no backend, no persistence.

### In scope
- Staff-side booking entry form: date, time (30-minute increments), party size, customer name, email, phone number
- Client-side validation on all fields
- Confirmation / success screen shown to staff after a valid submission
- Mobile-first layout: single-column form on phones; two-column field grid from ≥ 768 px; scales up to desktop

### Out of scope
- Real persistence or backend of any kind (deferred to P3)
- Email/SMS confirmation to the customer
- Booking cancellation or editing after submission
- Staff visibility into submitted bookings (deferred to P4)

## Form fields

| Field | Type | Validation |
|---|---|---|
| Date | Date picker | Required; must be today or a future date |
| Time | Dropdown (30-min increments, e.g. 10:00–21:30) | Required |
| Party size | Number input or stepper | Required; 1–20 |
| First name | Text | Required; non-empty |
| Last name | Text | Required; non-empty |
| Email | Text | Required; valid email format |
| Phone number | Text | Required; minimum 7 digits, digits/spaces/+/- allowed |

## Stub behaviour

On valid submission the form writes the booking object to React state (or a simple `console.log`) and transitions to the confirmation screen. The booking is not persisted — a page refresh discards it.

## Key decisions

| Decision | Choice | Rationale |
|---|---|---|
| Time slots | 30-minute increments | Balances flexibility with constraint; aligns with typical restaurant slot lengths |
| Contact fields | Email + phone | Enables both digital and voice follow-up in future phases |
| Validation library | Native HTML5 + custom React state | No new dependency at this scale; can migrate to react-hook-form in P3 |
| Stub target | Local React state | Keeps component testable and the API surface identical when real persistence is added |

## Audience alignment (mission.md)

This phase serves **staff** — they record customer reservations at the counter or over the phone. Owners gain visibility into those bookings starting in P4 when the order queue surfaces booking data.
