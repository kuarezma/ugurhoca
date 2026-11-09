-- Temel şema ve catch-up uygulanmış yerel/kopya Supabase veritabanında:
-- psql "$DB_URL" -X -v ON_ERROR_STOP=1 -f supabase/tests/student_privacy_rls.sql
-- Fixture yazmaları yalnız bu transaction içindedir; production'da çalıştırmayın.
BEGIN;

INSERT INTO auth.users (id, email) VALUES
  ('60000000-0000-4000-8000-00000000000a', 'rls-ogrenci-a@example.com'),
  ('60000000-0000-4000-8000-00000000000b', 'rls-ogrenci-b@example.com');

INSERT INTO auth.users (id, email) VALUES ('60000000-0000-4000-8000-00000000000c', 'rls-ogrenci-c@example.com');

INSERT INTO public.profiles (id, name, email, grade) VALUES
  ('60000000-0000-4000-8000-00000000000a', 'Öğrenci A', 'rls-ogrenci-a@example.com', '7'),
  ('60000000-0000-4000-8000-00000000000b', 'Öğrenci B', 'rls-ogrenci-b@example.com', '8')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, email = EXCLUDED.email, grade = EXCLUDED.grade;

INSERT INTO public.shared_documents (id, student_id, student_name, student_email) VALUES
  ('60000000-0000-4000-8000-00000000001a', '60000000-0000-4000-8000-00000000000a', 'Öğrenci A', 'rls-ogrenci-a@example.com'),
  ('60000000-0000-4000-8000-00000000001b', '60000000-0000-4000-8000-00000000000b', 'Öğrenci B', 'rls-ogrenci-b@example.com');

INSERT INTO public.notifications (id, user_id, title, type) VALUES
  ('60000000-0000-4000-8000-00000000002a', '60000000-0000-4000-8000-00000000000a', 'A bildirimi', 'message'),
  ('60000000-0000-4000-8000-00000000002b', '60000000-0000-4000-8000-00000000000b', 'B bildirimi', 'message');

INSERT INTO public.comments (id, user_id, content) VALUES
  ('60000000-0000-4000-8000-00000000003a', '60000000-0000-4000-8000-00000000000a', 'A yorumu'),
  ('60000000-0000-4000-8000-00000000003b', '60000000-0000-4000-8000-00000000000b', 'B yorumu');

INSERT INTO public.assignments (id, grade, student_id) VALUES
  ('60000000-0000-4000-8000-00000000004a', 7, NULL),
  ('60000000-0000-4000-8000-00000000004b', 8, '60000000-0000-4000-8000-00000000000b');

INSERT INTO public.live_lesson_chat_messages (lesson_id, user_id, user_name, role, message) VALUES
  ('60000000-0000-4000-8000-000000000001', '60000000-0000-4000-8000-00000000000a', 'Öğrenci A', 'student', 'A'),
  ('60000000-0000-4000-8000-000000000001', '60000000-0000-4000-8000-00000000000b', 'Öğrenci B', 'student', 'B');
INSERT INTO public.live_lesson_events (lesson_id, user_id, user_name, event_type) VALUES
  ('60000000-0000-4000-8000-000000000001', '60000000-0000-4000-8000-00000000000a', 'Öğrenci A', 'join'),
  ('60000000-0000-4000-8000-000000000001', '60000000-0000-4000-8000-00000000000b', 'Öğrenci B', 'join');

CREATE FUNCTION pg_temp.expect_count(label text, actual bigint, expected bigint)
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  IF actual IS DISTINCT FROM expected THEN
    RAISE EXCEPTION 'FAIL %: beklenen %, gelen %', label, expected, actual;
  END IF;
  RAISE NOTICE 'ok %', label;
END;
$$;
GRANT EXECUTE ON FUNCTION pg_temp.expect_count(text, bigint, bigint) TO authenticated;

CREATE FUNCTION pg_temp.expect_denied(label text, statement text)
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  EXECUTE statement;
  RAISE EXCEPTION 'FAIL %: sorgu reddedilmedi', label;
EXCEPTION WHEN insufficient_privilege THEN
  RAISE NOTICE 'ok %', label;
END;
$$;
GRANT EXECUTE ON FUNCTION pg_temp.expect_denied(text, text) TO anon, authenticated;

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims',
  '{"sub":"60000000-0000-4000-8000-00000000000a","email":"rls-ogrenci-a@example.com","role":"authenticated"}', true);
SELECT pg_temp.expect_count('A yalnız kendi ham sohbet adını okur',
  (SELECT count(*) FROM public.live_lesson_chat_messages), 1);
SELECT pg_temp.expect_count('A B ham sohbet adını okuyamaz',
  (SELECT count(*) FROM public.live_lesson_chat_messages WHERE user_id <> auth.uid()), 0);
