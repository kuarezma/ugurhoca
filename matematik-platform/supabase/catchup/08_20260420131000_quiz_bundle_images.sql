-- catchup: DÜZELTİLMİŞ KOPYA — kaynak supabase/migrations/20260420131000_quiz_bundle_images.sql
-- catchup: Production durumu: quiz-images bucket'ı public=true ile VAR; quiz_questions
-- catchup: görsel sütunları ve quiz_images_public_select politikası YOK.
-- catchup: Fark 1: bucket için "ON CONFLICT DO UPDATE SET public" yerine DO NOTHING —
-- catchup:         satır zaten aynı değerle var, hiçbir satır yazılmaz.
-- catchup: Fark 2: storage.objects politikası yetki hatasına dayanıklı DO bloğunda
-- catchup:         (postgres, storage.objects sahibi olmayabilir); hata uyarı olur.
-- catchup: Anlam kaynakla aynı; idempotent.
SET lock_timeout = '5s';

alter table public.quiz_questions
  add column if not exists question_image_url text,
  add column if not exists option_image_urls text[];

insert into storage.buckets (id, name, public)
values ('quiz-images', 'quiz-images', true)
on conflict (id) do nothing;

do $$
begin
  drop policy if exists "quiz_images_public_select" on storage.objects;
  create policy "quiz_images_public_select" on storage.objects
    for select using (bucket_id = 'quiz-images');
exception when insufficient_privilege then
  raise warning 'storage.objects politikası değiştirilemedi (sahiplik): quiz_images_public_select. Bucket public olduğu için görseller public URL ile yine okunur; listeleme için Dashboard > Storage > Policies.';
end $$;

reset lock_timeout;
