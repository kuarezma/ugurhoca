-- ==========================================================
-- F1-RLS senaryo testi: canlı ders tablolarının okuma kapsamı
-- (migration 20261004120000_live_lesson_rls_scope.sql).
--
-- Çalıştırma (yerel Supabase, migration'lar uygulanmış olmalı):
--   psql "$(supabase status -o env | sed -n 's/^DB_URL=//p' | tr -d '"')" \
--     -v ON_ERROR_STOP=1 -f supabase/tests/live_lesson_rls.sql
--
-- pgTAP gerektirmez: her doğrulama başarısızlıkta RAISE EXCEPTION ile durur,
-- başarıda NOTICE basar. Tüm dosya tek transaction içinde çalışır ve sonda
-- ROLLBACK edilir; veritabanında iz bırakmaz. Öğrenci sorguları fixture ders
-- kimlikleriyle (10000000-… / 20000000-…) sınırlıdır; veritabanında önceden
-- bulunan 'all' dersleri sonucu bozmaz.
--
-- Aktörler: admin (admin@ugurhoca.com), öğrenci A (7. sınıf), öğrenci B
-- (8. sınıf), anon, sınıf vakası kullanıcıları (aşağıdaki tablo).
-- Dersler (10000000-…):
--   L1 '7'                       L5 'selected' [A]
--   L2 '8'                       L6 '7' + bayat target_student_ids [B]
--   L3 'selected' [B]            L7 'selected' + NULL dizi
--   L4 'all'                     L8 'selected' + boş dizi
-- Sınıf vakası dersleri (20000000-…): G5 '5', G6 '6', G7 '7', G8 '8', GM 'Mezun'
-- ==========================================================

BEGIN;

-- --- Kurulum (sahip rolüyle) -------------------------------------------------
INSERT INTO auth.users (id, email) VALUES
  ('00000000-0000-4000-8000-0000000000ad', 'admin@ugurhoca.com'),
  ('00000000-0000-4000-8000-00000000000a', 'rls-ogrenci-a@example.com'),
  ('00000000-0000-4000-8000-00000000000b', 'rls-ogrenci-b@example.com');

-- auth.users tetikleyicisi profili zaten açmış olabilir; sınıfı sabitle.
INSERT INTO public.profiles (id, name, email, grade) VALUES
  ('00000000-0000-4000-8000-0000000000ad', 'Admin', 'admin@ugurhoca.com', NULL),
  ('00000000-0000-4000-8000-00000000000a', 'Ogrenci A', 'rls-ogrenci-a@example.com', '7'),
  ('00000000-0000-4000-8000-00000000000b', 'Ogrenci B', 'rls-ogrenci-b@example.com', '8')
ON CONFLICT (id) DO UPDATE SET grade = EXCLUDED.grade;

INSERT INTO public.live_lessons
  (id, room_id, title, target_grade, target_student_ids, starts_at, teacher_proof)
VALUES
  ('10000000-0000-4000-8000-000000000001', 'rlstest01', 'L1', '7', NULL, now(), 'gizli-1'),
  ('10000000-0000-4000-8000-000000000002', 'rlstest02', 'L2', '8', NULL, now(), 'gizli-2'),
  ('10000000-0000-4000-8000-000000000003', 'rlstest03', 'L3', 'selected',
    ARRAY['00000000-0000-4000-8000-00000000000b']::uuid[], now(), 'gizli-3'),
  ('10000000-0000-4000-8000-000000000004', 'rlstest04', 'L4', 'all', NULL, now(), 'gizli-4'),
  ('10000000-0000-4000-8000-000000000005', 'rlstest05', 'L5', 'selected',
    ARRAY['00000000-0000-4000-8000-00000000000a']::uuid[], now(), 'gizli-5'),
  ('10000000-0000-4000-8000-000000000006', 'rlstest06', 'L6', '7',
    ARRAY['00000000-0000-4000-8000-00000000000b']::uuid[], now(), 'gizli-6'),
  ('10000000-0000-4000-8000-000000000007', 'rlstest07', 'L7', 'selected', NULL, now(), 'gizli-7'),
  ('10000000-0000-4000-8000-000000000008', 'rlstest08', 'L8', 'selected',
    ARRAY[]::uuid[], now(), 'gizli-8'),
  ('20000000-0000-4000-8000-000000000005', 'rlsgrd05', 'G5', '5', NULL, now(), 'gizli-g5'),
  ('20000000-0000-4000-8000-000000000006', 'rlsgrd06', 'G6', '6', NULL, now(), 'gizli-g6'),
  ('20000000-0000-4000-8000-000000000007', 'rlsgrd07', 'G7', '7', NULL, now(), 'gizli-g7'),
  ('20000000-0000-4000-8000-000000000008', 'rlsgrd08', 'G8', '8', NULL, now(), 'gizli-g8'),
  ('20000000-0000-4000-8000-00000000000e', 'rlsgrdme', 'GM', 'Mezun', NULL, now(), 'gizli-gm');

INSERT INTO public.live_lesson_chat_messages (lesson_id, user_id, user_name, role, message) VALUES
  ('10000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-00000000000a', 'Ogrenci A', 'student', 'L1 mesajı'),
  ('10000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-00000000000b', 'Ogrenci B', 'student', 'L2 mesajı'),
  ('10000000-0000-4000-8000-000000000003', '00000000-0000-4000-8000-00000000000b', 'Ogrenci B', 'student', 'L3 mesajı'),
  ('10000000-0000-4000-8000-000000000004', '00000000-0000-4000-8000-0000000000ad', 'Admin', 'teacher', 'L4 mesajı');

INSERT INTO public.live_lesson_events (lesson_id, user_id, event_type, payload) VALUES
  ('10000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-00000000000a', 'join', '{}'),
  ('10000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-00000000000b', 'join', '{}'),
  ('10000000-0000-4000-8000-000000000003', '00000000-0000-4000-8000-0000000000ad', 'join_approved',
    '{"target_identity":"student-b"}');

-- A'nın L2'de (8. sınıf dersi, A erişemez) kendi katılımcı satırı da var.
INSERT INTO public.live_lesson_participants (lesson_id, user_id, user_name, role) VALUES
  ('10000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-00000000000a', 'Ogrenci A', 'student'),
  ('10000000-0000-4000-8000-000000000004', '00000000-0000-4000-8000-00000000000a', 'Ogrenci A', 'student'),
  ('10000000-0000-4000-8000-000000000004', '00000000-0000-4000-8000-00000000000b', 'Ogrenci B', 'student'),
  ('10000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-00000000000b', 'Ogrenci B', 'student'),
  ('10000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-00000000000a', 'Ogrenci A', 'student');

INSERT INTO public.live_lesson_reminders (lesson_id) VALUES
  ('10000000-0000-4000-8000-000000000001'),
  ('10000000-0000-4000-8000-000000000002');

-- Doğrulama yardımcıları: test bitince ROLLBACK ile kaybolur.
CREATE FUNCTION pg_temp.expect(label text, actual text, expected text)
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  IF actual IS DISTINCT FROM expected THEN
    RAISE EXCEPTION 'FAIL %: beklenen %, gelen %', label, expected, actual;
  END IF;
  RAISE NOTICE 'ok  %', label;
END;
$$;
GRANT EXECUTE ON FUNCTION pg_temp.expect(text, text, text) TO anon, authenticated, service_role;

-- Verilen ifade insufficient_privilege (42501: yetki ya da RLS ihlali) ile
-- düşmeli. Çağıran rolüyle çalışır (SECURITY INVOKER).
CREATE FUNCTION pg_temp.expect_denied(label text, statement text)
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  EXECUTE statement;
  RAISE EXCEPTION 'FAIL %: reddedilmedi (%)', label, statement;
EXCEPTION WHEN insufficient_privilege THEN
  RAISE NOTICE 'ok  %', label;
END;
$$;
GRANT EXECUTE ON FUNCTION pg_temp.expect_denied(text, text) TO anon, authenticated, service_role;

-- Verilen UPDATE/DELETE hiçbir satırı etkilememeli (yazma politikası yok).
CREATE FUNCTION pg_temp.expect_no_rows(label text, statement text)
RETURNS void LANGUAGE plpgsql AS $$
DECLARE
  affected bigint;
BEGIN
  EXECUTE statement;
  GET DIAGNOSTICS affected = ROW_COUNT;
  PERFORM pg_temp.expect(label, affected::text, '0');
EXCEPTION WHEN insufficient_privilege THEN
  RAISE NOTICE 'ok  % (yetkiyle reddedildi)', label;
END;
$$;
GRANT EXECUTE ON FUNCTION pg_temp.expect_no_rows(text, text) TO anon, authenticated, service_role;

-- --- Katalog: realtime yayını ve replica identity ----------------------------
SELECT pg_temp.expect('realtime: canlı ders tabloları yayında değil',
  (SELECT coalesce(string_agg(tablename, ','), '') FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public'
      AND tablename LIKE 'live_lesson%'), '');
SELECT pg_temp.expect('realtime: replica identity varsayılan',
  (SELECT string_agg(c.relname || '=' || c.relreplident::text, ',' ORDER BY c.relname)
     FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relkind = 'r' AND c.relname LIKE 'live_lesson%'),
  'live_lesson_chat_messages=d,live_lesson_events=d,live_lesson_participants=d,live_lesson_reminders=d,live_lessons=d');

-- --- Öğrenci A (7. sınıf) ----------------------------------------------------
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims',
  '{"sub":"00000000-0000-4000-8000-00000000000a","email":"rls-ogrenci-a@example.com","role":"authenticated"}', true);

