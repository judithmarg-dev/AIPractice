-- Ice Cream Store — initial schema
-- Run this in: Supabase Dashboard → SQL Editor

-- ── Tables ───────────────────────────────────────────────────────────────────

create table if not exists ice_creams (
  id               uuid primary key default gen_random_uuid(),
  name             text not null,
  description      text not null default '',
  category         text not null check (category in ('fruit', 'chocolate', 'classic')),
  image_placeholder text not null default '#9ca3af',
  inventory_count  integer not null default 0,
  archived         boolean not null default false,
  created_at       timestamptz not null default now()
);

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

-- ── Row-Level Security ────────────────────────────────────────────────────────

alter table ice_creams enable row level security;
alter table bookings enable row level security;

-- Public can read non-archived ice creams (catalog page uses this)
create policy "public read ice_creams"
  on ice_creams for select
  using (archived = false);

-- Authenticated staff can do everything on ice_creams
create policy "staff full access ice_creams"
  on ice_creams for all
  to authenticated
  using (true)
  with check (true);

-- Authenticated staff can read all bookings (includes archived items)
create policy "staff read ice_creams all"
  on ice_creams for select
  to authenticated
  using (true);

-- Anyone (anon) can insert a booking (from the booking form)
create policy "anon insert bookings"
  on bookings for insert
  to anon
  with check (true);

-- Authenticated staff can read and update bookings
create policy "staff manage bookings"
  on bookings for all
  to authenticated
  using (true)
  with check (true);

-- ── Seed data (optional — import from flavors.json manually or run this) ──────

insert into ice_creams (name, description, category, image_placeholder, inventory_count) values
  ('Strawberry Dream',  'Fresh strawberries blended into a smooth, creamy scoop.',             'fruit',     '#f472b6', 24),
  ('Mango Tango',       'Tropical mango with a hint of lime — sunshine in every bite.',         'fruit',     '#fb923c', 18),
  ('Dark Cocoa Swirl',  'Rich Belgian dark chocolate with a salted caramel ribbon.',             'chocolate', '#78350f', 12),
  ('Milk Choco Hazel',  'Smooth milk chocolate folded with roasted hazelnuts.',                  'chocolate', '#a16207', 8),
  ('Vanilla Classic',   'Madagascan vanilla bean — timeless, comforting, perfect.',             'classic',   '#fde68a', 30),
  ('Pistachio Royale',  'Sicilian pistachios in a velvety, delicate cream base.',               'classic',   '#86efac', 15),
  ('Blueberry Cheesecake', 'Tangy cheesecake base swirled with wild blueberry compote.',       'fruit',     '#818cf8', 20),
  ('Choco Mint Chip',   'Intense dark chocolate flecked with cool peppermint crystals.',        'chocolate', '#34d399', 10)
on conflict do nothing;
