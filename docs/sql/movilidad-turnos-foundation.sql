-- KODEXA Local: base segura para Movilidad y Turnos.
-- Pendiente de ejecutar en un proyecto Supabase existente y probar con dos usuarios.
-- No crea proyectos ni recursos de pago.
create table if not exists public.ride_requests (
 id uuid primary key default gen_random_uuid(),
 passenger_id uuid not null default auth.uid() references auth.users(id),
 origin text not null check(length(trim(origin)) between 3 and 250),
 destination text not null check(length(trim(destination)) between 3 and 250),
 vehicle_type text not null check(length(vehicle_type) between 2 and 50),
 status text not null default 'requested' check(status in ('requested','assigned','in_progress','completed','cancelled')),
 created_at timestamptz not null default now(),
 constraint different_route check(lower(trim(origin)) <> lower(trim(destination)))
);
create table if not exists public.appointments (
 id uuid primary key default gen_random_uuid(),
 customer_id uuid not null default auth.uid() references auth.users(id),
 provider_id uuid not null references auth.users(id),
 service_name text not null check(length(trim(service_name)) between 2 and 120),
 starts_at timestamptz not null,
 status text not null default 'requested' check(status in ('requested','confirmed','completed','cancelled')),
 created_at timestamptz not null default now(),
 constraint provider_not_customer check(provider_id <> customer_id)
);
create index if not exists ride_requests_passenger_idx on public.ride_requests(passenger_id,created_at desc);
create index if not exists appointments_customer_idx on public.appointments(customer_id,starts_at);
create index if not exists appointments_provider_idx on public.appointments(provider_id,starts_at);
alter table public.ride_requests enable row level security;
alter table public.appointments enable row level security;
revoke all on public.ride_requests,public.appointments from anon,authenticated;
grant select,insert on public.ride_requests,public.appointments to authenticated;
create policy ride_read_own on public.ride_requests for select to authenticated
 using(passenger_id=(select auth.uid()));
create policy ride_create_own on public.ride_requests for insert to authenticated
 with check(passenger_id=(select auth.uid()) and status='requested');
create policy appointments_read_participants on public.appointments for select to authenticated
 using(customer_id=(select auth.uid()) or provider_id=(select auth.uid()));
create policy appointments_create_customer on public.appointments for insert to authenticated
 with check(customer_id=(select auth.uid()) and status='requested' and starts_at>now());
-- Sin UPDATE directo: las transiciones y asignaciones requieren RPC confiable.
-- Antes de producción: validación de prestadores, prevención de solapamientos,
-- permisos de despacho, pruebas RLS y flujos de cancelación.
