# P0 — Skeleton: Plan

Numbered task groups, each independently committable.

---

## Group 1 — Tailwind CSS

1. Install `tailwindcss`, `@tailwindcss/vite` (Tailwind v4 Vite plugin)
2. Add the Vite plugin to `vite.config.ts`
3. Replace `src/index.css` with a Tailwind v4 import (`@import "tailwindcss"`)
4. Smoke-test: add a Tailwind utility class to `App.tsx` and confirm it renders in `pnpm dev`

## Group 2 — Prettier

5. Install `prettier`, `eslint-config-prettier`
6. Create `.prettierrc` (sensible defaults: `semi: false`, `singleQuote: true`, `printWidth: 100`)
7. Extend `eslint.config.js` with `eslint-config-prettier` to disable conflicting rules
8. Add `"format": "prettier --write ."` and `"format:check": "prettier --check ."` scripts to `package.json`

## Group 3 — Path alias `@/*`

9. Add `resolve.alias` in `vite.config.ts`: `{ '@': path.resolve(__dirname, 'src') }`
10. Add `paths: { "@/*": ["./src/*"] }` under `compilerOptions` in `tsconfig.app.json`
11. Verify by importing something with `@/` in `App.tsx` and confirming TypeScript resolves it

## Group 4 — Folder structure

12. Create `src/pages/.gitkeep`
13. Create `src/components/.gitkeep`
14. Create `src/hooks/.gitkeep`
15. Create `src/types/.gitkeep`

## Group 5 — GitHub Actions CI

16. Create `.github/workflows/ci.yml`
    - Trigger: `push` and `pull_request` targeting `main`
    - Steps: checkout → setup Node (LTS) → install pnpm → `pnpm install` → `pnpm lint` → `pnpm tsc --noEmit`
17. Push branch and confirm the workflow appears green in GitHub Actions

## Group 6 — Wrap-up

18. Update `README.md` with: how to run dev server, how to run lint, how to run type-check
19. Open pull request from `feature/p0-skeleton` → `main`
