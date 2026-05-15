alter table public.live_lessons
  add column if not exists target_student_ids uuid[] default null;

create index if not exists live_lessons_target_student_ids_idx
  on public.live_lessons using gin (target_student_ids);
