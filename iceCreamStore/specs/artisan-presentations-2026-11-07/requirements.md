# Artesanales: Porciones y Por peso — Requirements

## Scope

Dentro de la categoría **Artesanales** del menú, el cliente arma su helado en una de dos presentaciones. Las dos usan **el mismo catálogo de sabores**.

### In scope
- Menú de categorías horizontal (`menu-tabs--category`). Ya lo estaba tras el commit `e301915`; no requirió cambios.
- Pestañas de Artesanales: **Porciones** y **Por peso** (antes "Opción 1 / Opción 2").
- **Porciones:** barquillo con 1 a 3 sabores. Cada sabor cae con animación sobre el barquillo en `section.order`; los scoops se apilan.
- **Por peso:** 1 kilo (3 a 6 sabores) o ½ kilo (2 a 3 sabores). Sin animación; cada scoop elegido muestra un check arriba a la derecha.
- Los scoops se dibujan con los sprite sheets `src/assets/scoops1.jpeg` y `scoops2.jpeg` (20 sabores).
- Catálogo único de sabores: ningún sabor se duplica por presentación.

### Out of scope
- Límites de sabores en el backend: se validan solo en el frontend (decisión explícita).
- Extras, toppings y envase en las nuevas presentaciones (el modal `BuildModal` sigue para otras categorías con bolas y líneas antiguas).
- Costo por kilo.

## Key decisions

| Decision | Choice | Rationale |
|---|---|---|
| Un solo catálogo | Se elimina `products.subgroup_id`; se agrega `products.sprite` | Asignar cada sabor a una pestaña obligaba a duplicarlo para usarlo en ambas |
| Dibujo del sabor | `sprite` = id de celda (`s1-7` = hoja 1, celda 7), elegido en el formulario de producto | Un sabor = un dibujo; sabores antiguos usan un fallback por id (`lib/scoopSprites.ts`) |
| Recorte de sprites | En el navegador: canvas + relleno desde el borde que vuelve transparente el blanco; `s1-9` (coco) usa umbral estricto | Los JPEG tienen fondo blanco; hace falta transparencia para apilar |
| Estado del armado | Slice `pack` en memoria (`mode`, `weight`, `flavorIds`), no persistido | Es efímero; lo leen el catálogo (tiles) y el panel de orden (`PackBuilder`) |
| Límites | Constantes en `lib/presentations.ts` (`PACK_RULES`) | Solo frontend |
| Precio porción | Suma del precio de cada bola | Igual que el modelo existente |
| Precio por peso | Fijo: `store_settings.kilo_price_cents` ($18.00) y `half_kilo_price_cents` ($10.00), editables en Ajustes | Precio independiente del número de sabores |
| Stock | 1 unidad por sabor y por cantidad de líneas (también por peso) | Reusa `stockUsage` |
| Costo por peso | Marcado como "incompleto" | No hay costo configurado por kilo |
| Línea de pedido | `LineBuild.presentation` (`porcion`/`peso`) y `LineBuild.pack` (`kilo`/`medio` + precio congelado) | Mantiene precios congelados; los pedidos viejos siguen válidos |
| Editar línea | Devuelve la selección al armador y quita la línea | El modal no sirve para estas líneas |

## Audience alignment (mission.md)

Cliente que arma su pedido en caja/menú y staff que administra sabores (dibujo) y precios por peso.

## Migración (Supabase)

Volver a ejecutar `supabase/migrations/001_initial.sql` (idempotente): agrega `products.sprite`, `store_settings.kilo_price_cents` y `half_kilo_price_cents`, asigna sprite a los 4 sabores existentes y elimina `products.subgroup_id`.