SELECT pg_temp.expect('A: dersler (L6 sınıf dersi olarak açık; L7/L8 boş seçim kapalı)',
  (SELECT string_agg(title, ',' ORDER BY title) FROM public.live_lessons
    WHERE id::text LIKE '10000000-%'), 'L1,L4,L5,L6');
SELECT pg_temp.expect('A: sohbet yalnız erişilen derslerden',
  (SELECT string_agg(message, ',' ORDER BY message) FROM public.live_lesson_chat_messages
    WHERE lesson_id::text LIKE '10000000-%'),
  'L1 mesajı,L4 mesajı');
SELECT pg_temp.expect('A: olaylar yalnız L1',
  (SELECT string_agg(lesson_id::text, ',') FROM public.live_lesson_events
    WHERE lesson_id::text LIKE '10000000-%'),
  '10000000-0000-4000-8000-000000000001');
SELECT pg_temp.expect('A: katılımcı yalnız kendi satırları; erişemediği L2''deki kendi satırı da gizli',
  (SELECT string_agg(user_name || '@' || right(lesson_id::text, 1), ',' ORDER BY lesson_id)
     FROM public.live_lesson_participants WHERE lesson_id::text LIKE '10000000-%'),
  'Ogrenci A@1,Ogrenci A@4');
SELECT pg_temp.expect('A: hatırlatmalar görünmez',
  (SELECT count(*)::text FROM public.live_lesson_reminders), '0');
