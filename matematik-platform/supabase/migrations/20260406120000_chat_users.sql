-- Oturum sohbeti giriş kayıtları (ChatLogin upsert)
-- Supabase Dashboard → SQL Editor’da bir kez çalıştırın (veya supabase db push).

create table if not exists public.chat_users (
  tc_number text primary key,
  full_name text not null,
  display_name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.chat_users enable row level security;

drop policy if exists "chat_users_select" on public.chat_users;
drop policy if exists "chat_users_insert" on public.chat_users;
drop policy if exists "chat_users_update" on public.chat_users;

create policy "chat_users_select" on public.chat_users for select using (true);
create policy "chat_users_insert" on public.chat_users for insert with check (true);
create policy "chat_users_update" on public.chat_users for update using (true) with check (true);
