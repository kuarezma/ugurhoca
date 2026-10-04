-- catchup: BİREBİR KOPYA — kaynak supabase/migrations/20260515110000_live_lesson_selected_students.sql (bu dal)
-- catchup: "-- catchup" ile işaretli satırlar dışında kaynakla aynıdır (verify-copies.sh).
SET lock_timeout = '5s'; -- catchup
alter table public.live_lessons
  add column if not exists target_student_ids uuid[] default null;

create index if not exists live_lessons_target_student_ids_idx
  on public.live_lessons using gin (target_student_ids);