SELECT pg_temp.expect('A: live_lesson_viewer_grade() kendi sınıfı',
  public.live_lesson_viewer_grade(), '7');

-- İstemci kolon listesi = LIVE_LESSON_CLIENT_COLUMNS
-- (src/features/live-lessons/lib/lesson-access.ts; access-grade.test.ts
-- iki listenin aynı kaldığını denetler).
SELECT pg_temp.expect('A: istemci kolon listesiyle sorgu',
  (SELECT string_agg(title, ',' ORDER BY title) FROM (
    SELECT id, room_id, title, description, target_grade, target_student_ids, starts_at, duration_minutes, status, created_by, started_at, ended_at, recording_url, materials_url, created_at, updated_at
    FROM public.live_lessons WHERE id::text LIKE '10000000-%') q),
  'L1,L4,L5,L6');

SELECT pg_temp.expect_denied('A: teacher_proof kolonu reddedildi',
  'SELECT teacher_proof FROM public.live_lessons');
SELECT pg_temp.expect_denied('A: select * reddedildi (açık kolon listesi gerekir)',
  'SELECT * FROM public.live_lessons');

-- Yazma: politika yok → INSERT RLS ihlali (42501), UPDATE/DELETE 0 satır.
SELECT pg_temp.expect_denied('A: live_lessons INSERT reddedildi',
  $q$INSERT INTO public.live_lessons (room_id, title, target_grade, starts_at)
     VALUES ('rlstestxx', 'X', 'all', now())$q$);
SELECT pg_temp.expect_denied('A: sohbet INSERT reddedildi',
  $q$INSERT INTO public.live_lesson_chat_messages (lesson_id, user_id, user_name, role, message)
     VALUES ('10000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-00000000000a', 'Ogrenci A', 'student', 'sahte')$q$);
