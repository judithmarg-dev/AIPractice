# P0 — Skeleton: Requirements

## Scope

Set up a runnable, consistently formatted repo with shared conventions and a passing CI pipeline. No product features are delivered in this phase — every subsequent phase builds on this foundation.

## Deliverables

| # | Item | Detail |
|---|------|--------|
| 1 | Vite + React + TypeScript scaffold | Already bootstrapped; confirm it runs (`pnpm dev`) |
| 2 | Tailwind CSS | Install and configure; verify utility classes render in `App.tsx` |
| 3 | Prettier | Install + `.prettierrc`; wired into ESLint via `eslint-config-prettier` so rules don't conflict |
| 4 | Path alias `@/*` → `src/*` | Configured in both `vite.config.ts` and `tsconfig.app.json` |
| 5 | Folder structure | Create `src/pages/`, `src/components/`, `src/hooks/`, `src/types/` with `.gitkeep` |
| 6 | GitHub Actions CI | Single workflow: `pnpm lint && tsc --noEmit` on every push and pull request to `main` |

## Out of scope

- Any product UI (flavor catalog, booking form, etc.) — that's P1 and P2
- Back-end, database, or auth — those begin at P3
- Prettier format enforcement on historical commits (format only going forward)

## Key decisions

| Decision | Choice | Reason |
|----------|--------|--------|
| Path alias style | `@/*` → `src/*` | Industry standard; works with Vite and TypeScript out of the box |
| Formatter | Prettier alongside ESLint | Separates formatting from linting; reduces ESLint rule noise (Mary's "reliable stack" requirement) |
| CI checks | lint + type-check only | Build failures are rare at this stage; keeps the feedback loop fast |
| CI provider | GitHub Actions | Project already hosted on GitHub; zero additional tooling |

## Stakeholder context

- **Mary (engineering):** wants a TypeScript-first stack with solid tooling from the start — Prettier + ESLint + type-check CI satisfies this.
- **Steve (marketing):** no direct concern at P0, but the folder structure must support a clean component hierarchy for the responsive layouts he expects in P1.
- **Susan (product):** no deliverable at P0; she reviews P1 features.
