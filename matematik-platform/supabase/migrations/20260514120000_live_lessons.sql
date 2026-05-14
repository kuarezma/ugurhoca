create table if not exists public.live_lessons (
  id uuid primary key default gen_random_uuid(),
  room_id text not null unique,
  title text not null,
  description text,
  target_grade text not null,
  starts_at timestamptz not null,
  duration_minutes integer not null default 60,
  status text not null default 'scheduled' check (status in ('scheduled', 'active', 'ended', 'cancelled')),
  created_by uuid references auth.users(id) on delete set null,
  teacher_proof text,
  started_at timestamptz,
  ended_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists live_lessons_status_starts_at_idx
  on public.live_lessons (status, starts_at);

create index if not exists live_lessons_target_grade_idx
  on public.live_lessons (target_grade);

create table if not exists public.live_lesson_participants (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.live_lessons(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  user_name text not null,
  role text not null check (role in ('teacher', 'student')),
  joined_at timestamptz not null default now(),
  left_at timestamptz,
  microphone_allowed boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists live_lesson_participants_lesson_idx
  on public.live_lesson_participants (lesson_id, joined_at desc);

create table if not exists public.live_lesson_events (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.live_lessons(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  user_name text,
  event_type text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists live_lesson_events_lesson_idx
  on public.live_lesson_events (lesson_id, created_at desc);

create table if not exists public.live_lesson_chat_messages (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.live_lessons(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  user_name text not null,
  role text not null check (role in ('teacher', 'student')),
  message text not null,
  created_at timestamptz not null default now()
);

create index if not exists live_lesson_chat_messages_lesson_idx
  on public.live_lesson_chat_messages (lesson_id, created_at asc);

create table if not exists public.live_lesson_reminders (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.live_lessons(id) on delete cascade,
  reminder_type text not null default 'thirty_minutes',
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  unique (lesson_id, reminder_type)
);

alter table public.live_lessons enable row level security;
alter table public.live_lesson_participants enable row level security;
alter table public.live_lesson_events enable row level security;
alter table public.live_lesson_chat_messages enable row level security;
alter table public.live_lesson_reminders enable row level security;

drop policy if exists "live_lessons_authenticated_select" on public.live_lessons;
create policy "live_lessons_authenticated_select" on public.live_lessons
  for select using (auth.role() = 'authenticated');

drop policy if exists "live_lesson_participants_authenticated_select" on public.live_lesson_participants;
create policy "live_lesson_participants_authenticated_select" on public.live_lesson_participants
  for select using (auth.role() = 'authenticated');

drop policy if exists "live_lesson_events_authenticated_select" on public.live_lesson_events;
create policy "live_lesson_events_authenticated_select" on public.live_lesson_events
  for select using (auth.role() = 'authenticated');

drop policy if exists "live_lesson_chat_authenticated_select" on public.live_lesson_chat_messages;
create policy "live_lesson_chat_authenticated_select" on public.live_lesson_chat_messages
  for select using (auth.role() = 'authenticated');

drop policy if exists "live_lesson_reminders_authenticated_select" on public.live_lesson_reminders;
create policy "live_lesson_reminders_authenticated_select" on public.live_lesson_reminders
  for select using (auth.role() = 'authenticated');

alter table public.live_lessons replica identity full;
alter table public.live_lesson_chat_messages replica identity full;
alter table public.live_lesson_events replica identity full;

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'live_lessons'
    ) then
      execute 'alter publication supabase_realtime add table public.live_lessons';
    end if;

    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'live_lesson_chat_messages'
    ) then
      execute 'alter publication supabase_realtime add table public.live_lesson_chat_messages';
    end if;
  end if;
end $$;
