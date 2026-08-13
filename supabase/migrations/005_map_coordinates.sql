-- Alumni map coordinates + public pin RPC.
-- Additive: safe to run after 001–004.
-- Pins are geocoded on profile save (Nominatim). Public map must not expose email/phone.

alter table public.profiles
  add column if not exists latitude double precision;

alter table public.profiles
  add column if not exists longitude double precision;

create index if not exists profiles_map_coordinates_idx
  on public.profiles (latitude, longitude)
  where latitude is not null and longitude is not null;

-- SECURITY DEFINER so anon can read pins without a profiles SELECT policy.
-- Returns only id + name + coordinates — never email, phone, or other profile fields.
create or replace function public.list_map_pins()
returns table (
  id uuid,
  full_name text,
  latitude double precision,
  longitude double precision
)
language sql
stable
security definer
set search_path = public
as $$
  select p.id, p.full_name, p.latitude, p.longitude
  from public.profiles as p
  where p.latitude is not null
    and p.longitude is not null;
$$;

comment on function public.list_map_pins() is
  'Public alumni map pins: id, full_name, latitude, longitude only.';

revoke all on function public.list_map_pins() from public;
grant execute on function public.list_map_pins() to anon, authenticated;
