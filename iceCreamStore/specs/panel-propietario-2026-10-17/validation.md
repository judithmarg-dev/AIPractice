# P6 — Panel del propietario: Validación

## Barra de merge

P6 está listo cuando **todo** lo siguiente pasa.

### 1. Comprobaciones automáticas
- `pnpm lint` sin errores ni advertencias.
- `pnpm tsc` sin errores de TypeScript.
- Sin `any` nuevo ni `console.log` en el código entregado.

### 2. Datos de referencia para los escenarios

Productos y opciones de ejemplo (la semilla puede traer otros; ajusta los números si cambian):

| Elemento | Valor |
|---|---|
| Pistacho Siciliano (artesanal) | $2.60 por bola, stock 10 |
| Dulce de Leche (artesanal) | $2.60 por bola, stock 10 |
| Chocolate Intenso (artesanal) | $2.60 por bola, stock 0 (agotado) |
| Barquillo dulce (envase) | +$0.50 |
| Salsa de chocolate (extra) | +$0.40 |
| Nueces (topping) | +$0.30 |
| IVA | 10 % |
| Recargo delivery | $0.30 |

**Cálculo de referencia:** base Pistacho + 1 bola de Dulce de Leche + Barquillo dulce + Salsa de chocolate + Nueces = 2.60 + 2.60 + 0.50 + 0.40 + 0.30 = **$6.40** por unidad.

| Cantidad | Modo | Subtotal | Recargo | IVA | Total |
|---|---|---|---|---|---|
| 1 | Presencial | $6.40 | $0.00 | $0.64 | $7.04 |
| 2 | Presencial | $12.80 | $0.00 | $1.28 | $14.08 |
| 2 | Delivery | $12.80 | $0.30 | $1.31 | $14.41 |

### 3. Fundamentos

| Escenario | Resultado esperado |
|---|---|
| Recorrer cada pantalla (menú, modal, orden, cola, dashboard, inventario, categorías, opciones, ajustes, reservas, login) | Todo el texto visible está en español; no queda inglés en etiquetas, errores, vacíos ni `aria-label` |
| Inspeccionar `<html>` | Tiene `lang="es"` |
| Crear un producto, recargar la página | El producto sigue ahí con su imagen |
| Llenar `localStorage` hasta la cuota y guardar un cambio | La app sigue funcionando y muestra un aviso discreto |
| Ajustes → "Restablecer datos de la tienda" y confirmar | Todo vuelve a la semilla |
| Dashboard sin pedidos → "Cargar datos de demostración" | Aparecen al menos 60 días de datos y el aviso "Mostrando datos de demostración" |
| "Borrar datos de demostración" | Se eliminan solo los pedidos con `demo: true`, el stock vuelve al inicial y los pedidos reales siguen |
| Abrir `/staff/analytics` | Redirige a `/staff/dashboard` |
| Pedido por cobrar existente | La insignia de `Cola` en la navegación muestra el número correcto |

### 4. Categorías

| Escenario | Resultado esperado |
|---|---|
| Crear la categoría "Postres" con ícono y sin "Se arma por bolas" | Aparece en `/staff/categorias`, en el selector de producto y, tras añadir un producto, en la barra y las secciones del menú |
| Crear "Postres" otra vez, o "postres", o "Póstres" | Error de nombre duplicado; no se crea |
| Nombre de 1 carácter o de 31 caracteres | Error de longitud |
| Desde el formulario de producto elegir "＋ Nueva categoría" y guardar | La categoría queda creada y seleccionada en el formulario |
| Subir "Bebidas" una posición | El orden del menú cambia en consecuencia |
| Archivar una categoría con productos activos | Bloqueado con un mensaje |
| Archivar "Artesanales" | Bloqueado: es protegida |
| Producto con categoría desconocida en un estado guardado antiguo | Aparece bajo "Otros" tras la migración |

### 5. Opciones

