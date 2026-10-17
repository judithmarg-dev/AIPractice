# P6 — Panel del propietario: Requisitos

> Documento para el implementador. Léelo completo antes de escribir código. Es autosuficiente: lo que no esté aquí, o en `DESIGN.md`, se resuelve con el código existente y no se inventa.

## 0. Instrucciones para el implementador

1. **Lecturas obligatorias, en este orden:** este archivo, `DESIGN.md` (sistema visual vigente), `specs/mission.md`, la tabla "Decision log" de `specs/roadmap.md`.
2. **No rehagas lo que ya existe.** La sección 3 lista qué hay y qué falta. Extiende, no reemplaces, salvo donde esta spec lo indique.
3. **Entrega por épicas** en el orden de `plan.md`. Cada épica debe quedar funcionando y verificable por sí sola.
4. **Todo texto visible al usuario va en español** (sección 9.1). Los identificadores de código se mantienen en inglés, como hoy.
5. **Diseño:** mobile-first y muy cercano a https://www.starbucks.com/menu, tal como define `DESIGN.md`. No introduzcas colores nuevos fuera de los tokens (sección 9.2).
6. **Antes de dar una épica por terminada:** `pnpm tsc`, `pnpm lint` y la verificación en navegador a 375, 768 y 1280 px, en modo claro y oscuro (ver `validation.md`).
7. **Cuando algo sea ambiguo,** aplica el valor por defecto de la sección 4 y déjalo anotado en el mensaje final. No bloquees el trabajo por eso.

## 1. Objetivo

Completar IceCreamStore como la herramienta de trabajo del **dueño de la heladería**: tomar pedidos en el mostrador con un menú al estilo Starbucks, armar helados artesanales con opciones, controlar la cola de pedidos por cobrar y entender el negocio en un dashboard visual exportable.

Resultado esperado: el dueño puede abrir la app por la mañana, cobrar pedidos todo el día, reponer lo que se agota y, por semana, por mes o por día, ver cuánto ganó, qué se vende más y cuándo.

## 2. Usuario y contexto

- **Usuario principal: el dueño (propietario) de la tienda.** Usa la app en el mostrador, sobre todo en tablet o teléfono, con una mano libre y poco tiempo. Cada acción frecuente debe costar pocos toques.
- **Usuario secundario: personal del mostrador,** con el mismo acceso (una sola cuenta mock, como hoy).
- Los clientes **no** usan la app. La vista de menú existe para tomar pedidos, no para autoservicio.
- Sin backend: todo vive en el navegador (sección 9.3).

> Conflicto documental a resolver en la épica 8: `PRODUCT.md` todavía describe a los clientes como usuario principal. Esta spec manda: actualizar `PRODUCT.md` y `specs/mission.md` al foco en el propietario.

## 3. Estado actual del proyecto (punto de partida)

| Área | Ya existe | Falta o cambia |
|---|---|---|
| Menú | `/` con header sticky, sub-nav, barra de categorías, secciones con tiles circulares, tema claro/oscuro, mobile-first | Categorías fijas en código; todo se arma desde Redux |
| Categorías | 4 fijas en `src/types/flavor.ts` (artesanal, paleta, milkshake, bebida) | Crear, editar, ordenar y archivar categorías |
| Productos | Redux `inventory`: nombre, descripción, categoría, precio, imagen (data URL), envase como texto libre, stock; formulario crear/editar | Costo, envase por defecto desde catálogo, imagen comprimida, stock que se descuenta |
| Armado artesanal | Panel lateral con selector de 1 a 3 bolas del mismo sabor | Modal con bolas de otros sabores, envase, extras y toppings |
| Pedido actual | Panel "Orden #N": Presencial o Delivery (+$0.30), líneas con cantidad, totales con IVA 10 %, botones Cobrar, Guardar en espera y Vaciar | Estados de pedido, cola, edición, instantáneas de precio, stock |
| Cola | Lista `held` en Redux sin pantalla | Pantalla "Cola del mostrador" |
| Dashboard | `/staff/analytics`: gráficos de reservas, en inglés | Dashboard de ventas, comparativas, señales de abastecimiento, PDF y CSV |
| Reservas | `/booking` y `/staff/bookings` | Se conservan; ver decisión D5 |
| Persistencia | Ninguna: se pierde al recargar | `localStorage` versionado y datos de demostración |
| Idioma | Menú y panel de orden en español; staff, login y reservas en inglés | Español en toda la app |