SELECT pg_temp.expect_denied('A: katılımcı INSERT reddedildi',
  $q$INSERT INTO public.live_lesson_participants (lesson_id, user_id, user_name, role)
     VALUES ('10000000-0000-4000-8000-000000000005', '00000000-0000-4000-8000-00000000000a', 'Ogrenci A', 'teacher')$q$);
SELECT pg_temp.expect_denied('A: olay INSERT reddedildi',
  $q$INSERT INTO public.live_lesson_events (lesson_id, user_id, event_type, payload)
     VALUES ('10000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-00000000000a', 'join_approved', '{}')$q$);
SELECT pg_temp.expect_denied('A: hatırlatma INSERT reddedildi',
  $q$INSERT INTO public.live_lesson_reminders (lesson_id) VALUES ('10000000-0000-4000-8000-000000000004')$q$);
SELECT pg_temp.expect_no_rows('A: erişebildiği L1 için UPDATE etkisiz',
  $q$UPDATE public.live_lessons SET title = 'ele geçirildi' WHERE id = '10000000-0000-4000-8000-000000000001'$q$);
SELECT pg_temp.expect_no_rows('A: sohbet UPDATE etkisiz',
  $q$UPDATE public.live_lesson_chat_messages SET message = 'değişti' WHERE lesson_id = '10000000-0000-4000-8000-000000000001'$q$);
SELECT pg_temp.expect_no_rows('A: katılımcı UPDATE etkisiz',
  $q$UPDATE public.live_lesson_participants SET role = 'teacher' WHERE user_id = '00000000-0000-4000-8000-00000000000a'$q$);
SELECT pg_temp.expect_no_rows('A: L4 DELETE etkisiz',
  $q$DELETE FROM public.live_lessons WHERE id = '10000000-0000-4000-8000-000000000004'$q$);

RESET ROLE;

SELECT pg_temp.expect('yazma denemeleri veriyi değiştirmedi',
  (SELECT string_agg(title, ',' ORDER BY title) FROM public.live_lessons
    WHERE id::text LIKE '10000000-%')
  || '|' || (SELECT count(*)::text FROM public.live_lesson_chat_messages WHERE message = 'değişti' AND lesson_id::text LIKE '10000000-%')
  || '|' || (SELECT count(*)::text FROM public.live_lesson_participants WHERE role = 'teacher' AND lesson_id::text LIKE '10000000-%'),
  'L1,L2,L3,L4,L5,L6,L7,L8|0|0');

-- --- Öğrenci B (8. sınıf) ----------------------------------------------------
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims',
  '{"sub":"00000000-0000-4000-8000-00000000000b","email":"rls-ogrenci-b@example.com","role":"authenticated"}', true);

SELECT pg_temp.expect('B: dersler (L6 bayat diziyle açılmaz)',
  (SELECT string_agg(title, ',' ORDER BY title) FROM public.live_lessons
    WHERE id::text LIKE '10000000-%'), 'L2,L3,L4');
SELECT pg_temp.expect('B: sohbet',
  (SELECT string_agg(message, ',' ORDER BY message) FROM public.live_lesson_chat_messages
    WHERE lesson_id::text LIKE '10000000-%'),
  'L2 mesajı,L3 mesajı,L4 mesajı');
SELECT pg_temp.expect('B: olaylar',
  (SELECT count(*)::text FROM public.live_lesson_events
    WHERE lesson_id::text LIKE '10000000-%'), '2');
SELECT pg_temp.expect('B: katılımcı yalnız kendi satırları',
  (SELECT string_agg(user_name || '@' || right(lesson_id::text, 1), ',' ORDER BY lesson_id)
     FROM public.live_lesson_participants WHERE lesson_id::text LIKE '10000000-%'),
  'Ogrenci B@2,Ogrenci B@4');
SELECT pg_temp.expect('B: id ile doğrudan L1 sorgusu boş',
  (SELECT count(*)::text FROM public.live_lessons
    WHERE id = '10000000-0000-4000-8000-000000000001'), '0');

RESET ROLE;

-- --- Admin -------------------------------------------------------------------
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims',
  '{"sub":"00000000-0000-4000-8000-0000000000ad","email":"admin@ugurhoca.com","role":"authenticated"}', true);

