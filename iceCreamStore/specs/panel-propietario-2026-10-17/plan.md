# P6 — Panel del propietario: Plan de implementación

Orden recomendado. Cada grupo deja la app funcionando. No empieces un grupo sin haber cerrado sus dependencias. Los identificadores `RF-x.x` remiten a `requirements.md`.

## Grupo 0 — Fundamentos (RF-0.x)

Dependencias: ninguna. Todo lo demás se apoya en este grupo.

1. Crear `src/lib/money.ts`: `formatMoney(cents)`, `toCents(dollars)`, `percentOf(cents, pct)` con redondeo al centavo.
2. Crear el módulo de textos en español y poner `<html lang="es">` y el título de la pestaña en `index.html`.
3. Crear el slice `settings` con los valores por defecto de RF-0.6 y la pantalla `/staff/ajustes`.
4. Crear el conjunto de íconos (`src/components/icons/`) y el selector de íconos en tarjetas.
5. Persistencia: middleware o suscripción que guarda `inventory`, `categories`, `options`, `order`, `bookings`, `settings` bajo `ics-state-v1`, con `version` y función de migración. Manejar fallos de `localStorage` con un aviso discreto.
6. Migrar el estado actual: `price` de dólares a `priceCents`, `snake_case` a `camelCase`, `container` de texto a `defaultContainerId`.
7. Actualizar la navegación de staff (RF-0.5) y la redirección de `/staff/analytics`.

## Grupo 1 — Categorías (RF-1.x)

Dependencias: grupo 0.

8. Slice `categories` con la semilla y los selectores `selectActiveCategories` (ordenadas) y `selectCategoryById`.
9. Reemplazar la constante `CATEGORIES` de `src/types/flavor.ts` por datos de Redux. Eliminar `isFlavorCategory` y `categoryLabel` basados en constantes.
10. Pantalla `/staff/categorias`: lista en tarjetas, crear, editar, subir y bajar, archivar con la regla de RF-1.4.
11. Diálogo "Nueva categoría" reutilizable y su uso en el formulario de productos.
12. Menú dinámico: `FlavorCatalogPage` y `MenuSidebar` leen las categorías de Redux. Crear la categoría `Otros` en la migración si hay productos huérfanos.

## Grupo 2 — Opciones (RF-2.x)

Dependencias: grupo 0.

13. Slice `options` con la semilla de ejemplo y los selectores por tipo y disponibilidad.
14. Pantalla `/staff/opciones` con tres secciones en tarjetas. Crear, editar, ocultar y eliminar con confirmación.
15. Convertir los envases en texto libre de productos existentes a envases del catálogo con precio 0.

## Grupo 3 — Productos (RF-3.x)

Dependencias: grupos 1 y 2.

16. Actualizar `InventoryForm`, `NewItemPage` y `EditItemPage`: precio con etiqueta contextual, costo, color con selector, envase por defecto, categoría dinámica.
17. Utilidad `compressImage(file)` (canvas, 512 px, WebP o JPEG 0.8) con manejo de errores. Usarla en el formulario.
18. Mostrar y bloquear "Agotado" en `FlavorTile` y en las rutas de agregado.
19. (S) Ajuste rápido de stock en `InventoryPage`.

## Grupo 4 — Modelo de pedido (RF-5.1, 5.2, 5.6, 5.7)

Dependencias: grupos 0 y 3. Es la base de modal, cola y dashboard.

20. Reescribir `orderSlice`: `draft` (borrador), `orders` (`por_cobrar`, `cobrado`, `cancelado`), `nextNumber`. Reducers: `addLine`, `updateLine`, `setLineQty`, `removeLine`, `setMode`, `setMeta`, `clearDraft`, `saveToQueue`, `chargeDraft`, `chargeOrder`, `cancelOrder`, `loadForEdit`, `saveEdit`, `discardEdit`.
21. Funciones puras de cálculo en `src/lib/orderMath.ts`: precio de línea, totales, costos (secciones 8.1 a 8.3).
22. Reglas de stock (8.5) como funciones puras que reciben el pedido anterior y el nuevo y devuelven las diferencias. Aplicarlas desde un thunk o desde reducers que también actualizan `inventory`.
23. Validación previa de stock con mensaje por producto (RF-5.7).
24. Instantáneas de línea al salir de borrador (RF-5.2).

## Grupo 5 — Modal de armado (RF-4.x)

Dependencias: grupos 2, 3 y 4.