SELECT pg_temp.expect_count('A yalnız kendi ham etkinliğini okur',
  (SELECT count(*) FROM public.live_lesson_events), 1);
SELECT pg_temp.expect_count('A B ham etkinliğini okuyamaz',
  (SELECT count(*) FROM public.live_lesson_events WHERE user_id <> auth.uid()), 0);
UPDATE public.profiles SET avatar_id = 'owl', welcome_tour_seen_at = '2026-11-10T10:00:00Z'
  WHERE id = auth.uid();
SELECT pg_temp.expect_count('A avatar ve tur durumunu günceller',
  (SELECT count(*) FROM public.profiles WHERE id = auth.uid() AND avatar_id = 'owl'
    AND welcome_tour_seen_at = '2026-11-10T10:00:00Z'), 1);
SELECT pg_temp.expect_denied('A grade değiştiremez', 'UPDATE public.profiles SET grade = 8 WHERE id = auth.uid()');
SELECT pg_temp.expect_denied('A email değiştiremez', 'UPDATE public.profiles SET email = ''changed@example.com'' WHERE id = auth.uid()');
SELECT pg_temp.expect_denied('A name değiştiremez', 'UPDATE public.profiles SET name = ''Değişti'' WHERE id = auth.uid()');
SELECT pg_temp.expect_denied('A is_private_student değiştiremez', 'UPDATE public.profiles SET is_private_student = true WHERE id = auth.uid()');
SELECT pg_temp.expect_denied('A current_streak değiştiremez', 'UPDATE public.profiles SET current_streak = 99 WHERE id = auth.uid()');
SELECT pg_temp.expect_denied('A is_favorite değiştiremez', 'UPDATE public.profiles SET is_favorite = true WHERE id = auth.uid()');
SELECT pg_temp.expect_denied('A last_active_date değiştiremez', 'UPDATE public.profiles SET last_active_date = ''2000-01-01'' WHERE id = auth.uid()');
SELECT pg_temp.expect_denied('A name_normalized değiştiremez', 'UPDATE public.profiles SET name_normalized = ''degisti'' WHERE id = auth.uid()');
SELECT pg_temp.expect_denied('A created_at değiştiremez', 'UPDATE public.profiles SET created_at = ''2000-01-01'' WHERE id = auth.uid()');

SELECT pg_temp.expect_denied('A profil kimliğini değiştiremez',
  'UPDATE public.profiles SET id = ''60000000-0000-4000-8000-00000000000c'' WHERE id = auth.uid()');
SELECT pg_temp.expect_denied('A başka kimlikle profil oluşturamaz',
  'INSERT INTO public.profiles (id, email) VALUES (''60000000-0000-4000-8000-00000000000c'', ''rls-ogrenci-a@example.com'')');
INSERT INTO public.profiles (id, name, email, grade) VALUES
  ('60000000-0000-4000-8000-00000000000a', 'Değişmemeli', 'rls-ogrenci-a@example.com', 8)
  ON CONFLICT (id) DO NOTHING;
SELECT pg_temp.expect_count('Tekrarlanan kayıt profili güncellemez',
  (SELECT count(*) FROM public.profiles WHERE id = auth.uid() AND grade = 7 AND name = 'Öğrenci A'), 1);
SELECT pg_temp.expect_count('A kendi profilini görür',
  (SELECT count(*) FROM public.profiles WHERE id = '60000000-0000-4000-8000-00000000000a'), 1);
SELECT pg_temp.expect_count('A B profilini göremez',
  (SELECT count(*) FROM public.profiles WHERE id = '60000000-0000-4000-8000-00000000000b'), 0);
SELECT pg_temp.expect_count('A yalnız kendi dokümanını görür',
  (SELECT count(*) FROM public.shared_documents WHERE id IN (
    '60000000-0000-4000-8000-00000000001a', '60000000-0000-4000-8000-00000000001b')), 1);
SELECT pg_temp.expect_count('A B bildirimini göremez',
  (SELECT count(*) FROM public.notifications WHERE id = '60000000-0000-4000-8000-00000000002b'), 0);
SELECT pg_temp.expect_count('A yalnız kendi yorumunu görür',
  (SELECT count(*) FROM public.comments WHERE id IN (
    '60000000-0000-4000-8000-00000000003a', '60000000-0000-4000-8000-00000000003b')), 1);
SELECT pg_temp.expect_count('A yalnız kendi sınıfının ödevini görür',
  (SELECT count(*) FROM public.assignments WHERE id IN (
    '60000000-0000-4000-8000-00000000004a', '60000000-0000-4000-8000-00000000004b')), 1);