SELECT pg_temp.expect('Admin: tüm dersler (boş seçimli L7/L8 dahil)',
  (SELECT string_agg(title, ',' ORDER BY title) FROM public.live_lessons
    WHERE id::text LIKE '10000000-%'), 'L1,L2,L3,L4,L5,L6,L7,L8');
SELECT pg_temp.expect('Admin: istemci kolon listesiyle sorgu',
  (SELECT count(*)::text FROM (
    SELECT id, room_id, title, description, target_grade, target_student_ids, starts_at, duration_minutes, status, created_by, started_at, ended_at, recording_url, materials_url, created_at, updated_at
    FROM public.live_lessons WHERE id::text LIKE '10000000-%') q), '8');
SELECT pg_temp.expect('Admin: tüm sohbet',
  (SELECT count(*)::text FROM public.live_lesson_chat_messages
    WHERE lesson_id::text LIKE '10000000-%'), '4');
SELECT pg_temp.expect('Admin: tüm olaylar',
  (SELECT count(*)::text FROM public.live_lesson_events
    WHERE lesson_id::text LIKE '10000000-%'), '3');
SELECT pg_temp.expect('Admin: tüm katılımcılar',
  (SELECT count(*)::text FROM public.live_lesson_participants
    WHERE lesson_id::text LIKE '10000000-%'), '5');
SELECT pg_temp.expect('Admin: tüm hatırlatmalar',
  (SELECT count(*)::text FROM public.live_lesson_reminders
    WHERE lesson_id::text LIKE '10000000-%'), '2');

SELECT pg_temp.expect_denied('Admin: teacher_proof istemci rolüne de kapalı',
  'SELECT teacher_proof FROM public.live_lessons');

RESET ROLE;

-- --- Anon --------------------------------------------------------------------
SET LOCAL ROLE anon;
SELECT set_config('request.jwt.claims', '{"role":"anon"}', true);

SELECT pg_temp.expect_denied('anon: live_lessons reddedildi',
  'SELECT id FROM public.live_lessons');
SELECT pg_temp.expect_denied('anon: live_lesson_viewer_grade() EXECUTE reddedildi',
  'SELECT public.live_lesson_viewer_grade()');
SELECT pg_temp.expect_denied('anon: live_lesson_normalize_grade() EXECUTE reddedildi',
  $q$SELECT public.live_lesson_normalize_grade('7'::jsonb)$q$);
SELECT pg_temp.expect('anon: sohbet boş',
  (SELECT count(*)::text FROM public.live_lesson_chat_messages), '0');
SELECT pg_temp.expect('anon: katılımcı boş',
  (SELECT count(*)::text FROM public.live_lesson_participants), '0');
SELECT pg_temp.expect('anon: olaylar boş',
  (SELECT count(*)::text FROM public.live_lesson_events), '0');
SELECT pg_temp.expect('anon: hatırlatmalar boş',
  (SELECT count(*)::text FROM public.live_lesson_reminders), '0');

RESET ROLE;