## 4. Decisiones y supuestos

Estas decisiones resuelven huecos de la petición original. El implementador las aplica tal cual. El propietario puede cambiarlas después sin rehacer la arquitectura.

| Id | Decisión (valor por defecto) | Por qué importa |
|---|---|---|
| D1 | **Ingresos** = ventas netas **sin IVA** (subtotal + recargo de delivery) de pedidos cobrados. El **total cobrado con IVA** se muestra como dato secundario. | El IVA no es ganancia del negocio. |
| D2 | **Ganancia** = ingresos − costos. El **costo** es un campo opcional por producto y por opción. Si faltan costos, se muestra la ganancia con la etiqueta "costos incompletos". | La petición pide "ingresos o ganancias" pero no existía el costo. |
| D3 | Los precios de envases, extras y toppings son un campo `precio` en su catálogo. No hay inventario para ellos ni precio libre al momento del pedido. | La petición: "solo agrega un field para colocar un precio". |
| D4 | El **stock** de un producto se descuenta cuando el pedido pasa a `por_cobrar` o se cobra directo. Se ajusta al editar y se devuelve al cancelar. Cada bola consume 1 unidad del sabor elegido. | El "agotado" debe reflejar el mostrador en tiempo real. |
| D5 | Las **reservas** se conservan sin cambios (páginas y lista) y quedan fuera del dashboard. El gráfico de reservas actual se retira. | El dashboard es de ventas. |
| D6 | `/` (menú y toma de pedidos) sigue sin login. Cola, dashboard, inventario, categorías, opciones y ajustes van tras `AuthGuard`. | No romper el flujo actual. |
| D7 | El **máximo de bolas** por helado artesanal es 3 y se puede cambiar en Ajustes. | Coincide con el selector actual de 1 a 3. |
| D8 | Moneda USD con formato `$0.00` (punto decimal), como en el diseño de referencia del panel de orden. | Evita formatos regionales distintos al mock. |
| D9 | **Fuera de alcance:** método de pago, impresión de tickets, clientes registrados, multiusuario, sincronización entre dispositivos. | Mantener el alcance entregable. |
| D10 | "Pedido" y "orden" son el mismo objeto. En la interfaz: título `Orden #N` (como en el diseño) y botón `Agregar al pedido` (como se pidió). | Respeta el texto literal de la petición y del mock. |

## 5. Glosario

- **Artesanal / armable:** categoría cuyos productos se arman por bolas en el modal. `Artesanales` es la predefinida.
- **Bola:** unidad de helado artesanal. Tiene precio y consume stock del sabor.
- **Base:** el sabor que el dueño toca en el menú. Es la primera bola del helado.
- **Envase de presentación:** recipiente (barquillo, vaso). Opcional.
- **Extra / topping:** adicionales con precio. Se eligen en el modal.
- **Cola del mostrador:** pedidos en estado `por_cobrar`.
- **Período:** día, semana (lunes a domingo) o mes calendario, en hora local.

## 6. Requisitos funcionales

Prioridad: **M** = obligatorio, **S** = debería, **C** = podría. Cada requisito lleva sus criterios de aceptación.

### Épica 0 — Fundamentos

**RF-0.1 (M) Español en toda la app.** Ver 9.1.

**RF-0.2 (M) Persistencia local.** Los slices `inventory`, `categories`, `options`, `order`, `bookings` y `settings` se guardan en `localStorage` bajo la clave `ics-state-v1`.
- Al recargar la página, el estado se recupera idéntico.
- El estado guardado lleva un número de versión. Si cambia la forma de los datos, existe una migración que conserva lo guardado.
- Ajustes incluye "Restablecer datos de la tienda", con confirmación, que borra todo y vuelve a la semilla.
- Si `localStorage` falla (modo privado o cuota llena), la app sigue funcionando en memoria y muestra un aviso discreto.

**RF-0.3 (M) Dinero en centavos.** Todo cálculo usa enteros en centavos. Un único `formatMoney(cents)` produce `$0.00`. Prohibido sumar decimales de punto flotante.