| Escenario | Resultado esperado |
|---|---|
| Crear un topping "Nueces" con ícono y precio 0.30 | Aparece como tarjeta con ícono, título y "+$0.30" |
| Crear una opción con precio 0 | La tarjeta muestra "Incluido" |
| Precio negativo o con más de dos decimales | Error de validación |
| Marcar una opción como no disponible | Desaparece del modal de armado |
| Eliminar un extra usado en un pedido ya cobrado | El pedido conserva el nombre y el precio originales |

### 6. Modal de armado artesanal

| Escenario | Resultado esperado |
|---|---|
| Tocar "Pistacho Siciliano" | Se abre el modal con ese sabor como base y el precio por bola |
| Tocar un producto de otra categoría (p. ej. Bebidas) | No hay modal: se usa el panel lateral con "Agregar al pedido" |
| Ver las bolas adicionales con Chocolate Intenso agotado | La tarjeta se ve atenuada con "Agotado" y no se puede elegir |
| Sumar 1 bola de Dulce de Leche | Aparece el control − 1 +, la fila resumen muestra "1. Pistacho (base) · 2. Dulce de leche" y el botón sube a $5.20 |
| Intentar sumar más bolas cuando el total llega a 3 | Las demás tarjetas se deshabilitan con "Máximo alcanzado" |
| Cambiar el máximo de bolas a 4 en Ajustes y reabrir | Se permiten hasta 4 |
| Repetir Pistacho con stock 1 | No se puede: la base ya consume la única unidad |
| Elegir envase Barquillo dulce, extra Salsa de chocolate y topping Nueces | El botón muestra **"Agregar al pedido · $6.40"** |
| Quitar Nueces | El botón baja a $6.10 sin cerrar el modal |
| Subir la cantidad a 2 | El botón muestra $12.80 |
| Pulsar el botón | El modal se cierra, aparece la confirmación y la línea del panel dice "Helado artesanal · 2 bolas" con el detalle "Pistacho Siciliano + Dulce de Leche • Barquillo dulce • Salsa de chocolate • Nueces" |
| Pulsar Editar en esa línea | Se abre el modal con todo precargado y el botón dice "Guardar cambios · $X.XX" |
| Navegar solo con teclado | Tab recorre las tarjetas, Espacio las activa, Escape cierra y el foco vuelve a la tarjeta del helado |
| Abrir el modal en 375 px | Es una hoja inferior; el pie con el botón siempre visible |
| Abrir el modal en 1280 px | Es un diálogo centrado de hasta 720 px |
| Lector de pantalla | El diálogo se anuncia con su título; cada tarjeta se anuncia como opción de radio o casilla, con su precio y estado |

### 7. Pedido actual y ciclo de vida

| Escenario | Resultado esperado |
|---|---|
| Línea de $6.40 × 2 en modo Presencial | Subtotal $12.80, IVA $1.28, total $14.08 |
| Cambiar a Delivery | Recargo $0.30, IVA $1.31, total $14.41 |
| Panel sin líneas | Los tres botones están deshabilitados |
| "Guardar en espera" | El pedido aparece en la cola, el panel pasa a la siguiente numeración, aparece "Orden #N guardada en la cola" con enlace |
| "Proceder al pago / Cobrar" | Pide confirmación "¿Cobrar $X.XX?"; al aceptar queda `cobrado` y no está en la cola |
| "Vaciar orden" con líneas | Pide confirmación |
| Dos pedidos consecutivos | Los números son consecutivos y no se repiten tras recargar |
| Cobrar con un sabor que se agotó mientras tanto | Se bloquea y se indica cuál producto falta |
| Cambiar el precio de un producto después de guardar un pedido | El pedido guardado conserva su precio original |
| Stock de Pistacho 10, pedido con 2 bolas de Pistacho a la cola | El stock baja a 8 |
| Cancelar ese pedido | El stock vuelve a 10 |
| Editar el pedido quitando una bola de Pistacho | El stock sube en 1 |
| Cobrar un pedido ya en la cola | El stock no cambia |

