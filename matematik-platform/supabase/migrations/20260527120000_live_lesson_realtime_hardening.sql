alter table public.live_lesson_participants
  add column if not exists identity text,
  add column if not exists mic_permission text not null default 'blocked'
    check (mic_permission in ('blocked', 'requested', 'allowed')),
  add column if not exists hand_status text not null default 'lowered'
    check (hand_status in ('lowered', 'raised', 'mic_requested')),
  add column if not exists approved_at timestamptz,
  add column if not exists muted_by_teacher boolean not null default true,
  add column if not exists last_seen_at timestamptz,
  add column if not exists updated_at timestamptz not null default now();

create index if not exists live_lesson_participants_identity_idx
  on public.live_lesson_participants (lesson_id, identity)
  where identity is not null;

create index if not exists live_lesson_participants_active_identity_idx
  on public.live_lesson_participants (lesson_id, identity, left_at)
  where identity is not null;

alter table public.live_lesson_participants replica identity full;

drop policy if exists "live_lessons_authenticated_select" on public.live_lessons;
drop policy if exists "live_lessons_scoped_select" on public.live_lessons;
create policy "live_lessons_scoped_select" on public.live_lessons
  for select to authenticated
  using (
    public.is_admin_email()
    or target_grade = 'all'
    or (
      target_grade = 'selected'
      and target_student_ids is not null
      and target_student_ids @> array[auth.uid()]
    )
    or exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and target_grade = p.grade::text
    )
  );

drop policy if exists "live_lesson_participants_authenticated_select" on public.live_lesson_participants;
drop policy if exists "live_lesson_participants_scoped_select" on public.live_lesson_participants;
create policy "live_lesson_participants_scoped_select" on public.live_lesson_participants
  for select to authenticated
  using (
    public.is_admin_email()
    or user_id = auth.uid()
  );

drop policy if exists "live_lesson_events_authenticated_select" on public.live_lesson_events;
drop policy if exists "live_lesson_events_scoped_select" on public.live_lesson_events;
create policy "live_lesson_events_scoped_select" on public.live_lesson_events
  for select to authenticated
  using (
    public.is_admin_email()
    or user_id = auth.uid()
  );

drop policy if exists "live_lesson_chat_authenticated_select" on public.live_lesson_chat_messages;
drop policy if exists "live_lesson_chat_scoped_select" on public.live_lesson_chat_messages;
create policy "live_lesson_chat_scoped_select" on public.live_lesson_chat_messages
  for select to authenticated
  using (
    public.is_admin_email()
    or exists (
      select 1
      from public.live_lessons lesson
      where lesson.id = live_lesson_chat_messages.lesson_id
        and (
          lesson.target_grade = 'all'
          or (
            lesson.target_grade = 'selected'
            and lesson.target_student_ids is not null
            and lesson.target_student_ids @> array[auth.uid()]
          )
          or exists (
            select 1
            from public.profiles p
            where p.id = auth.uid()
              and lesson.target_grade = p.grade::text
          )
        )
    )
  );

drop policy if exists "live_lesson_reminders_authenticated_select" on public.live_lesson_reminders;
drop policy if exists "live_lesson_reminders_admin_select" on public.live_lesson_reminders;
create policy "live_lesson_reminders_admin_select" on public.live_lesson_reminders
  for select to authenticated
  using (public.is_admin_email());

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'live_lesson_participants'
    ) then
      execute 'alter publication supabase_realtime add table public.live_lesson_participants';
    end if;

    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'live_lesson_events'
    ) then
      execute 'alter publication supabase_realtime add table public.live_lesson_events';
    end if;
  end if;
end $$;