**RF-0.4 (M) Datos de demostración.** En Ajustes y en el estado vacío del dashboard hay "Cargar datos de demostración".
- Genera al menos 60 días de pedidos cobrados, con horas pico (mediodía y tarde), ambos modos de servicio, todos los productos y algunas variaciones entre semanas.
- Cada pedido de demostración lleva `demo: true`.
- Mientras existan, el dashboard muestra el aviso "Mostrando datos de demostración".
- "Borrar datos de demostración" elimina solo esos pedidos y restaura el stock inicial de los productos sin tocar el resto.

**RF-0.5 (M) Navegación del propietario.**
- Barra pública: `Menú`, `Reservar`, acceso a staff.
- Navegación de staff: `Dashboard`, `Cola`, `Inventario`, `Categorías`, `Opciones`, `Reservas`, `Ajustes`.
- `Cola` muestra una insignia con el número de pedidos por cobrar, en ambas barras.
- `/staff/analytics` redirige a `/staff/dashboard`.

**RF-0.6 (M) Ajustes** (`/staff/ajustes`). Campos: IVA (%, por defecto 10), recargo de delivery ($, por defecto 0.30), umbral de stock bajo (unidades, por defecto 5), máximo de bolas (por defecto 3), minutos para alerta ámbar y roja en la cola (por defecto 15 y 30). Más las acciones de datos de RF-0.2 y RF-0.4.

**RF-0.7 (M) Íconos.** Conjunto propio de al menos 24 íconos SVG en línea (cono, vaso, barquillo, paleta, batido, botella, café, fresa, limón, chocolate, chispas, nuez, salsa, crema, galleta, estrella, corazón, etc.), que usan `currentColor`. Se eligen con un selector de tarjetas. Sin librerías de íconos nuevas.

### Épica 1 — Categorías dinámicas

**RF-1.1 (M) Modelo y semilla.** Las categorías viven en Redux (`categories`). Semilla: `Artesanales` (armable, protegida), `Paletas`, `Milkshakes`, `Bebidas`, cada una con ícono.

**RF-1.2 (M) Crear categoría.** Pantalla `/staff/categorias` con lista y botón "Nueva categoría". Campos: nombre, ícono, interruptor "Se arma por bolas" (apagado por defecto).
- El nombre es obligatorio, de 2 a 30 caracteres, y único sin distinguir mayúsculas ni tildes.
- La categoría creada aparece de inmediato en el menú, en el formulario de productos y en los filtros del dashboard.

**RF-1.3 (M) Crear desde el formulario de producto.** El selector de categoría ofrece "＋ Nueva categoría", que abre un diálogo corto con los mismos campos y deja la nueva categoría seleccionada.

**RF-1.4 (M) Editar, ordenar y archivar.**
- Se pueden cambiar nombre, ícono y el interruptor de armable (salvo en la protegida).
- El orden se cambia con botones subir y bajar. Ese orden define el del menú.
- Una categoría solo se archiva si no tiene productos activos. `Artesanales` no se archiva.

**RF-1.5 (M) Menú dinámico.** Barra de categorías y secciones del menú se generan desde `categories`, en su orden, y solo muestran categorías con al menos un producto activo.

**RF-1.6 (M) Migración.** Productos con una categoría desconocida pasan a una categoría `Otros` creada automáticamente.

### Épica 2 — Opciones: envases, extras y toppings

**RF-2.1 (M) Catálogo.** Tres tipos de opción: `envase`, `extra`, `topping`. Campos: nombre, ícono, **precio** (≥ 0, dos decimales; 0 significa "incluido"), costo opcional y un interruptor "Disponible".

**RF-2.2 (M) Pantalla** `/staff/opciones` con tres secciones (una por tipo), en tarjetas con ícono y título, no en tabla. Crear, editar, ocultar (no disponible) y eliminar (con confirmación; las líneas de pedidos pasados no se afectan por las instantáneas de RF-5.2).

**RF-2.3 (M) Semilla de ejemplo,** editable y marcada como ejemplo en la interfaz de Ajustes: envases (barquillo dulce, barquillo salado, vaso de cartón, vaso compostable 500 ml), extras (salsa de chocolate, crema batida, galleta), toppings (chispas, nueces, grageas). Los envases que hoy son texto libre en productos se convierten en envases del catálogo con precio 0.

**RF-2.4 (M) Sin inventario.** Las opciones no tienen stock ni se descuentan.

### Épica 3 — Productos

**RF-3.1 (M) Formulario de producto.** Campos: nombre, descripción, categoría (RF-1.3), **precio** (la etiqueta cambia a "Precio por bola" si la categoría es armable), **costo** opcional, stock, imagen opcional, color de respaldo (selector de color, no texto hexadecimal) y **envase por defecto** opcional elegido del catálogo.

