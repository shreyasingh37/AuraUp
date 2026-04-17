-- AuraUp (MVP) schema + RLS policies
-- Run this in Supabase SQL editor (Database -> SQL).

create extension if not exists pgcrypto;

-- 1) users table (mirrors auth.users)
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text
);

alter table public.users enable row level security;

drop policy if exists "Users can read their profile" on public.users;
drop policy if exists "Users can insert their profile" on public.users;
drop policy if exists "Users can update their profile" on public.users;

create policy "Users can read their profile"
on public.users for select
to authenticated
using (id = auth.uid());

-- Insert is handled by trigger; keep policy permissive for authenticated inserts.
create policy "Users can insert their profile"
on public.users for insert
to authenticated
with check (id = auth.uid());

create policy "Users can update their profile"
on public.users for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

-- Automatically create public.users row when someone signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (id, email)
  values (new.id, new.email)
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2) habits table
create table if not exists public.habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  workout boolean not null default false,
  water boolean not null default false,
  skincare boolean not null default false,
  created_at timestamptz not null default now(),
  unique (user_id, date)
);

alter table public.habits enable row level security;

drop policy if exists "Users manage their habits" on public.habits;

create policy "Users manage their habits"
on public.habits for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

-- 3) photos table
create table if not exists public.photos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  image_url text not null, -- storage path within the 'photos' bucket
  date date not null,
  created_at timestamptz not null default now(),
  unique (user_id, date)
);

alter table public.photos enable row level security;

drop policy if exists "Users manage their photos rows" on public.photos;

create policy "Users manage their photos rows"
on public.photos for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

-- 4) Storage policies (bucket: 'photos')
-- Create a private bucket named 'photos' in Storage first.
-- File path convention used by the app: "<user_id>/<YYYY-MM-DD>.<ext>"

drop policy if exists "Users can read their photo files" on storage.objects;
drop policy if exists "Users can upload their photo files" on storage.objects;
drop policy if exists "Users can update their photo files" on storage.objects;
drop policy if exists "Users can delete their photo files" on storage.objects;

create policy "Users can read their photo files"
on storage.objects for select
to authenticated
using (
  bucket_id = 'photos'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Users can upload their photo files"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'photos'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Users can update their photo files"
on storage.objects for update
to authenticated
using (
  bucket_id = 'photos'
  and auth.uid()::text = (storage.foldername(name))[1]
)
with check (
  bucket_id = 'photos'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Users can delete their photo files"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'photos'
  and auth.uid()::text = (storage.foldername(name))[1]
);
