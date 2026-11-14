-- Grass: one row per person holding their planner. Run once in Supabase → SQL Editor → New query → Run.
create table if not exists public.app_state (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  data       jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.app_state enable row level security;

-- Each signed-in person can only see and change their own row.
drop policy if exists "read own planner" on public.app_state;
drop policy if exists "add own planner" on public.app_state;
drop policy if exists "change own planner" on public.app_state;
drop policy if exists "delete own planner" on public.app_state;
create policy "read own planner"   on public.app_state for select using (auth.uid() = user_id);
create policy "add own planner"    on public.app_state for insert with check (auth.uid() = user_id);
create policy "change own planner" on public.app_state for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "delete own planner" on public.app_state for delete using (auth.uid() = user_id);