**RF-3.2 (M) Imagen.** Solo archivos de imagen. Antes de guardar se reduce a 512 px por el lado mayor y se comprime a WebP o JPEG (calidad ≈ 0.8) para no agotar la cuota de `localStorage`. Si el archivo no es imagen o falla la compresión, se muestra un error claro en español. Sin imagen, se usa el color de respaldo con el ícono de cono, como hoy.

**RF-3.3 (M) Estado agotado.** Un producto con stock 0 muestra "Agotado" en el menú y no puede agregarse al pedido. En el modal del armado sigue visible pero deshabilitado (RF-4.4).

**RF-3.4 (S) Ajuste rápido de stock** con − y + en la lista de inventario.

### Épica 4 — Modal de armado artesanal

**RF-4.1 (M) Disparador.** Tocar un producto de una categoría armable (o Enter o Espacio con foco) abre el modal. En las demás categorías se mantiene el panel lateral actual con cantidad y "Agregar al pedido".

**RF-4.2 (M) Comportamiento del modal.** `role="dialog"` con `aria-modal="true"` y título asociado. Cierra con Escape, con el botón de cierre y con el fondo. Atrapa el foco y lo devuelve al elemento que lo abrió. En móvil es una hoja inferior de hasta 92 % de la altura. Desde 768 px es un diálogo centrado de ancho máximo 720 px. El cuerpo hace scroll y el pie queda fijo.

**RF-4.3 (M) Cabecera.** Imagen o ícono del sabor base, nombre, descripción y "Base · $X.XX por bola".

**RF-4.4 (M) Bolas adicionales (opcional).** Cuadrícula de tarjetas con todos los productos activos de la misma categoría armable.
- Cada tarjeta muestra ícono o imagen, nombre y precio `+$X.XX`.
- Un sabor agotado se ve atenuado, con la etiqueta "Agotado", y no se puede elegir (`aria-disabled`).
- Al tocar una tarjeta se agrega una bola y aparece un control de cantidad (− n +). Se puede repetir un sabor mientras alcance el stock; el stock disponible del sabor base descuenta la bola base.
- Total de bolas (base incluida) ≤ máximo de bolas de Ajustes. Al llegar al máximo, las demás tarjetas se deshabilitan con el texto "Máximo alcanzado".
- Una fila resumen muestra el orden de las bolas: "1. Pistacho (base) · 2. Dulce de leche".

**RF-4.5 (M) Envase.** Selección única, en tarjetas con ícono, título y precio (`+$0.50` o "Incluido"). Viene preseleccionado el envase por defecto del producto. Existe la tarjeta "Sin envase".

**RF-4.6 (M) Extras y toppings.** Dos secciones de selección múltiple, en tarjetas con ícono, título y precio. Una tarjeta elegida muestra anillo de acento y marca de verificación; no depende solo del color. Cada sección se oculta si no hay opciones disponibles.

**RF-4.7 (M) Tarjetas accesibles.** Cada tarjeta es un `radio` o un `checkbox` real (o `role` equivalente), se opera con teclado y tiene foco visible.

**RF-4.8 (M) Pie y total.** Control de cantidad del helado armado (1 a 20) y el botón primario **"Agregar al pedido · $X.XX"**. El precio se recalcula en vivo al cambiar cualquier opción (con `aria-live="polite"`). El botón se deshabilita si el sabor base está agotado o si no hay stock para la cantidad pedida.

**RF-4.9 (M) Resultado.** Al pulsar el botón se agrega una línea configurada al pedido actual, se cierra el modal y aparece una confirmación breve. La línea muestra: `Helado artesanal · N bolas`, detalle `Pistacho Siciliano + Dulce de Leche • Barquillo dulce • Salsa de chocolate • Nueces` y el importe.

**RF-4.10 (M) Editar una línea.** Cada línea armada del panel de orden tiene un botón "Editar" (lápiz) que reabre el modal con la configuración cargada. El botón primario pasa a "Guardar cambios · $X.XX".

### Épica 5 — Pedido actual y ciclo de vida

**RF-5.1 (M) Estados del pedido.** `borrador` (solo en la interfaz, el panel de orden) → `por_cobrar` (en la cola) → `cobrado`. Desde `por_cobrar` también se puede pasar a `cancelado`. Un pedido `cobrado` o `cancelado` no se edita.

