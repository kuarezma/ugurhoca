alter table public.quiz_questions
  add column if not exists question_image_url text,
  add column if not exists option_image_urls text[];

insert into storage.buckets (id, name, public)
values ('quiz-images', 'quiz-images', true)
on conflict (id) do update
set public = excluded.public;

drop policy if exists "quiz_images_public_select" on storage.objects;
create policy "quiz_images_public_select" on storage.objects
  for select using (bucket_id = 'quiz-images');
