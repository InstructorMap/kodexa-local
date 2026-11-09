-- KODEXA Delivery — esquema de referencia, NO ejecutar directamente.
-- Antes de convertirlo en migración:
-- 1) generar el archivo con `supabase migration new delivery_multitenant`
-- 2) revisar el esquema real y roles del proyecto objetivo
-- 3) ejecutar en local/staging y probar RLS con dos usuarios/tiendas.
-- Este borrador no crea bucket ni modifica Storage.

create schema if not exists private;

create table if not exists public.stores (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete restrict,
  name text not null check (char_length(name) between 2 and 100),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  category text not null,
  description text,
  phone text not null,
  address text not null,
  cover_path text,
  status text not null default 'pending' check (status in ('pending','active','suspended','rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.store_members (
  store_id uuid not null references public.stores(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('manager','staff')),
  created_at timestamptz not null default now(),
  primary key (store_id, user_id)
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 120),
  description text,
  price numeric(12,2) not null check (price > 0),
  image_path text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (store_id, id)
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete restrict,
  customer_id uuid not null references auth.users(id) on delete restrict,
  status text not null default 'pending' check (status in ('pending','accepted','preparing','ready','in_delivery','completed','cancelled')),
  delivery_address text not null,
  payment_method text not null check (payment_method in ('cash','bank_transfer')),
  customer_note text,
  subtotal numeric(12,2) not null default 0 check (subtotal >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (store_id, id)
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null,
  order_id uuid not null,
  product_id uuid not null,
  product_name text not null,
  quantity integer not null check (quantity between 1 and 99),
  unit_price numeric(12,2) not null check (unit_price > 0),
  created_at timestamptz not null default now(),
  foreign key (store_id, order_id) references public.orders(store_id, id) on delete cascade,
  foreign key (store_id, product_id) references public.products(store_id, id) on delete restrict
);

create index if not exists products_store_active_idx on public.products(store_id, is_active);
create index if not exists orders_store_created_idx on public.orders(store_id, created_at desc);
create index if not exists orders_customer_created_idx on public.orders(customer_id, created_at desc);
create index if not exists store_members_user_idx on public.store_members(user_id, store_id);

-- La función vive en un schema no expuesto. SECURITY DEFINER evita recursión
-- al consultar membresías desde las políticas; auth.uid() sigue limitando al caller.
create or replace function private.is_store_member(_store_id uuid, _roles text[] default null)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    (select auth.uid()) is not null
    and exists (
      select 1
      from public.stores s
      where s.id = _store_id
        and (
          s.owner_user_id = (select auth.uid())
          or exists (
            select 1
            from public.store_members m
            where m.store_id = s.id
              and m.user_id = (select auth.uid())
              and (_roles is null or m.role = any(_roles))
          )
        )
    );
$$;

revoke all on function private.is_store_member(uuid, text[]) from public;
grant usage on schema private to authenticated;
grant execute on function private.is_store_member(uuid, text[]) to authenticated;

alter table public.stores enable row level security;
alter table public.store_members enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- Grants mínimos. Revisar Data API settings del proyecto antes de aplicar.
grant select on public.stores, public.products to anon, authenticated;
grant insert, update, delete on public.stores to authenticated;
grant select, insert, update, delete on public.store_members to authenticated;
grant insert, update, delete on public.products to authenticated;
grant select, update on public.orders to authenticated;
grant select on public.order_items to authenticated;

-- Stores: catálogo público solo activo; propietario/equipo puede ver su espacio.
create policy stores_public_read_active on public.stores
for select to anon, authenticated
using (status = 'active' or private.is_store_member(id));

create policy stores_owner_create on public.stores
for insert to authenticated
with check (owner_user_id = (select auth.uid()) and status = 'pending');

create policy stores_managers_update on public.stores
for update to authenticated
using (private.is_store_member(id, array['manager']))
with check (private.is_store_member(id, array['manager']));

create policy stores_owner_delete on public.stores
for delete to authenticated
using (owner_user_id = (select auth.uid()));

-- Members: cada usuario ve su membresía; owner/manager administra el equipo.
create policy store_members_read_self_or_managers on public.store_members
for select to authenticated
using (user_id = (select auth.uid()) or private.is_store_member(store_id, array['manager']));

create policy store_members_managers_add on public.store_members
for insert to authenticated
with check (private.is_store_member(store_id, array['manager']));

create policy store_members_managers_update on public.store_members
for update to authenticated
using (private.is_store_member(store_id, array['manager']))
with check (private.is_store_member(store_id, array['manager']));

create policy store_members_managers_delete on public.store_members
for delete to authenticated
using (private.is_store_member(store_id, array['manager']));

-- Products: lectura pública solo si tienda y producto están activos.
create policy products_public_read_active on public.products
for select to anon, authenticated
using (
  (is_active and exists (
    select 1 from public.stores s where s.id = store_id and s.status = 'active'
  ))
  or private.is_store_member(store_id)
);

create policy products_store_insert on public.products
for insert to authenticated
with check (private.is_store_member(store_id, array['manager','staff']));

create policy products_store_update on public.products
for update to authenticated
using (private.is_store_member(store_id, array['manager','staff']))
with check (private.is_store_member(store_id, array['manager','staff']));

create policy products_store_delete on public.products
for delete to authenticated
using (private.is_store_member(store_id, array['manager']));

-- Orders: cliente solo ve sus pedidos; equipo solo los de su tienda.
create policy orders_customer_or_store_read on public.orders
for select to authenticated
using (customer_id = (select auth.uid()) or private.is_store_member(store_id));

-- El alta de pedidos se realiza exclusivamente mediante Edge Function/RPC transaccional
-- que valide usuario, tienda, estado, stock y precios desde la base de datos.

create policy orders_store_update on public.orders
for update to authenticated
using (private.is_store_member(store_id, array['manager','staff']))
with check (private.is_store_member(store_id, array['manager','staff']));

-- Líneas: el cliente solo agrega ítems a su pedido pendiente y productos de la misma tienda.
create policy order_items_customer_or_store_read on public.order_items
for select to authenticated
using (
  private.is_store_member(store_id)
  or exists (
    select 1 from public.orders o
    where o.id = order_id and o.store_id = store_id
      and o.customer_id = (select auth.uid())
  )
);

-- IMPORTANTE: no se concede INSERT directo a authenticated en orders/order_items.
-- Checkout debe implementarse como Edge Function/RPC transaccional que valide
-- auth.uid(), tienda activa, productos activos, cantidades y precios actuales;
-- debe calcular subtotal y guardar product_name/unit_price desde products.
-- Nunca confiar en precios, subtotal, customer_id o store_id enviados por el navegador.
-- Las políticas anteriores son un marco inicial y requieren pruebas de integración.
