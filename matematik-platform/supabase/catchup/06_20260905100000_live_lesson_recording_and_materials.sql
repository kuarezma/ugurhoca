-- catchup: BİREBİR KOPYA — kaynak supabase/migrations/20260905100000_live_lesson_recording_and_materials.sql (bu dal)
-- catchup: "-- catchup" ile işaretli satırlar dışında kaynakla aynıdır (verify-copies.sh).
SET lock_timeout = '5s'; -- catchup
-- Add recording_url and materials_url columns to live_lessons
alter table public.live_lessons
  add column if not exists recording_url text,
  add column if not exists materials_url text;
