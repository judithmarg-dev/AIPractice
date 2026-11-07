# Conectar IceCreamStore con Supabase (PostgreSQL)

La app ya no guarda los datos solo en el navegador. Ahora:

- **Base de datos:** categorías, productos, opciones, pedidos, reservas y ajustes viven en PostgreSQL (Supabase).
- **Autenticación:** el acceso staff usa **Supabase Auth** (correo + contraseña). Ya no existe el usuario fijo `staff@icecreamstore.com / staff123`.
- **En el navegador** solo queda el pedido que se está armando (borrador) y el tema claro/oscuro.

Sigue los pasos en orden.

---

## 1. Crear el proyecto en Supabase

1. Entra a <https://supabase.com> e inicia sesión.
2. **New project** → elige organización, nombre (por ejemplo `icecreamstore`), una contraseña segura para la base de datos y la región más cercana.
3. Espera a que el proyecto termine de crearse (1–2 minutos).

## 2. Crear las tablas

1. En el panel del proyecto ve a **SQL Editor** → **New query**.
2. Copia todo el contenido de [`supabase/migrations/001_initial.sql`](supabase/migrations/001_initial.sql), pégalo y pulsa **Run**.
3. Verifica en **Table Editor** que existen estas tablas:

| Tabla | Contenido | Quién puede leer | Quién puede escribir |
|-------|-----------|------------------|----------------------|
| `categories` | Categorías del menú | Todos | Staff |
| `options` | Envases, extras y toppings | Todos | Staff |
| `products` | Productos, precio, stock, imagen | Todos | Staff |
| `store_settings` | Ajustes (IVA, recargos, umbrales) y número del próximo pedido | Todos | Staff |
| `orders` | Pedidos (líneas en `jsonb`) | Staff | Staff |
| `bookings` | Reservas de mesa | Staff | Cualquiera puede **crear**; el staff gestiona |

> **¿Ya habías ejecutado el script antes?** Vuelve a ejecutarlo. Agrega `products.sprite` (el dibujo de cada sabor artesanal), `store_settings.kilo_price_cents` y `half_kilo_price_cents` (precio de 1 kilo y ½ kilo), y elimina `products.subgroup_id`: los sabores de Artesanales son un solo catálogo que sirve para **Porciones** y **Por peso**, así que ya no se asignan a una pestaña. Sin estas columnas, guardar productos o ajustes falla.
>
> El script es idempotente: se puede ejecutar de nuevo sin perder datos. Las reglas de acceso están implementadas con **Row-Level Security (RLS)**.

## 3. Crear el usuario staff

1. Ve a **Authentication** → **Users** → **Add user** → **Create new user**.
2. Escribe el correo y la contraseña del staff y marca **Auto Confirm User**.
3. Repite para cada persona del staff. Todo usuario autenticado tiene acceso completo al panel.

**Recomendado:** en **Authentication** → **Sign In / Providers** desactiva **Allow new users to sign up**, para que nadie pueda registrarse por su cuenta con la clave pública y obtener acceso de staff.

## 4. Configurar las variables de entorno

1. En Supabase ve a **Project Settings** → **API** (o **Data API / API Keys**) y copia:
   - **Project URL**
   - **anon public key** (clave pública; **nunca** uses la `service_role` en el front-end)
2. En la carpeta `iceCreamStore/` copia la plantilla:

   ```powershell
   Copy-Item .env.local.example .env.local
   ```

3. Edita `.env.local`:

   ```env
   VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
   ```

`.env.local` está en `.gitignore`: no se sube al repositorio.

## 5. Instalar y arrancar

```powershell
pnpm install
pnpm dev
```

Abre la URL que muestra Vite (normalmente <http://localhost:5173>).

- Si ves **"Falta configurar Supabase"**, revisa los nombres de las variables en `.env.local` y reinicia `pnpm dev` (Vite solo lee el `.env` al arrancar).

## 6. Primer inicio: cargar el catálogo inicial

Con la base de datos vacía la app muestra el catálogo de ejemplo, pero **todavía no está guardado** en Supabase.

1. Ve a <http://localhost:5173/login> e inicia sesión con el usuario del paso 3.
2. Al entrar, la app detecta que la base está vacía y **sube automáticamente** las categorías, productos, opciones y ajustes iniciales.
3. Comprueba en **Table Editor** que `categories`, `products` y `options` tienen filas.

A partir de aquí todo cambio (productos, stock, pedidos, reservas, ajustes, datos de demostración) se guarda en Supabase unos 300 ms después de hacerlo.

## 7. Verificar que funciona

| Prueba | Resultado esperado |
|--------|--------------------|
| Crear un producto en **Inventario** y recargar la página | El producto sigue ahí |
| Abrir la app en otro navegador | Se ven los mismos datos |
| Crear una reserva sin sesión en `/booking` | Aparece en `bookings` y en **Reservas** del staff |
| Cerrar sesión | Los pedidos y reservas dejan de verse (RLS) |
| **Ajustes → Cargar datos de demostración** | `orders` recibe ~1500 filas con `demo = true` |

## 8. Cómo está implementado (para desarrolladores)

| Archivo | Responsabilidad |
|---------|-----------------|
| `src/lib/supabase.ts` | Crea el cliente de Supabase con las variables de entorno |
| `src/store/remoteSync.ts` | Carga las tablas en Redux al iniciar y al cambiar la sesión, y escribe de vuelta solo las filas que cambiaron |
| `src/store/remoteRows.ts` | Conversión entre los modelos de la app (camelCase) y las columnas de Postgres (snake_case) |
| `src/store/authActions.ts` | `signIn` / `signOut` con Supabase Auth |
| `src/components/RemoteGate.tsx` | Pantalla de carga y aviso de configuración faltante |
| `supabase/migrations/001_initial.sql` | Tablas, índices y políticas RLS |

Los reducers y las acciones de Redux no cambiaron: Supabase es la fuente de verdad y Redux es la copia en memoria que usa la interfaz.

## 9. Problemas frecuentes

| Síntoma | Causa probable | Solución |
|---------|----------------|----------|
| Aviso "No se pudieron leer los datos de Supabase" | URL o clave incorrecta, o no se ejecutó el SQL | Revisa `.env.local` y el paso 2 |
| "Correo o contraseña incorrectos" | Usuario sin crear o sin confirmar | Paso 3, marca **Auto Confirm User** |
| Aviso "…(inicia sesión como staff)" al cobrar un pedido | Sin sesión solo se pueden crear reservas | Inicia sesión en `/login` antes de tomar pedidos |
| `new row violates row-level security policy` | Se escribe en una tabla sin sesión staff | Igual que arriba |
| El catálogo no aparece en las tablas | Nadie inició sesión con la base vacía | Paso 6 |
| Los cambios de otro dispositivo no aparecen | La app lee la base al cargar y al iniciar/cerrar sesión | Recarga la página |

## 10. Volver a empezar

- **Desde la app:** **Ajustes → Restablecer todo** vuelve al catálogo inicial y borra pedidos y reservas en Supabase.
- **Desde Supabase (borrado total):** en el SQL Editor:

  ```sql
  truncate orders, bookings, products, options, categories, store_settings;
  ```

  Luego vuelve a iniciar sesión para que la app suba el catálogo inicial (paso 6).