SELECT pg_temp.expect_denied('A B adına doküman ekleyemez',
  'INSERT INTO public.shared_documents (student_id) VALUES (''60000000-0000-4000-8000-00000000000b'')');

DELETE FROM public.shared_documents WHERE id = '60000000-0000-4000-8000-00000000001b';
SELECT pg_temp.expect_count('A B dokümanını silemez',
  (SELECT count(*) FROM public.shared_documents WHERE id = '60000000-0000-4000-8000-00000000001a'), 1);

SELECT set_config('request.jwt.claims',
  '{"sub":"60000000-0000-4000-8000-00000000000b","email":"rls-ogrenci-b@example.com","role":"authenticated"}', true);
SELECT pg_temp.expect_count('B A dokümanını göremez',
  (SELECT count(*) FROM public.shared_documents WHERE id = '60000000-0000-4000-8000-00000000001a'), 0);
SELECT pg_temp.expect_count('B kendi bildirimini görür',
  (SELECT count(*) FROM public.notifications WHERE id = '60000000-0000-4000-8000-00000000002b'), 1);

SELECT set_config('request.jwt.claims',
  '{"sub":"60000000-0000-4000-8000-0000000000ad","email":"admin@ugurhoca.com","role":"authenticated"}', true);
SELECT pg_temp.expect_count('Admin ham sohbet adlarını görür',
  (SELECT count(*) FROM public.live_lesson_chat_messages), 2);
SELECT pg_temp.expect_count('Admin ham etkinlik adlarını görür',
  (SELECT count(*) FROM public.live_lesson_events), 2);
UPDATE public.profiles SET grade = 6, name = 'Düzeltilen ad', is_private_student = true,
  current_streak = 3, is_favorite = true WHERE id = '60000000-0000-4000-8000-00000000000a';
SELECT pg_temp.expect_count('Admin korunan profil alanlarını günceller',
  (SELECT count(*) FROM public.profiles WHERE id = '60000000-0000-4000-8000-00000000000a'
    AND grade = 6 AND name = 'Düzeltilen ad' AND is_private_student AND is_favorite AND current_streak = 3), 1);

SELECT pg_temp.expect_count('Admin iki öğrenci profilini görür',
  (SELECT count(*) FROM public.profiles WHERE id IN (
    '60000000-0000-4000-8000-00000000000a',
    '60000000-0000-4000-8000-00000000000b')), 2);
SELECT pg_temp.expect_count('Admin iki dokümanı görür',
  (SELECT count(*) FROM public.shared_documents WHERE id IN (
    '60000000-0000-4000-8000-00000000001a', '60000000-0000-4000-8000-00000000001b')), 2);
SELECT pg_temp.expect_count('Admin iki bildirimi görür',
  (SELECT count(*) FROM public.notifications WHERE id IN (
    '60000000-0000-4000-8000-00000000002a', '60000000-0000-4000-8000-00000000002b')), 2);

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims',
  '{"sub":"60000000-0000-4000-8000-00000000000a","email":"rls-ogrenci-a@example.com","role":"authenticated"}', true);
DELETE FROM public.shared_documents WHERE id = '60000000-0000-4000-8000-00000000001a';
SELECT pg_temp.expect_count('A kendi paylaşılan dokümanını kaldırabilir',
  (SELECT count(*) FROM public.shared_documents WHERE id = '60000000-0000-4000-8000-00000000001a'), 0);

RESET ROLE;
SET LOCAL ROLE anon;
SELECT pg_temp.expect_denied('Anon paylaşılan dokümanları okuyamaz',
  'SELECT count(*) FROM public.shared_documents');
SELECT pg_temp.expect_denied('Anon yorumları okuyamaz',
  'SELECT count(*) FROM public.comments');
SELECT pg_temp.expect_denied('Anon ödevleri okuyamaz',
  'SELECT count(*) FROM public.assignments');

RESET ROLE;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims',
  '{"sub":"60000000-0000-4000-8000-00000000000c","email":"rls-ogrenci-c@example.com","role":"authenticated"}', true);
SELECT pg_temp.expect_denied('Yeni profil e-postası oturumla eşleşmeli',
  'INSERT INTO public.profiles (id, email) VALUES (auth.uid(), ''wrong@example.com'')');
INSERT INTO public.profiles (id, email, is_private_student, is_favorite, current_streak)
  VALUES (auth.uid(), 'rls-ogrenci-c@example.com', true, true, 99);
SELECT pg_temp.expect_count('Yeni öğrenci ayrıcalıkları sıfırlanır',
  (SELECT count(*) FROM public.profiles WHERE id = auth.uid() AND NOT is_private_student
    AND NOT is_favorite AND current_streak = 0), 1);
RESET ROLE;
ROLLBACK;
