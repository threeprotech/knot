-- Knot Alumni schema, RLS, and seed data

create extension if not exists "pgcrypto";

-- Industries
create table public.industries (
  id uuid primary key default gen_random_uuid(),
  name text not null unique
);

-- Skills
create table public.skills (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  category text not null check (category in ('Technical', 'Soft', 'Domain'))
);

-- Profiles (1:1 with auth.users)
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  email text not null,
  phone text,
  linkedin_url text,
  headline text,
  bio text,
  graduation_year int,
  location text,
  industry_id uuid references public.industries (id),
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Profile ↔ Skills
create table public.profile_skills (
  profile_id uuid not null references public.profiles (id) on delete cascade,
  skill_id uuid not null references public.skills (id) on delete cascade,
  primary key (profile_id, skill_id)
);

create index profiles_full_name_idx on public.profiles (full_name);
create index profiles_industry_id_idx on public.profiles (industry_id);
create index profile_skills_skill_id_idx on public.profile_skills (skill_id);

-- updated_at trigger
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

-- RLS
alter table public.industries enable row level security;
alter table public.skills enable row level security;
alter table public.profiles enable row level security;
alter table public.profile_skills enable row level security;

create policy "Authenticated users can read industries"
  on public.industries for select
  to authenticated
  using (true);

create policy "Authenticated users can read skills"
  on public.skills for select
  to authenticated
  using (true);

create policy "Authenticated users can read profiles"
  on public.profiles for select
  to authenticated
  using (true);

create policy "Users can insert own profile"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Authenticated users can read profile_skills"
  on public.profile_skills for select
  to authenticated
  using (true);

create policy "Users can insert own profile_skills"
  on public.profile_skills for insert
  to authenticated
  with check (auth.uid() = profile_id);

create policy "Users can update own profile_skills"
  on public.profile_skills for update
  to authenticated
  using (auth.uid() = profile_id)
  with check (auth.uid() = profile_id);

create policy "Users can delete own profile_skills"
  on public.profile_skills for delete
  to authenticated
  using (auth.uid() = profile_id);

-- Seed industries
insert into public.industries (name) values
  ('Technology'),
  ('Finance'),
  ('Healthcare'),
  ('Education'),
  ('Consulting'),
  ('Media & Communications'),
  ('Government & Public Policy'),
  ('Nonprofit'),
  ('Product & Design'),
  ('Entrepreneurship');

-- Seed skills
insert into public.skills (name, category) values
  ('JavaScript', 'Technical'),
  ('TypeScript', 'Technical'),
  ('Python', 'Technical'),
  ('Data Analysis', 'Technical'),
  ('Machine Learning', 'Technical'),
  ('Cloud Architecture', 'Technical'),
  ('DevOps', 'Technical'),
  ('Mobile Development', 'Technical'),
  ('UI Engineering', 'Technical'),
  ('Cybersecurity', 'Technical'),
  ('Leadership', 'Soft'),
  ('Mentorship', 'Soft'),
  ('Public Speaking', 'Soft'),
  ('Negotiation', 'Soft'),
  ('Team Building', 'Soft'),
  ('Written Communication', 'Soft'),
  ('Conflict Resolution', 'Soft'),
  ('Product Management', 'Domain'),
  ('Venture Capital', 'Domain'),
  ('Marketing Strategy', 'Domain'),
  ('UX Research', 'Domain'),
  ('Financial Modeling', 'Domain'),
  ('Operations', 'Domain'),
  ('Policy Analysis', 'Domain'),
  ('Fundraising', 'Domain');

-- Avatars storage
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars',
  'avatars',
  true,
  2097152,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do nothing;

create policy "Avatar images are publicly accessible"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "Users can upload own avatar"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can update own avatar"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can delete own avatar"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
