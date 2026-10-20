-- ============================================================
-- HabitFlow - Supabase database schema
-- Run this file in the Supabase SQL editor (or via Supabase CLI).
-- It creates the tables, indexes, triggers, Row Level Security (RLS)
-- policies and the RPCs used by the application.
--
-- Safe to re-run: tables use IF NOT EXISTS and policies are dropped
-- before being recreated.
-- ============================================================

create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
-- TASKS
-- ------------------------------------------------------------
create table if not exists public.tasks (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users (id) on delete cascade,
  title         text not null,
  description   text,
  priority      text not null default 'medium'
                check (priority in ('high', 'medium', 'low')),
  due_date      date,
  due_time      time,
  is_completed  boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists tasks_user_id_idx on public.tasks (user_id);

-- ------------------------------------------------------------
-- HABITS
-- ------------------------------------------------------------
create table if not exists public.habits (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  name        text not null,
  description text,
  target      integer not null default 1,
  unit        text,
  created_at  timestamptz not null default now()
);

create index if not exists habits_user_id_idx on public.habits (user_id);

-- ------------------------------------------------------------
-- HABIT LOGS (one row per habit per day)
-- completed_date is stored as a local "YYYY-MM-DD" string on the
-- client to avoid timezone drift between device and server.
-- ------------------------------------------------------------
create table if not exists public.habit_logs (
  id             uuid primary key default gen_random_uuid(),
  habit_id       uuid not null references public.habits (id) on delete cascade,
  user_id        uuid not null references auth.users (id) on delete cascade,
  completed_date date not null,
  created_at     timestamptz not null default now(),
  constraint habit_logs_habit_date_unique unique (habit_id, completed_date)
);

create index if not exists habit_logs_user_id_idx on public.habit_logs (user_id);
create index if not exists habit_logs_habit_id_idx on public.habit_logs (habit_id);

-- ------------------------------------------------------------
-- PROFILES (one row per user, created automatically on sign-up)
-- Stores display data and JSON preference blobs used by the app.
-- id references auth.users so deleting the user cascades here.
-- ------------------------------------------------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  full_name   text,
  bio         text,
  avatar_url  text,
  preferences jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ------------------------------------------------------------
-- updated_at trigger (shared by tasks and profiles)
-- ------------------------------------------------------------
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_tasks_updated_at on public.tasks;
create trigger set_tasks_updated_at
  before update on public.tasks
  for each row execute function public.handle_updated_at();

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

-- ------------------------------------------------------------
-- Auto-create a profile row whenever a new user signs up.
-- SECURITY DEFINER is required because it inserts on behalf of the
-- auth schema; it only ever inserts new.id and never accepts input.
-- ------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ------------------------------------------------------------
-- Delete the currently authenticated user (account deletion).
-- Runs as the function owner to remove the auth.users row; the
-- auth.uid() guard ensures a caller can only delete themselves.
-- ------------------------------------------------------------
create or replace function public.delete_current_user()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    raise exception 'Not authenticated';
  end if;
  delete from auth.users where id = v_uid;
end;
$$;

-- Only signed-in users may call the function (PUBLIC has EXECUTE by default).
revoke execute on function public.delete_current_user() from public;
revoke execute on function public.delete_current_user() from anon;
grant execute on function public.delete_current_user() to authenticated;

-- ------------------------------------------------------------
-- Row Level Security
-- ------------------------------------------------------------
alter table public.tasks      enable row level security;
alter table public.habits     enable row level security;
alter table public.habit_logs enable row level security;
alter table public.profiles   enable row level security;

-- Tasks: a user can only access their own rows.
drop policy if exists "tasks_select_own" on public.tasks;
create policy "tasks_select_own" on public.tasks
  for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "tasks_insert_own" on public.tasks;
create policy "tasks_insert_own" on public.tasks
  for insert to authenticated with check ((select auth.uid()) = user_id);

drop policy if exists "tasks_update_own" on public.tasks;
create policy "tasks_update_own" on public.tasks
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "tasks_delete_own" on public.tasks;
create policy "tasks_delete_own" on public.tasks
  for delete to authenticated using ((select auth.uid()) = user_id);

-- Habits: a user can only access their own rows.
drop policy if exists "habits_select_own" on public.habits;
create policy "habits_select_own" on public.habits
  for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "habits_insert_own" on public.habits;
create policy "habits_insert_own" on public.habits
  for insert to authenticated with check ((select auth.uid()) = user_id);

drop policy if exists "habits_update_own" on public.habits;
create policy "habits_update_own" on public.habits
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "habits_delete_own" on public.habits;
create policy "habits_delete_own" on public.habits
  for delete to authenticated using ((select auth.uid()) = user_id);

-- Habit logs: a user can access their own rows, and inserts must
-- reference a habit that also belongs to them.
drop policy if exists "habit_logs_select_own" on public.habit_logs;
create policy "habit_logs_select_own" on public.habit_logs
  for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "habit_logs_insert_own" on public.habit_logs;
create policy "habit_logs_insert_own" on public.habit_logs
  for insert to authenticated with check (
    (select auth.uid()) = user_id
    and exists (
      select 1 from public.habits h
      where h.id = habit_id and h.user_id = (select auth.uid())
    )
  );

drop policy if exists "habit_logs_delete_own" on public.habit_logs;
create policy "habit_logs_delete_own" on public.habit_logs
  for delete to authenticated using ((select auth.uid()) = user_id);

-- Profiles: a user can only access their own profile row.
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select to authenticated using ((select auth.uid()) = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert to authenticated with check ((select auth.uid()) = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- ------------------------------------------------------------
-- Data API access
-- Tables created via SQL may not be exposed automatically depending
-- on your project's Data API settings. These grants (combined with
-- RLS above) make the tables reachable through the REST API while
-- keeping every row protected.
-- ------------------------------------------------------------
grant usage on schema public to anon, authenticated;
grant select, insert, update, delete
  on public.tasks, public.habits, public.habit_logs, public.profiles
  to authenticated;