**RF-5.2 (M) Instantáneas.** Al salir de borrador, cada línea guarda el nombre, el precio y el costo vigentes en ese momento, con el detalle de bolas, envase, extras y toppings. Cambiar precios después no altera pedidos ya registrados.

**RF-5.3 (M) Panel de orden.** Conserva la estructura del diseño de referencia: `Orden #N`, interruptor Presencial / Delivery (+recargo), líneas con cantidad y papelera, bloque de totales y tres botones. Textos en español.

**RF-5.4 (M) Botones.**
- `Proceder al pago / Cobrar ($X)`: pide confirmación ("¿Cobrar $X.XX?") y pasa el pedido a `cobrado`.
- `Guardar en espera`: pasa el pedido a `por_cobrar` y confirma con "Orden #N guardada en la cola" y un enlace a la cola.
- `Vaciar orden`: pide confirmación si hay líneas.
- Los tres se deshabilitan sin líneas.

**RF-5.5 (S) Datos opcionales del pedido.** Cliente (texto), nota y, solo en delivery, dirección. Todos opcionales, plegados por defecto.

**RF-5.6 (M) Numeración.** El número de orden es consecutivo, persiste y no se reutiliza.

**RF-5.7 (M) Validación de stock.** Al guardar o cobrar, si algún producto no tiene stock suficiente, se bloquea la acción y se indica cuál.

### Épica 6 — Cola del mostrador

**RF-6.1 (M) Pantalla** `/staff/cola`: pedidos `por_cobrar`, del más antiguo al más nuevo. Franja superior con "Pedidos por cobrar: N" y "Total por cobrar: $X". Filtros: Todos, Presencial, Delivery.

**RF-6.2 (M) Tarjeta de pedido completa.** Cada tarjeta muestra:
- Número de orden, hora de creación y antigüedad ("hace 12 min").
- Modo de servicio con ícono.
- Cliente, nota y dirección si existen.
- Todas las líneas: cantidad × nombre, sabores de cada bola, envase, extras, toppings e importe de la línea.
- Subtotal, recargo, IVA y **total** destacado.

**RF-6.3 (M) Urgencia.** La antigüedad cambia a ámbar y a rojo según los minutos de Ajustes, siempre con ícono y texto, no solo color. Se actualiza cada 30 segundos sin recargar.

**RF-6.4 (M) Acciones por tarjeta.**
- `Cobrar` (primario) con confirmación.
- `Editar`.
- `Cancelar pedido` (advertencia) con confirmación; devuelve el stock.

**RF-6.5 (M) Editar.** Carga el pedido en el panel de orden de `/` con la franja "Editando Orden #N".
- Si ya hay un borrador con líneas, se ofrece guardarlo en la cola, descartarlo o cancelar la edición.
- Al guardar, el pedido vuelve a la cola con su número y hora originales, y se aplican los ajustes de stock.
- "Descartar cambios" lo deja como estaba.

**RF-6.6 (M) Estado vacío.** Ícono, "No hay pedidos por cobrar" y botón "Ir al menú".

**RF-6.7 (M) Responsive.** Una columna en móvil, dos desde 768 px, tres desde 1024 px.

**RF-6.8 (C) Varias pestañas.** Escuchar el evento `storage` para refrescar la cola si otra pestaña la cambia.

### Épica 7 — Dashboard de ventas

Ruta `/staff/dashboard`. **Solo gráficos y tarjetas de indicadores; ninguna tabla** en pantalla ni en el PDF. La única salida tabular permitida es el CSV.

**RF-7.1 (M) Selector de período.** Control segmentado `Día | Semana | Mes`, por defecto **Semana** (lunes a domingo). Botones anterior y siguiente, y un botón "Hoy / Esta semana / Este mes". No se avanza más allá del período actual. La etiqueta es legible, p. ej. "Semana del 12 al 18 de octubre de 2026".

**RF-7.2 (M) Comparativa.** Todos los indicadores muestran la variación porcentual contra el período anterior equivalente (día anterior, semana anterior, mes anterior), con flecha y texto ("+12 %"). Si el período anterior es 0, se muestra "Nuevo". Un interruptor "Comparar con período anterior" (activo por defecto) controla las series superpuestas de RF-7.4.a y RF-7.4.b.

