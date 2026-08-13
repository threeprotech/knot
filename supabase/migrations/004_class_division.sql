-- Last studied class and division (e.g. XI - C).
-- Additive: safe to run after 001–003. Columns are nullable so existing profiles still save.

alter table public.profiles
  add column if not exists last_class text;

alter table public.profiles
  add column if not exists last_division text;
