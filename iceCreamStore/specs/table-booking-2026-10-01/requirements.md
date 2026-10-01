# P2 — Table Booking: Requirements

## Scope

Customers can reserve a table using a front-end form. All data is stored in local React state only — no backend, no persistence.

### In scope
- Booking form: date, time (30-minute increments), party size, name, email, phone number
- Client-side validation on all fields
- Confirmation / success screen shown after a valid submission
- Responsive layout: mobile and modern desktop

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

This phase serves **clients** — they can express intent to visit. Owners gain no new visibility here; that comes in P4 when the order queue surfaces booking data.