**RF-7.3 (M) Indicadores clave** (tarjetas con mini gráfico de línea):
- **Ingresos** (D1).
- **Ganancia** (D2), con aviso si hay costos incompletos.
- **Órdenes registradas:** pedidos creados en el período que no fueron cancelados, con el desglose cobradas y por cobrar.
- **Ticket promedio:** ingresos ÷ órdenes cobradas.

**RF-7.4 (M) Gráficos.**
- a) **Tendencia de ingresos o ganancia:** línea o área, por hora en vista Día y por día en Semana y Mes. Selector Ingresos / Ganancia / Órdenes. Serie del período anterior punteada.
- b) **Tendencia horaria:** órdenes por hora del día (0 a 23). Compara período actual y anterior. Señala la **hora pico** con un marcador y una llamada de texto. En Semana y Mes se muestra el promedio por día para que los períodos sean comparables.
- c) **Top de demanda de productos:** barras horizontales con los 8 más vendidos. Selector Unidades / Ingresos. Barras coloreadas por categoría. Una bola cuenta como una unidad del sabor elegido.
- d) **Sabor estrella:** tarjeta destacada con imagen o ícono, nombre, bolas vendidas y porcentaje del total de bolas, más un podio con los tres primeros.
- e) **Presencial vs Delivery:** dona de ingresos y número de órdenes por servicio, con una banda "Gana Presencial · 62 %" y la diferencia frente al otro servicio. Empate: "Empate".
- f) **Alertas de stock:** barras de progreso horizontales con stock actual contra el umbral. Rojo y etiqueta "Agotado" en 0, ámbar bajo el umbral. Ordenadas de menor a mayor, máximo 8 y control "Ver todas".
- g) **Señales de abastecimiento:** barras horizontales de **días de cobertura** por producto (sección 8.4), con líneas de referencia en 1 y 3 días y etiquetas "Reponer hoy", "Reponer pronto" y "Cobertura ok".
- h) (C) Distribución por categoría y por día de la semana.

**RF-7.5 (M) Estados vacíos.** Cada gráfico sin datos muestra un mensaje explicativo. Si no hay ningún pedido en la tienda, la página ofrece "Cargar datos de demostración".

**RF-7.6 (M) Gráficos accesibles.** Cada gráfico tiene `role="img"` y un `aria-label` con su resumen ("Hora pico: 13:00, 18 órdenes"). Tooltip al pasar el cursor y al enfocar con teclado. Una versión de solo texto para lectores de pantalla, oculta visualmente, lista los valores clave.

**RF-7.7 (M) Descargar PDF.** Botón "Descargar PDF" que genera un archivo **A4** con:
- Título, nombre de la tienda, período, fecha y hora de generación.
- Indicadores clave.
- Todos los gráficos visibles, con la variación y la comparativa.
- Siempre en tema claro, sin cortar ningún gráfico entre páginas.
- Nombre de archivo `dashboard-<dia|semana|mes>-<AAAA-MM-DD>.pdf`.
- Todo en español.

**RF-7.8 (M) Descargar CSV.** Menú con dos opciones, ambas del período seleccionado:
- **Resumen** (`resumen-<período>.csv`): una fila por hora (vista Día) o por día (Semana y Mes) con `fecha`, `hora`, `ordenes`, `ingresos`, `ganancia`, `ordenes_presencial`, `ordenes_delivery`.
- **Detalle de órdenes** (`ordenes-<período>.csv`): una fila por línea con `orden`, `estado`, `fecha`, `hora`, `servicio`, `producto`, `categoria`, `bolas`, `sabores`, `envase`, `extras`, `toppings`, `cantidad`, `precio_unitario`, `costo_unitario`, `subtotal_linea`, `recargo_orden`, `iva_orden`, `total_orden`.
- Codificación UTF-8 con BOM (abre bien en Excel), separador coma, punto decimal, importes en dólares con dos decimales.
- Las celdas de texto que empiecen por `=`, `+`, `-` o `@` se prefijan con `'` para evitar inyección de fórmulas.

**RF-7.9 (S) Rendimiento.** Los cálculos usan selectores memoizados. Con 10 000 órdenes cambiar de período responde en menos de 300 ms.

### Épica 8 — Diseño, accesibilidad y documentación

**RF-8.1 (M) Actualizar `DESIGN.md`** con secciones nuevas: modal, tarjetas de opción, tarjetas de la cola, tarjetas de indicador, gráficos (paleta de series derivada de los tokens, ejes, tooltips) y menú de exportación. Cada sección debe ser suficiente para que otra persona repita el estilo sin preguntar.