-- --- Sınıf çözümü: uygulama (src/lib/access-grade.ts) ile ortak vaka tablosu --
-- Her satır bir JSON: profile (yoksa profil satırı yok; null ise profil var,
-- grade NULL), metadata (yoksa raw_user_meta_data NULL), beklenen grade ve
-- G5/G6/G7/G8/GM derslerinden görünenler (sees). src/lib/access-grade.test.ts
-- AYNI satırları bu bloktan okuyup JS tarafında çalıştırır; bir satırı
-- değiştirmek iki motoru birlikte test eder. Tek tırnak kullanmayın.
-- sqlOnly vakaları JSON.parse ile ham sayı temsili kaybolduğu için yalnız SQL’de koşulur.
-- JSONB 1e1 yazımını 10’a dönüştürür; jsonb alan fonksiyon bu ikisini ayırt edemez.
-- profile alanında yalnız int ve text kolonunda aynı sonucu veren değerler
-- bulunur; int kolonuna yazılamayanlar ('Mezun', 'abc') int şemada atlanır.
CREATE TEMP TABLE grade_cases (n int PRIMARY KEY, c jsonb NOT NULL);
-- BEGIN access-grade-cases
INSERT INTO grade_cases (n, c) VALUES
  (1, '{"name":"profil 7","profile":7,"grade":"7","sees":"G7"}'),
  (2, '{"name":"profil 0 (kayıt formu Mezun için 0 yazar)","profile":0,"grade":"Mezun","sees":"GM"}'),
  (3, '{"name":"profil metin 07","profile":"07","grade":"7","sees":"G7"}'),
  (4, '{"name":"profil metin Mezun","profile":"Mezun","grade":"Mezun","sees":"GM"}'),
  (5, '{"name":"geçersiz profil metadataya düşmez","profile":"abc","metadata":{"grade":7},"grade":null,"sees":""}'),
  (6, '{"name":"profil öncelikli","profile":8,"metadata":{"grade":5},"grade":"8","sees":"G8"}'),
  (7, '{"name":"profil NULL, metadata sayı","profile":null,"metadata":{"grade":8},"grade":"8","sees":"G8"}'),
  (8, '{"name":"profil NULL, metadata yok","profile":null,"grade":null,"sees":""}'),
  (9, '{"name":"profilsiz, metadata sayı 7 (kayıt regresyonu)","metadata":{"grade":7},"grade":"7","sees":"G7"}'),
  (10, '{"name":"profilsiz, metadata metin 05","metadata":{"grade":"05"},"grade":"5","sees":"G5"}'),
  (11, '{"name":"profilsiz, metadata 7.0","sqlOnly":true,"metadata":{"grade":7.0},"grade":null,"sees":""}'),
  (12, '{"name":"profilsiz, metadata 0007","metadata":{"grade":"0007"},"grade":"7","sees":"G7"}'),
  (13, '{"name":"profilsiz, metadata 000","metadata":{"grade":"000"},"grade":"Mezun","sees":"GM"}'),
  (14, '{"name":"profilsiz, metadata Mezun","metadata":{"grade":"Mezun"},"grade":"Mezun","sees":"GM"}'),
  (15, '{"name":"profilsiz, metadata küçük harf mezun","metadata":{"grade":"mezun"},"grade":null,"sees":""}'),
  (16, '{"name":"profilsiz, metadata 7.5","metadata":{"grade":7.5},"grade":null,"sees":""}'),
  (17, '{"name":"profilsiz, metadata boşluklu 7","metadata":{"grade":" 7"},"grade":null,"sees":""}'),
  (18, '{"name":"profilsiz, metadata 7a","metadata":{"grade":"7a"},"grade":null,"sees":""}'),
  (19, '{"name":"profilsiz, metadata +7","metadata":{"grade":"+7"},"grade":null,"sees":""}'),
  (20, '{"name":"profilsiz, metadata -7","metadata":{"grade":-7},"grade":null,"sees":""}'),
  (21, '{"name":"profilsiz, metadata boş metin","metadata":{"grade":""},"grade":null,"sees":""}'),
  (22, '{"name":"profilsiz, metadata true","metadata":{"grade":true},"grade":null,"sees":""}'),
  (23, '{"name":"profilsiz, metadata dizi","metadata":{"grade":[7]},"grade":null,"sees":""}'),
  (24, '{"name":"profilsiz, metadata nesne","metadata":{"grade":{"v":7}},"grade":null,"sees":""}'),
  (25, '{"name":"profilsiz, metadata 1e21","metadata":{"grade":1e21},"grade":null,"sees":""}'),
  (26, '{"name":"profilsiz, metadata grade null","metadata":{"grade":null},"grade":null,"sees":""}'),
  (27, '{"name":"profilsiz, metadata gradesiz (eski uygulama 5e düşürürdü)","metadata":{"name":"x"},"grade":null,"sees":""}'),
  (28, '{"name":"profilsiz, metadata hiç yok","grade":null,"sees":""}'),
  (29, '{"name":"profilsiz, metadata 7.0000000000000001","sqlOnly":true,"metadata":{"grade":7.0000000000000001},"grade":null,"sees":""}'),
  (30, '{"name":"profilsiz, metadata 1e1 (JSONB metni 10)","metadata":{"grade":1e1},"grade":"10","sees":""}'),
  (31, '{"name":"profilsiz, metadata metin 7.0","metadata":{"grade":"7.0"},"grade":null,"sees":""}'),
  (32, '{"name":"profilsiz, metadata metin 1e1","metadata":{"grade":"1e1"},"grade":null,"sees":""}'),
  (33, '{"name":"profilsiz, metadata metin 7.0000000000000001","metadata":{"grade":"7.0000000000000001"},"grade":null,"sees":""}'),
  (34, '{"name":"profilsiz, metadata sayı 0","metadata":{"grade":0},"grade":"Mezun","sees":"GM"}'),
  (35, '{"name":"profilsiz, metadata en büyük güvenli tam sayı","metadata":{"grade":9007199254740991},"grade":"9007199254740991","sees":""}'),
  (36, '{"name":"profilsiz, metadata güvenli sınır üstü","metadata":{"grade":9007199254740992},"grade":null,"sees":""}'),
  (37, '{"name":"profil metin 00","profile":"00","grade":"Mezun","sees":"GM"}'),
  (38, '{"name":"profil NULL, metadata sayı 0","profile":null,"metadata":{"grade":0},"grade":"Mezun","sees":"GM"}'),
  (39, '{"name":"profilsiz, metadata metin 0","metadata":{"grade":"0"},"grade":"Mezun","sees":"GM"}'),
  (40, '{"name":"Mezun profil metadata sınıfına üstün","profile":0,"metadata":{"grade":8},"grade":"Mezun","sees":"GM"}');