25. Componente base `Dialog` accesible (rol, foco atrapado, Escape, devolver foco, hoja inferior en móvil y diálogo centrado desde 768 px). Reutilizable para confirmaciones.
26. Componente `OptionCard` (radio o checkbox, ícono, título, precio, estado elegido, estado deshabilitado).
27. `BuildModal`: cabecera, bolas adicionales con control de cantidad y topes por stock y máximo, envase, extras, toppings, pie con cantidad y botón con total en vivo.
28. Disparador en `FlavorCatalogPage`: categorías armables abren el modal, el resto el panel lateral (con el texto "Agregar al pedido").
29. Edición de línea: botón "Editar" en `OrderPanel` que reabre el modal precargado.
30. Mostrar el detalle de la línea armada en `OrderPanel`.

## Grupo 6 — Panel de orden (RF-5.3 a 5.5)

Dependencias: grupo 4.

31. Adaptar `OrderPanel` al nuevo `orderSlice`: botones con confirmación, "Guardar en espera" que envía a la cola, vaciar con confirmación.
32. Campos opcionales plegables: cliente, nota y dirección (solo delivery).
33. Insignia de pedidos por cobrar en las dos barras de navegación.
34. Aviso de confirmación con enlace a la cola.

## Grupo 7 — Cola del mostrador (RF-6.x)

Dependencias: grupos 4, 5 y 6.

35. Página `/staff/cola` con franja de totales, filtros y la cuadrícula de tarjetas.
36. `QueueCard` con el detalle completo y las acciones Cobrar, Editar y Cancelar.
37. Hook `useNow(30000)` para refrescar la antigüedad y los umbrales ámbar y rojo.
38. Flujo de edición: `loadForEdit` en `/` con la franja "Editando Orden #N", y el diálogo de conflicto cuando ya hay un borrador.
39. Estado vacío.
40. (C) Escuchar `storage` para refrescar entre pestañas.

## Grupo 8 — Datos de demostración y selectores (RF-0.4, 7.x)

Dependencias: grupo 4.

41. Generador determinista de pedidos de demostración (semilla fija) con horas pico, ambos servicios, estacionalidad semanal y costos.
42. Botones de carga y borrado de datos de demostración. Marcar con `demo: true` y restaurar el stock al borrar.
43. Selectores memoizados en `src/lib/dashboard.ts`: período y período anterior, indicadores, serie por hora y por día, top de productos, sabor estrella, reparto por servicio, alertas de stock, cobertura en días.
44. Pruebas de los selectores con los números de `validation.md`.

## Grupo 9 — Dashboard (RF-7.1 a 7.6)

Dependencias: grupo 8.

45. Página `/staff/dashboard` y retiro de la página de analítica de reservas.
46. Selector de período con navegación y etiqueta legible.
47. Tarjetas de indicador con mini gráfico y variación.
48. Gráficos con Recharts, uno por componente: tendencia, horaria, top de demanda, sabor estrella, servicio, alertas de stock, abastecimiento.
49. Estados vacíos, resúmenes accesibles (`role="img"` y texto oculto) y tooltips con foco.
50. Diseño responsive: una columna en móvil, dos desde 768 px, tres desde 1024 px.

## Grupo 10 — Exportaciones (RF-7.7, 7.8)

Dependencias: grupo 9.

51. Exportador CSV: resumen y detalle, con BOM, escape de fórmulas y nombres de archivo del requisito.
52. Exportador PDF: instalar `jspdf` y `html2canvas` o `html-to-image`; capturar el contenedor del dashboard en tema claro, paginar sin cortar gráficos, cabecera con período y fecha. Nombre de archivo del requisito.
53. Menú de exportación con las tres opciones.

## Grupo 11 — Cierre (Épica 8)

Dependencias: todo lo anterior.

54. Español en toda la app: login, reservas, páginas de staff, validaciones, vacíos, `aria-label`, PDF y CSV. Buscar con `grep` textos en inglés restantes.
55. Actualizar `DESIGN.md` (RF-8.1), `PRODUCT.md` y `specs/mission.md` (RF-8.2).
56. Pasada de accesibilidad y responsive: 360, 375, 768 y 1280 px, tema claro y oscuro.
57. `pnpm tsc`, `pnpm lint` y la lista completa de `validation.md`.

## Riesgos y cómo cubrirlos

| Riesgo | Mitigación |
|---|---|
| Cuota de `localStorage` (≈ 5 MB) con imágenes en data URL | Compresión a 512 px en RF-3.2 y aviso si el guardado falla |
| El PDF corta gráficos o sale borroso | Capturar con escala 2, forzar tema claro y paginar por bloques de gráfico |
| Cambiar la forma de los datos rompe lo guardado | Versión en `ics-state-v1` y migración probada con el estado actual |
| Errores de redondeo en dinero | Solo centavos enteros y redondeo único del IVA |
| Stock inconsistente al editar o cancelar | Diferencias calculadas por una función pura y probada |
| Dashboard lento con muchos pedidos | Selectores memoizados y agregación en una sola pasada |
