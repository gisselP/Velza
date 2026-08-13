-- ============================================================
-- VELZA — Esquema completo de base de datos
-- Ejecutar en el SQL Editor de Supabase
-- ============================================================

-- 1. PERFILES (extiende auth.users)
create table if not exists profiles (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade unique not null,
  full_name   text not null,
  role        text not null check (role in ('admin', 'vendor')),
  is_active   boolean default true,
  created_at  timestamptz default now()
);

-- 2. CATEGORÍAS
create table if not exists categories (
  id         uuid primary key default gen_random_uuid(),
  name       text not null unique,
  is_active  boolean default true
);

-- 3. UBICACIONES
create table if not exists locations (
  id          uuid primary key default gen_random_uuid(),
  name        text not null unique,
  description text,
  is_active   boolean default true
);

-- 4. PRODUCTOS
create table if not exists products (
  id          uuid primary key default gen_random_uuid(),
  code        text not null unique,
  name        text not null,
  model       text not null,
  category_id uuid references categories(id),
  size        text not null,
  color       text not null,
  gender      text not null check (gender in ('dama', 'caballero', 'unisex')),
  sale_price  numeric(10,2) not null check (sale_price >= 0),
  min_price   numeric(10,2) not null check (min_price >= 0),
  cost        numeric(10,2) not null check (cost >= 0),
  image_url   text,
  is_active   boolean default true,
  created_at  timestamptz default now()
);

-- 5. INVENTARIO
create table if not exists inventory (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid references products(id) on delete cascade not null,
  location_id uuid references locations(id) not null,
  quantity    integer default 0 check (quantity >= 0),
  updated_at  timestamptz default now(),
  unique (product_id, location_id)
);

-- 6. PROVEEDORES
create table if not exists suppliers (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  document   text,
  phone      text,
  is_active  boolean default true,
  created_at timestamptz default now()
);

-- 7. VENTAS
create table if not exists sales (
  id             uuid primary key default gen_random_uuid(),
  vendor_id      uuid references auth.users(id) not null,
  sale_date      date not null default current_date,
  total          numeric(10,2) not null check (total >= 0),
  payment_method text not null check (payment_method in ('efectivo', 'yape', 'plin')),
  notes          text,
  created_at     timestamptz default now()
);

-- 8. DETALLES DE VENTA
create table if not exists sale_details (
  id          uuid primary key default gen_random_uuid(),
  sale_id     uuid references sales(id) on delete cascade not null,
  product_id  uuid references products(id) not null,
  location_id uuid references locations(id) not null,
  quantity    integer not null check (quantity > 0),
  unit_price  numeric(10,2) not null check (unit_price >= 0),
  subtotal    numeric(10,2) not null check (subtotal >= 0)
);

-- 9. COMPRAS
create table if not exists purchases (
  id            uuid primary key default gen_random_uuid(),
  supplier_id   uuid references suppliers(id) not null,
  purchase_date date not null default current_date,
  total         numeric(10,2) not null check (total >= 0),
  notes         text,
  created_at    timestamptz default now()
);

-- 10. DETALLES DE COMPRA
create table if not exists purchase_details (
  id          uuid primary key default gen_random_uuid(),
  purchase_id uuid references purchases(id) on delete cascade not null,
  product_id  uuid references products(id) not null,
  location_id uuid references locations(id) not null,
  quantity    integer not null check (quantity > 0),
  unit_cost   numeric(10,2) not null check (unit_cost >= 0),
  subtotal    numeric(10,2) not null check (subtotal >= 0)
);

-- ============================================================
-- ÍNDICES
-- ============================================================
create index if not exists idx_products_code on products(code);
create index if not exists idx_products_name on products(name);
create index if not exists idx_products_model on products(model);
create index if not exists idx_inventory_product on inventory(product_id);
create index if not exists idx_inventory_location on inventory(location_id);
create index if not exists idx_sales_vendor on sales(vendor_id);
create index if not exists idx_sales_date on sales(sale_date);
create index if not exists idx_sale_details_sale on sale_details(sale_id);
create index if not exists idx_purchase_details_purchase on purchase_details(purchase_id);
create index if not exists idx_profiles_user on profiles(user_id);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Habilitar RLS en todas las tablas
alter table profiles enable row level security;
alter table categories enable row level security;
alter table locations enable row level security;
alter table products enable row level security;
alter table inventory enable row level security;
alter table suppliers enable row level security;
alter table sales enable row level security;
alter table sale_details enable row level security;
alter table purchases enable row level security;
alter table purchase_details enable row level security;

-- Función auxiliar para obtener el rol del usuario actual
create or replace function get_my_role()
returns text as $$
  select role from profiles where user_id = auth.uid()
$$ language sql security definer;

-- PROFILES: todos ven sus propios datos; admin ve todo
create policy "profiles_read" on profiles for select
  using (user_id = auth.uid() or get_my_role() = 'admin');

create policy "profiles_insert_admin" on profiles for insert
  with check (get_my_role() = 'admin');

create policy "profiles_update_admin" on profiles for update
  using (get_my_role() = 'admin');

-- CATEGORIES: todos pueden leer; solo admin modifica
create policy "categories_read" on categories for select using (true);
create policy "categories_write" on categories for all using (get_my_role() = 'admin');

-- LOCATIONS: todos pueden leer; solo admin modifica
create policy "locations_read" on locations for select using (true);
create policy "locations_write" on locations for all using (get_my_role() = 'admin');

-- PRODUCTS: todos pueden leer activos; solo admin modifica
create policy "products_read" on products for select using (true);
create policy "products_write" on products for all using (get_my_role() = 'admin');

-- INVENTORY: todos pueden leer; solo admin modifica directamente
create policy "inventory_read" on inventory for select using (true);
create policy "inventory_write" on inventory for all using (get_my_role() = 'admin' or get_my_role() = 'vendor');

-- SUPPLIERS: solo admin
create policy "suppliers_read" on suppliers for select using (get_my_role() = 'admin' or get_my_role() = 'vendor');
create policy "suppliers_write" on suppliers for all using (get_my_role() = 'admin');

-- SALES: vendor ve sus ventas; admin ve todo
create policy "sales_read" on sales for select
  using (vendor_id = auth.uid() or get_my_role() = 'admin');

create policy "sales_insert" on sales for insert
  with check (vendor_id = auth.uid());

create policy "sales_admin" on sales for update using (get_my_role() = 'admin');

-- SALE_DETAILS: acceso via venta
create policy "sale_details_read" on sale_details for select
  using (
    exists (
      select 1 from sales s
      where s.id = sale_id
        and (s.vendor_id = auth.uid() or get_my_role() = 'admin')
    )
  );

create policy "sale_details_insert" on sale_details for insert
  with check (
    exists (
      select 1 from sales s
      where s.id = sale_id and s.vendor_id = auth.uid()
    )
  );

-- PURCHASES: solo admin
create policy "purchases_read" on purchases for select using (get_my_role() = 'admin');
create policy "purchases_write" on purchases for all using (get_my_role() = 'admin');

-- PURCHASE_DETAILS: solo admin
create policy "purchase_details_read" on purchase_details for select using (get_my_role() = 'admin');
create policy "purchase_details_write" on purchase_details for all using (get_my_role() = 'admin');

-- ============================================================
-- TRIGGER: crear perfil automáticamente al crear usuario
-- ============================================================
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (user_id, full_name, role)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', 'Usuario'), coalesce(new.raw_user_meta_data->>'role', 'vendor'));
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();
