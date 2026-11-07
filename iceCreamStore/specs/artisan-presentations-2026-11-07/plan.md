# Artesanales: Porciones y Por peso — Implementation Plan

## Group 1 — Datos
1. `types/models.ts`: `Product.sprite`, `LineBuild.presentation`/`pack`, `Settings.kiloPriceCents`/`halfKiloPriceCents`; quitar `subgroupId`.
2. `supabase/migrations/001_initial.sql` y `store/remoteRows.ts`: columnas nuevas, drop de `subgroup_id`.
3. `store/seed.ts` y `data/flavors.json`: precios por defecto, sprite en los sabores y 16 sabores nuevos.

## Group 2 — Lógica
4. `lib/scoopSprites.ts`: tabla de 20 sprites, fallback por id, recorte con transparencia.
5. `lib/presentations.ts` (reemplaza `lib/subgroups.ts`): pestañas y `PACK_RULES`.
6. `lib/orderMath.ts`: precio fijo por `pack`, costo incompleto, descripción de línea.
7. `store/slices/packSlice.ts`: modo, peso, sabores, límites; registrado en el store.

## Group 3 — UI
8. `ScoopSprite`, `FlavorTile` (sprite, check, estado deshabilitado), `PackBuilder` (cono animado / lista sin animación), integrado en `OrderPanel`.
9. `FlavorCatalogPage`: pestañas, selector de peso, tiles como toggles, barra de orden con selección pendiente, edición de líneas.
10. `ProductForm` (selector de dibujo) y `SettingsPage` (precios kilo y ½ kilo).
11. `catalog.css`: cono, `scoop-drop`, `check-pop`, `prefers-reduced-motion`.

## Group 4 — Cierre
12. `scripts/verify.ts`: precios, stock, límites de sabores.
13. `pnpm lint`, `pnpm tsc`, `pnpm verify`, `pnpm build`.
14. Validación manual contra `validation.md`; correr la migración en Supabase.
