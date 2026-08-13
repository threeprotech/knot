-- Admin role, events, alerts, and admin write policies for lookup tables.
-- Additive: safe to run after 001_init.sql and 002_avatars.sql.
--
-- First admin (required for RLS writes — env ADMIN_EMAILS cannot be read from SQL):
--   update public.profiles set role = 'admin' where email = 'you@email.com';

-- ---------------------------------------------------------------------------
-- profiles.role
-- ---------------------------------------------------------------------------
alter table public.profiles
  add column if not exists role text not null default 'member';

alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles
  add constraint profiles_role_check check (role in ('member', 'admin'));

-- ---------------------------------------------------------------------------
-- is_admin() — used by RLS. SECURITY DEFINER avoids recursive profile RLS.
-- ---------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

grant execute on function public.is_admin() to anon, authenticated;

-- Keep members from promoting themselves. SQL editor (no JWT) can still set role.
create or replace function public.protect_profile_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    return new;
  end if;

  if tg_op = 'INSERT' then
    new.role := 'member';
    return new;
  end if;

  if new.role is distinct from old.role and not public.is_admin() then
    new.role := old.role;
  end if;

  return new;
end;
$$;

drop trigger if exists profiles_protect_role on public.profiles;
create trigger profiles_protect_role
before insert or update on public.profiles
for each row execute function public.protect_profile_role();

-- ---------------------------------------------------------------------------
-- events
-- ---------------------------------------------------------------------------
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  location text,
  starts_at timestamptz not null,
  ends_at timestamptz,
  visibility text not null default 'public' check (visibility in ('public', 'members')),
  drive_url text,
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists events_starts_at_idx on public.events (starts_at);
create index if not exists events_visibility_idx on public.events (visibility);

drop trigger if exists events_set_updated_at on public.events;
create trigger events_set_updated_at
before update on public.events
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- alerts
-- ---------------------------------------------------------------------------
create table if not exists public.alerts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text,
  link_url text,
  starts_at timestamptz not null default now(),
  ends_at timestamptz,
  visibility text not null default 'public' check (visibility in ('public', 'members')),
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists alerts_starts_at_idx on public.alerts (starts_at);
create index if not exists alerts_visibility_idx on public.alerts (visibility);

drop trigger if exists alerts_set_updated_at on public.alerts;
create trigger alerts_set_updated_at
before update on public.alerts
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- RLS: events
-- anon reads public; authenticated reads all (including expired; app filters feeds)
-- writes: admins only
-- ---------------------------------------------------------------------------
alter table public.events enable row level security;

drop policy if exists "Public can read public events" on public.events;
drop policy if exists "Authenticated can read all events" on public.events;
drop policy if exists "Admins can insert events" on public.events;
drop policy if exists "Admins can update events" on public.events;
drop policy if exists "Admins can delete events" on public.events;

create policy "Public can read public events"
  on public.events for select
  to anon
  using (visibility = 'public');

create policy "Authenticated can read all events"
  on public.events for select
  to authenticated
  using (true);

create policy "Admins can insert events"
  on public.events for insert
  to authenticated
  with check (public.is_admin());

create policy "Admins can update events"
  on public.events for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins can delete events"
  on public.events for delete
  to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- RLS: alerts
-- ---------------------------------------------------------------------------
alter table public.alerts enable row level security;

drop policy if exists "Public can read public alerts" on public.alerts;
drop policy if exists "Authenticated can read all alerts" on public.alerts;
drop policy if exists "Admins can insert alerts" on public.alerts;
drop policy if exists "Admins can update alerts" on public.alerts;
drop policy if exists "Admins can delete alerts" on public.alerts;

create policy "Public can read public alerts"
  on public.alerts for select
  to anon
  using (visibility = 'public');

create policy "Authenticated can read all alerts"
  on public.alerts for select
  to authenticated
  using (true);

create policy "Admins can insert alerts"
  on public.alerts for insert
  to authenticated
  with check (public.is_admin());

create policy "Admins can update alerts"
  on public.alerts for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins can delete alerts"
  on public.alerts for delete
  to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- industries / skills: admin writes (select stays authenticated-only)
-- ---------------------------------------------------------------------------
drop policy if exists "Admins can insert industries" on public.industries;
drop policy if exists "Admins can update industries" on public.industries;
drop policy if exists "Admins can delete industries" on public.industries;
drop policy if exists "Admins can insert skills" on public.skills;
drop policy if exists "Admins can update skills" on public.skills;
drop policy if exists "Admins can delete skills" on public.skills;

create policy "Admins can insert industries"
  on public.industries for insert
  to authenticated
  with check (public.is_admin());

create policy "Admins can update industries"
  on public.industries for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins can delete industries"
  on public.industries for delete
  to authenticated
  using (public.is_admin());

create policy "Admins can insert skills"
  on public.skills for insert
  to authenticated
  with check (public.is_admin());

create policy "Admins can update skills"
  on public.skills for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins can delete skills"
  on public.skills for delete
  to authenticated
  using (public.is_admin());
