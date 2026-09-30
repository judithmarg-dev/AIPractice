# P0 — Skeleton: Validation

All checks below must pass before the PR is merged to `main`.

---

## 1. Dev server starts

```
pnpm dev
```

- Browser opens without console errors
- Page renders (Tailwind utility class visible — e.g. a coloured background or text)

## 2. Lint passes

```
pnpm lint
```

- Exit code 0, no errors or warnings

## 3. Type-check passes

```
pnpm tsc --noEmit
```

- Exit code 0, no type errors

## 4. Format check passes

```
pnpm format:check
```

- Exit code 0 (all files already formatted or formatting was run before commit)

## 5. Path alias resolves

- `App.tsx` (or any file) imports via `@/` (e.g. `import something from '@/types/index'`)
- `tsc --noEmit` still passes — confirms the alias is wired in `tsconfig.app.json`
- `pnpm dev` still runs — confirms the alias is wired in `vite.config.ts`

## 6. Folder structure exists

```
src/pages/
src/components/
src/hooks/
src/types/
```

All four directories present in the repo (`.gitkeep` files committed).

## 7. GitHub Actions CI is green

- Push the branch or open the PR
- The `ci` workflow (lint + type-check) appears in the GitHub Actions tab
- All steps complete with a green checkmark

## 8. PR review checklist

- [ ] No product UI code introduced (scope boundary)
- [ ] No back-end dependencies added
- [ ] `README.md` updated with dev/lint/type-check commands
- [ ] All 7 checks above pass on the CI run for the PR head commit