-- END access-grade-cases

DO $$
DECLARE
  r record;
  uid uuid;
  got_grade text;
  got_sees text;
  checked int := 0;
  skipped int := 0;
BEGIN
  FOR r IN SELECT n, c FROM pg_temp.grade_cases ORDER BY n LOOP
    uid := ('00000000-0000-4000-9000-' || lpad(r.n::text, 12, '0'))::uuid;
    INSERT INTO auth.users (id, email, raw_user_meta_data)
      VALUES (uid, 'rls-grade-case-' || r.n || '@example.com', r.c -> 'metadata');
    -- Olası auth tetikleyicisinin açtığı profil vakayı bozmasın.
    DELETE FROM public.profiles WHERE id = uid;

    IF r.c ? 'profile' THEN
      BEGIN
        -- %L türsüz literal üretir; kolon tipi (int/text) neyse ona dönüşür.
        EXECUTE format(
          'INSERT INTO public.profiles (id, name, email, grade) VALUES (%L, %L, %L, %L)',
          uid, 'Vaka ' || r.n, 'rls-grade-case-' || r.n || '@example.com', r.c ->> 'profile');
      EXCEPTION WHEN invalid_text_representation THEN
        RAISE NOTICE 'atla vaka %: profiles.grade bu değeri saklayamıyor (%)', r.n, r.c ->> 'profile';
        skipped := skipped + 1;
        CONTINUE;
      END;
    END IF;

    PERFORM set_config('request.jwt.claims',
      json_build_object('sub', uid, 'role', 'authenticated',
        'email', 'rls-grade-case-' || r.n || '@example.com')::text, true);
    EXECUTE 'SET LOCAL ROLE authenticated';
    got_grade := public.live_lesson_viewer_grade();
    SELECT coalesce(string_agg(title, ',' ORDER BY title), '') INTO got_sees
      FROM public.live_lessons WHERE id::text LIKE '20000000-%';
    EXECUTE 'RESET ROLE';

    PERFORM pg_temp.expect(format('vaka %s %s: grade', r.n, r.c ->> 'name'), got_grade, r.c ->> 'grade');
    PERFORM pg_temp.expect(format('vaka %s %s: dersler', r.n, r.c ->> 'name'), got_sees, r.c ->> 'sees');
    checked := checked + 1;
  END LOOP;

  IF checked < 38 THEN
    RAISE EXCEPTION 'FAIL sınıf vakaları: yalnız % vaka koşuldu (% atlandı)', checked, skipped;
  END IF;
  RAISE NOTICE 'ok  sınıf vakaları: % koşuldu, % atlandı', checked, skipped;
END;
$$;

-- --- service_role: sunucu yolu teacher_proof'u okumaya devam eder ------------
SET LOCAL ROLE service_role;
SELECT pg_temp.expect('service_role: teacher_proof okunur',
  (SELECT teacher_proof FROM public.live_lessons
    WHERE id = '10000000-0000-4000-8000-000000000001'), 'gizli-1');
RESET ROLE;

ROLLBACK;
