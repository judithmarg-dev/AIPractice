-- IceCreamStore — esquema de la tienda en Supabase (PostgreSQL)
-- Ejecutar en: Supabase Dashboard → SQL Editor → New query → Run.
-- Es idempotente: se puede volver a ejecutar sin perder datos.
--
-- Las columnas reflejan los tipos de src/types/models.ts y src/types/booking.ts.
-- Los ids son texto porque la app usa slugs ("artesanal", "vaso-carton") e ids generados en el cliente.

-- ── Esquema anterior (catálogo en inglés, ya no se usa) ─────────────────────────
drop table if exists ice_creams;

-- ── Tablas ───────────────────────────────────────────────────────────────────

create table if not exists categories (
  id          text primary key,
  name        text not null,
  icon        text not null,
  sort_order  integer not null default 0,
  buildable   boolean not null default false,
  protected   boolean not null default false,
  archived    boolean not null default false
);

create table if not exists options (
  id          text primary key,
  kind        text not null check (kind in ('envase', 'extra', 'topping')),
  name        text not null,
  icon        text not null,
  price_cents integer not null default 0 check (price_cents >= 0),
  cost_cents  integer check (cost_cents >= 0),
  available   boolean not null default true,
  example     boolean not null default false
);

create table if not exists products (
  id                   text primary key,
  name                 text not null,
  description          text not null default '',
  category_id          text not null references categories (id),
  price_cents          integer not null check (price_cents >= 0),
  cost_cents           integer check (cost_cents >= 0),
  stock                integer not null default 0 check (stock >= 0),
  image                text,          -- data URL comprimida (src/lib/image.ts)
  color                text not null default '#9ca3af',
  default_container_id text,          -- id de una opción "envase"; sin FK: al borrar la opción se limpia desde la app
  sprite               text,          -- dibujo del sabor artesanal: celda de las hojas de sprites (ej. 's1-7'); ver src/lib/scoopSprites.ts
  archived             boolean not null default false,
  created_at           timestamptz not null default now()
);

-- Columnas agregadas después de la primera versión del script (para bases ya creadas).
-- Los sabores artesanales son un solo catálogo: sirven igual para "Porciones" y "Por peso",
-- por eso desaparece la asignación de cada producto a una pestaña (subgroup_id).
alter table products add column if not exists sprite text;
alter table products drop column if exists subgroup_id;
update products set sprite = case id
  when 'fresa-del-huerto'    then 's1-0'
  when 'chocolate-intenso'   then 's1-2'
  when 'pistacho-siciliano'  then 's1-7'
  when 'dulce-de-leche'      then 's2-1'
end
where sprite is null and id in ('fresa-del-huerto', 'chocolate-intenso', 'pistacho-siciliano', 'dulce-de-leche');

create table if not exists orders (
  id              text primary key,
  number          integer not null,
  status          text not null check (status in ('por_cobrar', 'cobrado', 'cancelado')),
  mode            text not null check (mode in ('presencial', 'delivery')),
  lines           jsonb not null default '[]'::jsonb,  -- OrderLine[] con precios congelados
  customer        text,
  note            text,
  address         text,
  created_at      timestamptz not null default now(),
  charged_at      timestamptz,
  cancelled_at    timestamptz,
  subtotal_cents  integer not null,
  surcharge_cents integer not null default 0,
  iva_cents       integer not null default 0,
  total_cents     integer not null,
  demo            boolean not null default false
);

create index if not exists orders_created_at_idx on orders (created_at);
create index if not exists orders_status_idx on orders (status);

create table if not exists bookings (
  id          uuid primary key default gen_random_uuid(),
  date        date not null,
  time        text not null,
  party_size  integer not null check (party_size between 1 and 20),
  first_name  text not null,
  last_name   text not null,
  email       text not null,
  phone       text not null,
  status      text not null default 'pending' check (status in ('pending', 'confirmed', 'cancelled')),
  created_at  timestamptz not null default now()
);

-- Una sola fila (id = 1) con los ajustes y los contadores de la tienda.
create table if not exists store_settings (
  id                       integer primary key default 1 check (id = 1),
  iva_percent              numeric not null default 10,
  delivery_surcharge_cents integer not null default 30,
  low_stock_threshold      integer not null default 5,
  max_scoops               integer not null default 3,
  kilo_price_cents         integer not null default 1800 check (kilo_price_cents >= 0),       -- Artesanales por peso: 1 kilo
  half_kilo_price_cents    integer not null default 1000 check (half_kilo_price_cents >= 0),  -- Artesanales por peso: ½ kilo
  queue_amber_minutes      integer not null default 15,
  queue_red_minutes        integer not null default 30,
  next_order_number        integer not null default 1044,
  demo_stock_backup        jsonb
);

alter table store_settings add column if not exists kilo_price_cents integer not null default 1800;
alter table store_settings add column if not exists half_kilo_price_cents integer not null default 1000;

-- ── Row-Level Security ───────────────────────────────────────────────────────
-- anon          = clientes sin sesión: ven el menú y pueden crear reservas.
-- authenticated = staff con sesión de Supabase Auth: acceso completo.

alter table categories     enable row level security;
alter table options        enable row level security;
alter table products       enable row level security;
alter table orders         enable row level security;
alter table bookings       enable row level security;
alter table store_settings enable row level security;

-- Catálogo y ajustes: lectura pública, escritura solo staff.
drop policy if exists "public read categories" on categories;
create policy "public read categories" on categories for select to anon, authenticated using (true);
drop policy if exists "staff write categories" on categories;
create policy "staff write categories" on categories for all to authenticated using (true) with check (true);

drop policy if exists "public read options" on options;
create policy "public read options" on options for select to anon, authenticated using (true);
drop policy if exists "staff write options" on options;
create policy "staff write options" on options for all to authenticated using (true) with check (true);

drop policy if exists "public read products" on products;
create policy "public read products" on products for select to anon, authenticated using (true);
drop policy if exists "staff write products" on products;
create policy "staff write products" on products for all to authenticated using (true) with check (true);

drop policy if exists "public read settings" on store_settings;
create policy "public read settings" on store_settings for select to anon, authenticated using (true);
drop policy if exists "staff write settings" on store_settings;
create policy "staff write settings" on store_settings for all to authenticated using (true) with check (true);

-- Pedidos: solo staff (contienen ventas y datos de clientes).
drop policy if exists "staff manage orders" on orders;
create policy "staff manage orders" on orders for all to authenticated using (true) with check (true);

-- Reservas: cualquiera puede crear una; solo el staff las lee y gestiona.
drop policy if exists "anon insert bookings" on bookings;
create policy "anon insert bookings" on bookings for insert to anon with check (status = 'pending');
drop policy if exists "staff manage bookings" on bookings;
create policy "staff manage bookings" on bookings for all to authenticated using (true) with check (true);

-- El catálogo inicial (categorías, productos, opciones) lo sube la app la primera vez
-- que el staff inicia sesión con la base vacía. Ver instructions.md.
