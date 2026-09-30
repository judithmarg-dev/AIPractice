# Tech Stack

## Current (front-end only)

| Layer     | Choice                | Notes                                                         |
| --------- | --------------------- | ------------------------------------------------------------- |
| Framework | Vite + React          | Fast dev loop, no SSR needed while back-end is absent         |
| Language  | TypeScript            | End-to-end type safety from day one                           |
| Styling   | Tailwind CSS          | Utility-first; aligns with Mary's "popular stack" requirement |
| State     | React Context / hooks | Sufficient for front-end-only phases                          |

## Planned (when back-end is added)

| Layer      | Choice                              | Notes                                                   |
| ---------- | ----------------------------------- | ------------------------------------------------------- |
| Full-stack | Next.js 14 (App Router, RSC)        | Migration path from Vite is straightforward             |
| API        | Next.js Server Actions / API routes | Keeps TypeScript throughout                             |
| Database   | PostgreSQL via Prisma               | Reliable, relational; good fit for inventory & bookings |
| Auth       | NextAuth.js                         | Session-based, integrates cleanly with Next.js          |
| Deploy     | Vercel                              | Zero-config for Next.js; preview URLs per branch        |

## Guiding principle

Ship the front-end independently. Back-end layers are additive — no front-end rewrites required when each layer is introduced.
