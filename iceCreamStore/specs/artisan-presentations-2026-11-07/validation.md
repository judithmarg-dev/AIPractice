# Artesanales: Porciones y Por peso — Validation

## Merge bar

### 1. Automated checks
- `pnpm lint` y `pnpm tsc` sin errores.
- `pnpm verify` en verde (incluye la sección "Artesanales: porciones y por peso").
- `pnpm build` correcto.

### 2. Menú
| Scenario | Expected result |
|---|---|
| Ver el menú en móvil y escritorio | Las categorías se muestran en horizontal |
| Abrir Artesanales | Pestañas Porciones y Por peso; ambas listan los mismos sabores |

### 3. Porciones
| Scenario | Expected result |
|---|---|
| Tocar un sabor | Su scoop cae con animación sobre el barquillo en `section.order` |
| Tocar 3 sabores | Se apilan 3 scoops; un cuarto sabor queda deshabilitado |
| Tocar un sabor ya elegido | Se quita del barquillo |
| Agregar al pedido | Línea "Helado artesanal · N bolas"; precio = suma de bolas |
| Sistema con `prefers-reduced-motion` | Sin animación |

### 4. Por peso
| Scenario | Expected result |
|---|---|
| 1 kilo con 2 sabores | "Agregar al pedido" deshabilitado; mensaje pide 1 sabor más |
| 1 kilo con 3 a 6 sabores | Se puede agregar; precio fijo del kilo |
| ½ kilo | Permite 2 a 3 sabores; precio fijo del ½ kilo |
| Cambiar de 1 kilo a ½ kilo con 5 elegidos | Se conservan los 3 primeros |
| Sabor elegido | Check arriba a la derecha del scoop; sin animación |
| Cambiar de pestaña | La selección se reinicia |

### 5. Datos y staff
| Scenario | Expected result |
|---|---|
| Crear un sabor artesanal y elegir dibujo | Aparece con ese scoop en ambas pestañas, sin duplicarlo |
| Cambiar precio de kilo / ½ kilo en Ajustes | Nuevos pedidos usan el nuevo precio; los existentes no cambian |
| Ejecutar la migración sobre una base existente | Sin errores; los 4 sabores originales conservan dibujo |
| Cobrar una orden con kilo | Stock baja 1 por sabor; ganancia marcada como incompleta |
| Editar una línea de porción o peso | Los sabores vuelven al armador y la línea se quita |
