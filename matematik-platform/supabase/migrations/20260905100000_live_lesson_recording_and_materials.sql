-- Add recording_url and materials_url columns to live_lessons
alter table public.live_lessons
  add column if not exists recording_url text,
  add column if not exists materials_url text;