**RF-8.2 (M) Actualizar `PRODUCT.md` y `specs/mission.md`** al foco en el propietario (sección 2) y registrar en `specs/roadmap.md` la fase P6 y la decisión del 2026-10-17 (ya añadidas junto a esta spec; verificar que sigan coherentes).

**RF-8.3 (M) Accesibilidad.** Contraste AA en ambos temas. Ninguna información depende solo del color. Foco visible en todo. Diálogos con foco atrapado. Respeto de `prefers-reduced-motion`.

**RF-8.4 (M) Responsive.** Mobile-first con los breakpoints de `DESIGN.md` (base, 768 px, 1024 px). Sin desbordamiento horizontal a 360 px.

## 7. Modelo de datos

Identificadores en inglés y `camelCase`. Los importes se guardan en **centavos**. Unifica la nomenclatura actual (`IceCream` usa `snake_case`) y migra el estado guardado.

```ts
type OptionKind = 'envase' | 'extra' | 'topping'

interface Category {
  id: string
  name: string
  icon: IconId
  order: number
  buildable: boolean      // se arma por bolas en el modal
  protected?: boolean     // no se archiva (Artesanales)
  archived: boolean
}

interface Product {
  id: string
  name: string
  description: string
  categoryId: string
  priceCents: number      // por bola si la categoría es armable
  costCents?: number
  stock: number
  image?: string          // data URL comprimida
  color: string           // respaldo cuando no hay imagen
  defaultContainerId?: string
  archived: boolean
  createdAt: string
}

interface OptionItem {
  id: string
  kind: OptionKind
  name: string
  icon: IconId
  priceCents: number
  costCents?: number
  available: boolean
}

interface Snapshot { id: string; name: string; priceCents: number; costCents?: number }

interface OrderLine {
  lineId: string
  productId: string
  productName: string
  categoryId: string
  qty: number
  unitPriceCents: number
  unitCostCents?: number
  build?: {               // solo helados armables
    scoops: Snapshot[]    // la primera es la base
    container?: Snapshot
    extras: Snapshot[]
    toppings: Snapshot[]
  }
}

type OrderStatus = 'por_cobrar' | 'cobrado' | 'cancelado'
type ServiceMode = 'presencial' | 'delivery'

interface Order {
  id: string
  number: number
  status: OrderStatus
  mode: ServiceMode
  lines: OrderLine[]
  customer?: string
  note?: string
  address?: string
  createdAt: string
  chargedAt?: string
  cancelledAt?: string
  subtotalCents: number
  surchargeCents: number
  ivaCents: number
  totalCents: number
  demo?: boolean
}

interface Settings {
  ivaPercent: number
  deliverySurchargeCents: number
  lowStockThreshold: number
  maxScoops: number
  queueAmberMinutes: number
  queueRedMinutes: number
}
```

El borrador del panel de orden es estado local de la interfaz (slice `order.draft`), no un `Order` persistido como `por_cobrar`.

## 8. Reglas de cálculo

### 8.1 Precio de una línea armada

```
precio_unitario = Σ precio de cada bola (la base y las adicionales, cada una a su precio por bola)
                + precio del envase
                + Σ precio de extras
                + Σ precio de toppings
subtotal_línea  = precio_unitario × cantidad
```

Productos no armables: `precio_unitario = priceCents`.

### 8.2 Totales del pedido

```
subtotal  = Σ subtotal_línea
recargo   = modo delivery y hay líneas ? recargoDelivery : 0
iva       = redondeo(( subtotal + recargo ) × ivaPercent / 100)
total     = subtotal + recargo + iva
```

El redondeo es al centavo más cercano, aplicado una sola vez sobre el IVA del pedido.

### 8.3 Indicadores del dashboard

- **Ingresos** = Σ (subtotal + recargo) de pedidos `cobrado` con `chargedAt` en el período.
- **Costos** = Σ (costo unitario × cantidad, bolas y opciones incluidas) de esos pedidos. Un elemento sin costo cuenta 0 y activa el aviso "costos incompletos".
- **Ganancia** = ingresos − costos.
- **Órdenes registradas** = pedidos `por_cobrar` o `cobrado` con `createdAt` en el período.
- **Ticket promedio** = ingresos ÷ pedidos cobrados (0 si no hay).
- **Variación** = (actual − anterior) ÷ anterior × 100, redondeada a entero.
- **Hora pico** = hora del día con más órdenes (por `createdAt`). En empate, la más temprana.
- **Sabor estrella** = sabor de categoría armable con más bolas vendidas en pedidos cobrados del período.