### 8. Cola del mostrador

| Escenario | Resultado esperado |
|---|---|
| Abrir `/staff/cola` con 3 pedidos por cobrar | Se ven 3 tarjetas, del más antiguo al más nuevo; la franja dice "Pedidos por cobrar: 3" y el total correcto |
| Contenido de cada tarjeta | Número, hora, antigüedad, modo con ícono, cliente y nota si existen, todas las líneas con bolas, envase, extras y toppings, subtotal, recargo, IVA y total destacado |
| Filtrar por Delivery | Solo se ven los pedidos de delivery |
| Pedido con 16 minutos de antigüedad | La antigüedad aparece en ámbar con ícono y texto |
| Pedido con 31 minutos | Aparece en rojo con ícono y texto |
| Esperar 30 segundos | Las antigüedades se actualizan sin recargar |
| "Cobrar" en una tarjeta | Confirmación, el pedido sale de la cola y la insignia baja |
| "Cancelar pedido" | Confirmación, sale de la cola y el stock vuelve |
| "Editar" sin borrador en curso | `/` se abre con el pedido cargado y la franja "Editando Orden #N" |
| "Editar" con un borrador con líneas | Aparece el diálogo con guardar, descartar o cancelar |
| Guardar la edición | El pedido vuelve a la cola con el mismo número y la misma hora de creación; el total y el stock reflejan los cambios |
| Descartar cambios | El pedido queda como estaba |
| Cola vacía | Ícono, "No hay pedidos por cobrar" y botón "Ir al menú" |
| Ancho 375, 768 y 1280 px | 1, 2 y 3 columnas respectivamente, sin desbordar |

### 9. Dashboard

Datos de control para verificar cifras. Dos pedidos cobrados en la misma semana, sin otros:

- Pedido A, presencial: subtotal $10.00, IVA $1.00, total $11.00, costo $4.00.
- Pedido B, delivery: subtotal $5.00, recargo $0.30, IVA $0.53, total $5.83, costo $2.00.

| Escenario | Resultado esperado |
|---|---|
| Abrir el dashboard | Período **Semana** seleccionado, etiqueta legible (p. ej. "Semana del 12 al 18 de octubre de 2026" si hoy es el 17) |
| Ingresos con A y B | **$15.30** (sin IVA); dato secundario "Cobrado con IVA: $16.83" |
| Ganancia con A y B | **$9.30** |
| Órdenes registradas | **2**, con desglose "2 cobradas · 0 por cobrar" |
| Ticket promedio | $7.65 |
| Servicio ganador | "Gana Presencial" con el 65 % de los ingresos y el 50 % de las órdenes |
| Producto sin costo en una línea | Aparece "costos incompletos" junto a la ganancia |
| Cambiar a Día | Los indicadores y el gráfico de tendencia pasan a horas |
| Cambiar a Mes | Se ve el mes calendario completo |
| Pulsar "anterior" y luego "siguiente" | Se vuelve al período original; no se puede avanzar más allá del actual |
| Período anterior con ingresos 0 | La variación muestra "Nuevo" |
| Período anterior con $10 e ingresos actuales $12 | La variación muestra "+20 %" con flecha hacia arriba |
| Apagar "Comparar con período anterior" | Desaparecen las series punteadas |
| Tres órdenes creadas a las 12:10, 12:40 y 13:05 | La hora pico es 12:00 con 2 órdenes y aparece señalada con marcador y texto |
| Dos horas con igual número de órdenes | La hora pico es la más temprana |
| Ventas con 6 bolas de Pistacho, 4 de Dulce de Leche y 2 de Mocha | El sabor estrella es Pistacho con 50 % de las bolas; el podio muestra los tres |
| Top de demanda | Barras horizontales con un máximo de 8 productos; el selector Unidades / Ingresos reordena |
| Producto con stock 0 | Aparece en alertas con rojo y "Agotado" |
| Producto con stock 3 y umbral 5 | Aparece en ámbar |
| Producto con stock 5 y 14 unidades vendidas en 7 días (2 por día) | Cobertura de 2.5 días: "Reponer pronto" |
| Producto con stock 1 y 2 por día | Cobertura de 0.5 días: "Reponer hoy" |
| Producto con stock 6 y 2 por día | Cobertura de exactamente 3 días: "Cobertura ok" |
| Producto sin consumo en 7 días | No aparece en señales de abastecimiento |
| Revisar toda la pantalla | No hay ninguna tabla; solo tarjetas y gráficos |
| Gráfico sin datos | Muestra un mensaje explicativo |
| Lector de pantalla sobre un gráfico | Anuncia su resumen, p. ej. "Hora pico: 13:00, 18 órdenes" |
| Tooltip con teclado | Se puede mostrar enfocando los puntos o las barras |
| Ancho 375, 768 y 1280 px | 1, 2 y 3 columnas de gráficos, sin desbordar |

