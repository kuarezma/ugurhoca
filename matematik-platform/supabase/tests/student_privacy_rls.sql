-- Temel şema ve catch-up uygulanmış yerel/kopya Supabase veritabanında:
-- psql "$DB_URL" -X -v ON_ERROR_STOP=1 -f supabase/tests/student_privacy_rls.sql
-- Fixture yazmaları yalnız bu transaction içindedir; production'da çalıştırmayın.
BEGIN;

INSERT INTO auth.users (id, email) VALUES
  ('60000000-0000-4000-8000-00000000000a', 'rls-ogrenci-a@example.com'),
  ('60000000-0000-4000-8000-00000000000b', 'rls-ogrenci-b@example.com');

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
SELECT pg_temp.expect_count('A kendi profilini görür',
  (SELECT count(*) FROM public.profiles WHERE id = '60000000-0000-4000-8000-00000000000a'), 1);
SELECT pg_temp.expect_count('A B profilini göremez',
  (SELECT count(*) FROM public.profiles WHERE id = '60000000-0000-4000-8000-00000000000b'), 0);
SELECT pg_temp.expect_count('A yalnız kendi dokümanını görür',
  (SELECT count(*) FROM public.shared_documents WHERE id IN (
    '60000000-0000-4000-8000-00000000001a', '60000000-0000-4000-8000-00000000001b')), 1);
SELECT pg_temp.expect_count('A B bildirimini göremez',
  (SELECT count(*) FROM public.notifications WHERE id = '60000000-0000-4000-8000-00000000002b'), 0);
SELECT pg_temp.expect_denied('A B adına doküman ekleyemez',
  'INSERT INTO public.shared_documents (student_id) VALUES (''60000000-0000-4000-8000-00000000000b'')');

SELECT set_config('request.jwt.claims',
  '{"sub":"60000000-0000-4000-8000-00000000000b","email":"rls-ogrenci-b@example.com","role":"authenticated"}', true);
SELECT pg_temp.expect_count('B A dokümanını göremez',
  (SELECT count(*) FROM public.shared_documents WHERE id = '60000000-0000-4000-8000-00000000001a'), 0);
SELECT pg_temp.expect_count('B kendi bildirimini görür',
  (SELECT count(*) FROM public.notifications WHERE id = '60000000-0000-4000-8000-00000000002b'), 1);

SELECT set_config('request.jwt.claims',
  '{"sub":"60000000-0000-4000-8000-0000000000ad","email":"admin@ugurhoca.com","role":"authenticated"}', true);
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

RESET ROLE;
SET LOCAL ROLE anon;
SELECT pg_temp.expect_denied('Anon paylaşılan dokümanları okuyamaz',
  'SELECT count(*) FROM public.shared_documents');

RESET ROLE;
ROLLBACK;