### 8.4 Señales de abastecimiento

```
consumo_diario  = unidades vendidas del producto en los últimos 7 días (hasta el fin del período) ÷ 7
cobertura_días  = stock actual ÷ consumo_diario        (se omiten productos sin consumo)
cobertura < 1       → "Reponer hoy"    (rojo)
1 ≤ cobertura < 3   → "Reponer pronto" (ámbar)
cobertura ≥ 3       → "Cobertura ok"
```

Una bola cuenta como una unidad del sabor elegido. Los productos sin stock siempre aparecen como "Reponer hoy".

### 8.5 Regla de stock

- Pasar a `por_cobrar`, o cobrar directo, descuenta del stock cada producto y cada bola.
- Editar un pedido aplica solo la diferencia.
- Cancelar un `por_cobrar` devuelve todo.
- Cobrar un `por_cobrar` no cambia el stock.
- El stock nunca queda negativo: la acción se bloquea (RF-5.7).

## 9. Requisitos no funcionales

### 9.1 Idioma
- Todo texto visible está en español: menú, modal, panel de orden, cola, dashboard, inventario, categorías, opciones, ajustes, reservas, login, errores de validación, mensajes vacíos, tooltips, `aria-label`, títulos de página, PDF y encabezados de CSV.
- `<html lang="es">` y títulos de pestaña en español.
- Fechas con `toLocaleDateString('es')`, hora en 24 horas, dinero `$0.00`.
- Sin librería de i18n. Centraliza los textos repetidos en un módulo para no mezclar idiomas.

### 9.2 Diseño
- Muy similar a https://www.starbucks.com/menu, según `DESIGN.md`: encabezado fijo, sub-navegación, barra lateral de categorías, tiles circulares por producto, secciones con título, mucho espacio en blanco, tarjetas suaves y botones en píldora.
- Solo tokens existentes. Los gráficos usan acento, primario, advertencia, peligro y neutros de los tokens. Documentar la paleta de series en `DESIGN.md`.
- Las tarjetas de opción, cola e indicadores van sobre `--surface-tint` con radio de 12 a 16 px, sin bordes decorativos.
- Mobile-first: reglas base para teléfono y `min-width` para 768 px y 1024 px. No escribir consultas `max-width` nuevas.

### 9.3 Datos y arquitectura
- Sin backend. Vite + React + TypeScript + Redux Toolkit + Tailwind. Gráficos con Recharts (ya instalado). CSV con `papaparse` o `Blob` (ya existe `src/lib/exportCsv.ts`).
- **Dependencias nuevas permitidas** solo para el PDF: `jspdf` y una de `html2canvas` o `html-to-image`. Cualquier otra requiere justificarse en el mensaje final.
- Persistencia por middleware o suscripción al store, con versión y migración (RF-0.2).
- Los datos viven solo en el navegador. No se garantiza compartirlos entre dispositivos.

### 9.4 Calidad
- `pnpm tsc` y `pnpm lint` sin errores.
- Funciones de cálculo (secciones 8.1 a 8.5) puras y con pruebas unitarias si se añade un ejecutor de pruebas; si no, cubiertas por los escenarios de `validation.md`.
- Sin `any` nuevo ni `console.log` en el código entregado.

## 10. Fuera de alcance

- Método de pago, pasarelas, impresión de tickets o facturación electrónica.
- Clientes registrados, fidelización, promociones y cupones.
- Cuentas múltiples, roles o permisos distintos.
- Backend, base de datos y sincronización entre dispositivos.
- Notificaciones push, correo o SMS.
- Gestión de proveedores y órdenes de compra (el dashboard solo señala qué reponer).
- Rediseño de reservas y de su lista.

## 11. Criterio de terminado

La spec está cumplida cuando todos los escenarios de `validation.md` pasan, el recorrido completo funciona sin recargar (crear categoría y producto, armar un helado con extras, guardarlo en la cola, editarlo, cobrarlo, ver el dashboard del día, la semana y el mes, y descargar PDF y CSV), y `DESIGN.md` describe todos los componentes nuevos.