### 10. Exportaciones

| Escenario | Resultado esperado |
|---|---|
| "Descargar PDF" en Semana | Se descarga `dashboard-semana-AAAA-MM-DD.pdf` en A4 |
| Abrir el PDF | Título, tienda, período, fecha de generación, indicadores y todos los gráficos; tema claro; ningún gráfico cortado entre páginas; todo en español |
| "Descargar PDF" con el tema oscuro activo | El PDF sale igualmente en tema claro |
| "CSV → Resumen" en Semana | Se descarga `resumen-semana-....csv` con una fila por día y las columnas `fecha, hora, ordenes, ingresos, ganancia, ordenes_presencial, ordenes_delivery` |
| "CSV → Resumen" en Día | Una fila por hora |
| "CSV → Detalle de órdenes" | Una fila por línea con las columnas del requisito RF-7.8 |
| Abrir el CSV en Excel | Acentos correctos (BOM), importes con punto decimal y dos decimales |
| Producto llamado `=1+1` | En el CSV la celda empieza con `'` |
| Exportar un período sin datos | Se descarga un archivo válido solo con encabezados |

### 11. Diseño, accesibilidad y documentación

| Escenario | Resultado esperado |
|---|---|
| Comparar menú, header y barra de categorías con https://www.starbucks.com/menu | Misma estructura: encabezado fijo, sub-navegación, barra lateral de categorías, tiles circulares, secciones con título y mucho espacio |
| Buscar colores fuera de los tokens en los CSS y componentes nuevos | Ninguno |
| Alternar tema claro y oscuro en cada pantalla nueva | Todo legible; contraste AA |
| Buscar información que dependa solo del color (urgencia, stock, selección) | Siempre hay ícono o texto además |
| Navegar todas las pantallas nuevas solo con teclado | Foco visible y orden lógico |
| Activar `prefers-reduced-motion` | Sin animaciones |
| 360 px de ancho | Sin scroll horizontal en ninguna pantalla |
| Abrir `DESIGN.md` | Describe modal, tarjetas de opción, tarjetas de cola, tarjetas de indicador, gráficos y menú de exportación |
| Abrir `PRODUCT.md` y `specs/mission.md` | Describen al propietario como usuario principal |

### 12. Recorrido de extremo a extremo (sin recargar)

1. Crear la categoría "Postres" y un producto en ella.
2. Crear un topping con precio.
3. Armar un helado artesanal con una bola de otro sabor, envase, extra y topping, y ver el total en el botón.
4. Agregarlo al pedido, cambiar a Delivery y "Guardar en espera".
5. Abrir la cola, editar el pedido, guardar y cobrarlo.
6. Abrir el dashboard del día, de la semana y del mes, y comparar con el período anterior.
7. Descargar el PDF y los dos CSV.
8. Recargar y comprobar que nada se perdió.
