-- ==============================================================================
-- K2.3: Tam-zincir Öğrenci İzolasyon ve Gizlilik Testleri (66 migration sonrası)
-- ==============================================================================
-- Bu dosya, tüm migration zinciri (66 migration) başarıyla koştuktan sonra
-- gerçek API rolleri (anon, authenticated, service_role) altında çalıştırılır.
-- 4 Rol (Öğrenci A, Öğrenci B, Admin, Anon) × 8 Temel Gizlilik Yüzeyini ve
-- negatif ihlal tespitini (Önce-Kırmızı / anti-sahte-yeşil) doğrular.
-- Sentetik test verileri transaction sonunda tamamen ROLLBACK edilir.

BEGIN;

-- ------------------------------------------------------------------------------
-- 1. Test Yardımcı Fonksiyonları (pg_temp)
-- ------------------------------------------------------------------------------
CREATE FUNCTION pg_temp.expect_count(p_label text, p_actual bigint, p_expected bigint)
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  IF p_actual IS DISTINCT FROM p_expected THEN
    RAISE EXCEPTION 'FAILURE: % (beklenen %, gelen %)', p_label, p_expected, p_actual;
  END IF;
  RAISE NOTICE 'ok %', p_label;
END;
$$;
GRANT EXECUTE ON FUNCTION pg_temp.expect_count(text, bigint, bigint) TO anon, authenticated;

CREATE FUNCTION pg_temp.expect_denied(
  p_label TEXT,
  p_sql TEXT,
  p_expected_pattern TEXT
)
RETURNS void LANGUAGE plpgsql AS $$
DECLARE
  v_caught BOOLEAN := false;
  v_errm TEXT;
  v_state TEXT;
BEGIN
  BEGIN
    EXECUTE p_sql;
  EXCEPTION WHEN OTHERS THEN
    v_caught := true;
    v_errm := SQLERRM;
    v_state := SQLSTATE;
  END;

  IF NOT v_caught THEN
    RAISE EXCEPTION 'FAILURE: % (expected query to be denied, but it succeeded)', p_label;
  END IF;

  IF v_errm !~* p_expected_pattern AND v_state !~* p_expected_pattern THEN
    RAISE EXCEPTION 'FAILURE: % (unexpected error: [%] %)', p_label, v_state, v_errm;
  END IF;

  RAISE NOTICE 'ok %', p_label;
END;
$$;
GRANT EXECUTE ON FUNCTION pg_temp.expect_denied(text, text, text) TO anon, authenticated;

CREATE FUNCTION pg_temp.expect_denied(p_label TEXT, p_sql TEXT)
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  PERFORM pg_temp.expect_denied(
    p_label,
    p_sql,
    '(row-level security|permission denied|insufficient_privilege|42501|P0001|yetki|izin|yasak|değiştirilemez|bulunamadı|Oturum)'
  );
END;
$$;
GRANT EXECUTE ON FUNCTION pg_temp.expect_denied(text, text) TO anon, authenticated;

-- ------------------------------------------------------------------------------
-- 2. Fixture Kurulumu (Superuser / Postgres rolü ile)
-- ------------------------------------------------------------------------------
-- Kullanıcılar: Öğrenci A, Öğrenci B ve Öğretmen/Admin
INSERT INTO auth.users (id, email) VALUES
  ('60000000-0000-4000-8000-00000000000a', 'rls-ogrenci-a@example.com'),
  ('60000000-0000-4000-8000-00000000000b', 'rls-ogrenci-b@example.com'),
  ('60000000-0000-4000-8000-0000000000ad', 'admin@ugurhoca.com')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, name, email, grade, avatar_id) VALUES
  ('60000000-0000-4000-8000-00000000000a', 'Öğrenci A', 'rls-ogrenci-a@example.com', 7, 'fox'),
  ('60000000-0000-4000-8000-00000000000b', 'Öğrenci B', 'rls-ogrenci-b@example.com', 8, 'bear'),
  ('60000000-0000-4000-8000-0000000000ad', 'Uğur Hoca', 'admin@ugurhoca.com', NULL, 'teacher')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, email = EXCLUDED.email, grade = EXCLUDED.grade;

-- 1. Yüzey: game_aliases ve game_scores
INSERT INTO public.game_aliases (user_id, alias, alias_normalized) VALUES
  ('60000000-0000-4000-8000-00000000000a', 'Oyuncu A', 'oyuncua'),
  ('60000000-0000-4000-8000-00000000000b', 'Oyuncu B', 'oyuncub')
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO public.game_scores (id, user_id, user_name, game_id, score) VALUES
  ('60000000-0000-4000-8000-00000000005a', '60000000-0000-4000-8000-00000000000a', NULL, 1, 150),
  ('60000000-0000-4000-8000-00000000005b', '60000000-0000-4000-8000-00000000000b', NULL, 1, 250);

-- 2. Yüzey: assignments ve assignment_submissions
INSERT INTO public.assignments (id, title, grade) VALUES
  ('60000000-0000-4000-8000-000000000041', '7. Sınıf Cebir Ödevi', 7),
  ('60000000-0000-4000-8000-000000000042', '8. Sınıf Geometri Ödevi', 8),
  ('60000000-0000-4000-8000-000000000043', '7. Sınıf Ek Ödev A', 7),
  ('60000000-0000-4000-8000-000000000044', '8. Sınıf Ek Ödev B', 8)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.assignment_submissions (id, assignment_id, student_id, student_name, file_url) VALUES
  ('60000000-0000-4000-8000-00000000006a', '60000000-0000-4000-8000-000000000041', '60000000-0000-4000-8000-00000000000a', 'Öğrenci A', '/submissions/60000000-0000-4000-8000-00000000000a/odev1.jpg'),
  ('60000000-0000-4000-8000-00000000006b', '60000000-0000-4000-8000-000000000042', '60000000-0000-4000-8000-00000000000b', 'Öğrenci B', '/submissions/60000000-0000-4000-8000-00000000000b/odev2.jpg');

-- 3. Yüzey: quizzes ve quiz_results
INSERT INTO public.quizzes (id, title, grade, difficulty, time_limit) VALUES
  ('60000000-0000-4000-8000-000000000031', 'Kesirler Testi', 7, 'Kolay', 30),
  ('60000000-0000-4000-8000-000000000032', 'Üslü Sayılar Testi', 8, 'Orta', 30)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.quiz_results (id, user_id, quiz_id, score, total_questions, answers, time_spent) VALUES
  ('60000000-0000-4000-8000-00000000007a', '60000000-0000-4000-8000-00000000000a', '60000000-0000-4000-8000-000000000031', 85, 10, '{}'::jsonb, 120),
  ('60000000-0000-4000-8000-00000000007b', '60000000-0000-4000-8000-00000000000b', '60000000-0000-4000-8000-000000000031', 95, 10, '{}'::jsonb, 100);

-- 4. Yüzey: note_categories ve notes
INSERT INTO public.note_categories (id, user_id, name) VALUES
  ('60000000-0000-4000-8000-00000000008a', '60000000-0000-4000-8000-00000000000a', 'A Kategorisi'),
  ('60000000-0000-4000-8000-00000000008b', '60000000-0000-4000-8000-00000000000b', 'B Kategorisi');

INSERT INTO public.notes (id, user_id, title, content) VALUES
  ('60000000-0000-4000-8000-00000000009a', '60000000-0000-4000-8000-00000000000a', 'A Notu', 'A İçeriği'),
  ('60000000-0000-4000-8000-00000000009b', '60000000-0000-4000-8000-00000000000b', 'B Notu', 'B İçeriği');

-- 5. Yüzey: student_weekly_plans ve student_weekly_plan_items
INSERT INTO public.student_weekly_plans (id, student_id, week_start, title) VALUES
  ('60000000-0000-4000-8000-0000000000aa', '60000000-0000-4000-8000-00000000000a', '2026-11-09', 'A Çalışma Planı'),
  ('60000000-0000-4000-8000-0000000000ba', '60000000-0000-4000-8000-00000000000b', '2026-11-09', 'B Çalışma Planı');

INSERT INTO public.student_weekly_plan_items (id, plan_id, title) VALUES
  ('60000000-0000-4000-8000-0000000000ab', '60000000-0000-4000-8000-0000000000aa', 'A Ödevi Çöz'),
  ('60000000-0000-4000-8000-0000000000ac', '60000000-0000-4000-8000-0000000000aa', 'A İkinci Madde'),
  ('60000000-0000-4000-8000-0000000000bb', '60000000-0000-4000-8000-0000000000ba', 'B Ödevi Çöz'),
  ('60000000-0000-4000-8000-0000000000bc', '60000000-0000-4000-8000-0000000000ba', 'B İkinci Madde');

-- 6. Yüzey: notifications, shared_documents, comments
INSERT INTO public.notifications (id, user_id, title, type) VALUES
  ('60000000-0000-4000-8000-0000000000ca', '60000000-0000-4000-8000-00000000000a', 'A Bildirimi', 'system'),
  ('60000000-0000-4000-8000-0000000000cb', '60000000-0000-4000-8000-00000000000b', 'B Bildirimi', 'system');

INSERT INTO public.shared_documents (id, student_id, student_name, student_email, document_title) VALUES
  ('60000000-0000-4000-8000-0000000000da', '60000000-0000-4000-8000-00000000000a', 'Öğrenci A', 'rls-ogrenci-a@example.com', 'A Dokümanı'),
  ('60000000-0000-4000-8000-0000000000db', '60000000-0000-4000-8000-00000000000b', 'Öğrenci B', 'rls-ogrenci-b@example.com', 'B Dokümanı');

INSERT INTO public.comments (id, user_id, content) VALUES
  ('60000000-0000-4000-8000-0000000000ea', '60000000-0000-4000-8000-00000000000a', 'A Yorumu'),
  ('60000000-0000-4000-8000-0000000000eb', '60000000-0000-4000-8000-00000000000b', 'B Yorumu');

-- 8. Yüzey: storage.objects
INSERT INTO storage.objects (bucket_id, name, owner_id) VALUES
  ('submissions', '60000000-0000-4000-8000-00000000000a/odev1.jpg', '60000000-0000-4000-8000-00000000000a'),
  ('submissions', '60000000-0000-4000-8000-00000000000b/odev2.jpg', '60000000-0000-4000-8000-00000000000b'),
  ('documents', 'resmi_ders_plani.pdf', '60000000-0000-4000-8000-0000000000ad');

-- ------------------------------------------------------------------------------
-- 3. Negatif Doğrulama (Önce-Kırmızı / Anti-Sahte-Yeşil Kanıtı)
-- ------------------------------------------------------------------------------
-- Koruma mekanizmalarının (RLS & trigger) ve test araçlarının (expect_denied)
-- gerçekten iş yaptığını, koruma kalktığında testin ihlali tespit edeceğini kanıtlar.
SAVEPOINT before_negative_check;

-- A) Test altyapısı kontrolü: expect_denied başarılı sorguda hata fırlatmalıdır
DO $$
DECLARE
  v_denied_failed BOOLEAN := false;
BEGIN
  BEGIN
    PERFORM pg_temp.expect_denied('test_fake_denial', 'SELECT 1');
  EXCEPTION WHEN OTHERS THEN
    IF SQLERRM ~* 'expected query to be denied, but it succeeded' THEN
      v_denied_failed := true;
    END IF;
  END;

  IF NOT v_denied_failed THEN
    RAISE EXCEPTION 'Negatif test başarısız: expect_denied başarılı bir sorguda hata fırlatmadı!';
  END IF;
  RAISE NOTICE 'ok expect_denied mekanizması başarılı sorguyu doğru tespit ediyor';
END $$;

-- B) RLS ve Trigger devre dışı bırakıldığında ihlallerin gerçekleşebildiğini kanıtla
ALTER TABLE public.profiles DISABLE TRIGGER zz_profiles_guard_student_update;
ALTER TABLE public.game_scores DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignment_submissions DISABLE ROW LEVEL SECURITY;

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims',
  '{"sub":"60000000-0000-4000-8000-00000000000a","email":"rls-ogrenci-a@example.com","role":"authenticated"}', true);

DO $$
BEGIN
  -- 1. Koruma devredışıyken Öğrenci A grade ve korumalı alanları güncelleyebilmeli (ihlal kanıtı):
  UPDATE public.profiles SET grade = 12, is_private_student = true WHERE id = auth.uid();
  IF (SELECT grade FROM public.profiles WHERE id = auth.uid()) <> 12 THEN
    RAISE EXCEPTION 'Negatif test başarısız: Trigger devre dışıyken grade güncellenemedi';
  END IF;

  -- 2. Koruma devredışıyken Öğrenci A'nın B'nin skorunu görebildiğini (ihlal kanıtı) doğrula:
  IF (SELECT count(*) FROM public.game_scores WHERE user_id = '60000000-0000-4000-8000-00000000000b') <> 1 THEN
    RAISE EXCEPTION 'Negatif test başarısız: RLS devre dışıyken B skorları görünmedi';
  END IF;

  -- 3. Koruma devredışıyken Öğrenci A'nın B'nin ödevini görebildiğini (ihlal kanıtı) doğrula:
  IF (SELECT count(*) FROM public.assignment_submissions WHERE student_id = '60000000-0000-4000-8000-00000000000b') <> 1 THEN
    RAISE EXCEPTION 'Negatif test başarısız: RLS devre dışıyken B ödevleri görünmedi';
  END IF;

  RAISE NOTICE 'ok Negatif doğrulama başarılı: Koruma kalktığında ihlaller gerçekleşiyor';
END $$;

RESET ROLE;
ROLLBACK TO SAVEPOINT before_negative_check;

-- ------------------------------------------------------------------------------
-- 4. Pozitif İzolasyon Testleri: Öğrenci A Yetki ve İzolasyon Sınırları
-- ------------------------------------------------------------------------------
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims',
  '{"sub":"60000000-0000-4000-8000-00000000000a","email":"rls-ogrenci-a@example.com","role":"authenticated"}', true);

-- Yüzey 1: game_scores ve liderlik tablosu
SELECT pg_temp.expect_count('Öğrenci A kendi skorunu görebilir',
  (SELECT count(*) FROM public.game_scores WHERE user_id = auth.uid()), 1);
SELECT pg_temp.expect_count('Öğrenci A Öğrenci B''nin oyun skorunu göremez',
  (SELECT count(*) FROM public.game_scores WHERE user_id = '60000000-0000-4000-8000-00000000000b'), 0);
SELECT pg_temp.expect_count('Öğrenci A filtresiz game_scores sorgusunda yalnız kendisininkini görür',
  (SELECT count(*) FROM public.game_scores), 1);
SELECT pg_temp.expect_denied('Öğrenci A başkası adına game_scores ekleyemez',
  'INSERT INTO public.game_scores (user_id, game_id, score) VALUES (''60000000-0000-4000-8000-00000000000b'', 1, 99)');

DO $$
DECLARE
  rec RECORD;
  found_alias_b boolean := false;
BEGIN
  -- get_game_leaderboard fonksiyonu yalnızca alias döndürür; gerçek ad/e-posta sızmaz
  FOR rec IN SELECT * FROM public.get_game_leaderboard('all') LOOP
    IF rec.alias = 'Oyuncu B' THEN
      found_alias_b := true;
    END IF;
  END LOOP;
  IF NOT found_alias_b THEN
    RAISE EXCEPTION 'Liderlik tablosunda alias bulunamadı';
  END IF;
END $$;

SELECT pg_temp.expect_count('Liderlik view tanımlarında kullanıcı adı sütunu bulunmaz',
  (SELECT count(*) FROM information_schema.columns
   WHERE table_schema = 'public' AND table_name = 'global_leaderboard'
     AND column_name IN ('user_name', 'name', 'email')), 0);

-- Yüzey 2: assignment_submissions
SELECT pg_temp.expect_count('Öğrenci A kendi ödev teslimini görebilir',
  (SELECT count(*) FROM public.assignment_submissions WHERE student_id = auth.uid()), 1);
SELECT pg_temp.expect_count('Öğrenci A Öğrenci B''nin ödev teslimini göremez',
  (SELECT count(*) FROM public.assignment_submissions WHERE student_id = '60000000-0000-4000-8000-00000000000b'), 0);

INSERT INTO public.assignment_submissions (assignment_id, student_id, student_name, file_url)
VALUES ('60000000-0000-4000-8000-000000000043', auth.uid(), 'Öğrenci A', '/submissions/60000000-0000-4000-8000-00000000000a/yeni_odev.jpg');
SELECT pg_temp.expect_count('Öğrenci A kendi ödev teslimini başarıyla ekler',
  (SELECT count(*) FROM public.assignment_submissions WHERE student_id = auth.uid()), 2);

SELECT pg_temp.expect_denied('Öğrenci A Öğrenci B adına ödev teslimi ekleyemez',
  'INSERT INTO public.assignment_submissions (assignment_id, student_id, student_name, file_url)
   VALUES (''60000000-0000-4000-8000-000000000042'', ''60000000-0000-4000-8000-00000000000b'', ''Öğrenci B'', ''/url'')');

DO $$
DECLARE changed int;
BEGIN
  UPDATE public.assignment_submissions SET comment = 'hacked'
  WHERE student_id = '60000000-0000-4000-8000-00000000000b';
  GET DIAGNOSTICS changed = ROW_COUNT;
  IF changed <> 0 THEN
    RAISE EXCEPTION 'Öğrenci A Öğrenci B''nin teslimini güncelleyememeli';
  END IF;
  RAISE NOTICE 'ok Öğrenci A Öğrenci B''nin teslimini güncelleyemez (0 satır etkilendi)';
END $$;

-- Yüzey 3: quiz_results
SELECT pg_temp.expect_count('Öğrenci A kendi quiz sonucunu görebilir',
  (SELECT count(*) FROM public.quiz_results WHERE user_id = auth.uid()), 1);
SELECT pg_temp.expect_count('Öğrenci A Öğrenci B''nin quiz sonucunu göremez',
  (SELECT count(*) FROM public.quiz_results WHERE user_id = '60000000-0000-4000-8000-00000000000b'), 0);

INSERT INTO public.quiz_results (user_id, quiz_id, score, total_questions, answers, time_spent)
VALUES (auth.uid(), '60000000-0000-4000-8000-000000000031', 100, 10, '{}'::jsonb, 90);
SELECT pg_temp.expect_count('Öğrenci A kendi quiz sonucunu başarıyla ekler',
  (SELECT count(*) FROM public.quiz_results WHERE user_id = auth.uid()), 2);

SELECT pg_temp.expect_denied('Öğrenci A Öğrenci B adına quiz sonucu ekleyemez',
  'INSERT INTO public.quiz_results (user_id, quiz_id, score, total_questions, answers, time_spent)
   VALUES (''60000000-0000-4000-8000-00000000000b'', ''60000000-0000-4000-8000-000000000031'', 90, 10, ''{}''::jsonb, 100)');

-- Yüzey 4: notes ve note_categories
SELECT pg_temp.expect_count('Öğrenci A kendi not kategorisini görür',
  (SELECT count(*) FROM public.note_categories WHERE user_id = auth.uid()), 1);
SELECT pg_temp.expect_count('Öğrenci A Öğrenci B''nin not kategorisini göremez',
  (SELECT count(*) FROM public.note_categories WHERE user_id = '60000000-0000-4000-8000-00000000000b'), 0);
SELECT pg_temp.expect_count('Öğrenci A kendi notunu görür',
  (SELECT count(*) FROM public.notes WHERE user_id = auth.uid()), 1);
SELECT pg_temp.expect_count('Öğrenci A Öğrenci B''nin notunu göremez',
  (SELECT count(*) FROM public.notes WHERE user_id = '60000000-0000-4000-8000-00000000000b'), 0);

INSERT INTO public.note_categories (id, user_id, name)
VALUES ('60000000-0000-4000-8000-00000000008c', auth.uid(), 'Öğrenci A Yeni Kategori');
INSERT INTO public.notes (id, user_id, title, content)
VALUES ('60000000-0000-4000-8000-00000000009c', auth.uid(), 'Öğrenci A Yeni Not', 'Açıklama');

UPDATE public.notes SET title = 'Öğrenci A Güncel Not' WHERE id = '60000000-0000-4000-8000-00000000009c';
SELECT pg_temp.expect_count('Öğrenci A kendi notunu güncelleyebilir',
  (SELECT count(*) FROM public.notes WHERE id = '60000000-0000-4000-8000-00000000009c' AND title = 'Öğrenci A Güncel Not'), 1);

SELECT pg_temp.expect_denied('Öğrenci A B adına kategori ekleyemez',
  'INSERT INTO public.note_categories (user_id, name) VALUES (''60000000-0000-4000-8000-00000000000b'', ''Hack'')');
SELECT pg_temp.expect_denied('Öğrenci A B adına not ekleyemez',
  'INSERT INTO public.notes (user_id, title, content) VALUES (''60000000-0000-4000-8000-00000000000b'', ''Hack'', ''Hack'')');

DO $$
DECLARE changed int;
BEGIN
  UPDATE public.notes SET title = 'Hacked' WHERE user_id = '60000000-0000-4000-8000-00000000000b';
  GET DIAGNOSTICS changed = ROW_COUNT;
  IF changed <> 0 THEN RAISE EXCEPTION 'Öğrenci A B notunu güncelleyememeli'; END IF;

  DELETE FROM public.notes WHERE user_id = '60000000-0000-4000-8000-00000000000b';
  GET DIAGNOSTICS changed = ROW_COUNT;
  IF changed <> 0 THEN RAISE EXCEPTION 'Öğrenci A B notunu silememeli'; END IF;

  DELETE FROM public.note_categories WHERE user_id = '60000000-0000-4000-8000-00000000000b';
  GET DIAGNOSTICS changed = ROW_COUNT;
  IF changed <> 0 THEN RAISE EXCEPTION 'Öğrenci A B kategorisini silememeli'; END IF;
END $$;

DELETE FROM public.notes WHERE id = '60000000-0000-4000-8000-00000000009c';
DELETE FROM public.note_categories WHERE id = '60000000-0000-4000-8000-00000000008c';
SELECT pg_temp.expect_count('Öğrenci A kendi eklediği notu silebilir',
  (SELECT count(*) FROM public.notes WHERE id = '60000000-0000-4000-8000-00000000009c'), 0);

-- Yüzey 5: student_weekly_plans
SELECT pg_temp.expect_count('Öğrenci A kendi haftalık çalışma planını görür',
  (SELECT count(*) FROM public.student_weekly_plans WHERE student_id = auth.uid()), 1);
SELECT pg_temp.expect_count('Öğrenci A Öğrenci B''nin haftalık planını göremez',
  (SELECT count(*) FROM public.student_weekly_plans WHERE student_id = '60000000-0000-4000-8000-00000000000b'), 0);

DO $$
DECLARE changed int;
BEGIN
  UPDATE public.student_weekly_plans SET title = 'Hack'
  WHERE student_id = '60000000-0000-4000-8000-00000000000b';
  GET DIAGNOSTICS changed = ROW_COUNT;
  IF changed <> 0 THEN RAISE EXCEPTION 'Öğrenci A B haftalık planını değiştirememeli'; END IF;
  RAISE NOTICE 'ok Öğrenci A B haftalık planını değiştiremez (0 satır etkilendi)';
END $$;

SELECT pg_temp.expect_denied('Öğrenci A doğrudan haftalık plan tablosuna yazamaz (admin korumalı)',
  'INSERT INTO public.student_weekly_plans (student_id, week_start, title)
   VALUES (''60000000-0000-4000-8000-00000000000b'', ''2026-11-23'', ''Hack Plan'')');

-- Haftalık plan maddesi tamamlama fonksiyonu izolasyonu (P1 düzeltmesi):
SELECT pg_temp.expect_denied(
  'Öğrenci A Öğrenci B haftalık plan maddesini tamamlayamaz',
  'SELECT public.complete_weekly_plan_item(''60000000-0000-4000-8000-0000000000bc''::uuid, true)',
  'Plan maddesi bulunamadı'
);

-- B'nin plan maddesinin Öğrenci A tarafından görülemediğini ve
-- tamamlanmadığını (completed_at IS NULL kaldığını) doğrula:
SELECT pg_temp.expect_count('Öğrenci A B plan maddesini RLS nedeniyle göremez',
  (SELECT count(*) FROM public.student_weekly_plan_items
   WHERE id = '60000000-0000-4000-8000-0000000000bc'), 0);

RESET ROLE;
SELECT pg_temp.expect_count('B plan maddesi completed_at NULL kalmalı (service_role kontrolü)',
  (SELECT count(*) FROM public.student_weekly_plan_items
   WHERE id = '60000000-0000-4000-8000-0000000000bc' AND completed_at IS NULL), 1);
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims',
  '{"sub":"60000000-0000-4000-8000-00000000000a","email":"rls-ogrenci-a@example.com","role":"authenticated"}', true);

-- Öğrenci A kendi plan maddesini tamamlar:
DO $$
BEGIN
  PERFORM public.complete_weekly_plan_item('60000000-0000-4000-8000-0000000000ab', true);
END $$;

SELECT pg_temp.expect_count('Öğrenci A kendi haftalık plan maddesini tamamlayabilir',
  (SELECT count(*) FROM public.student_weekly_plan_items
   WHERE id = '60000000-0000-4000-8000-0000000000ab' AND completed_at IS NOT NULL), 1);

-- Yüzey 6: notifications, shared_documents, comments
SELECT pg_temp.expect_count('Öğrenci A yalnız kendi bildirimini görür',
  (SELECT count(*) FROM public.notifications WHERE user_id = auth.uid()), 1);
SELECT pg_temp.expect_count('Öğrenci A Öğrenci B''nin bildirimini göremez',
  (SELECT count(*) FROM public.notifications WHERE user_id = '60000000-0000-4000-8000-00000000000b'), 0);

SELECT pg_temp.expect_count('Öğrenci A yalnız kendi paylaşılan dokümanını görür',
  (SELECT count(*) FROM public.shared_documents WHERE student_id = auth.uid()), 1);
SELECT pg_temp.expect_count('Öğrenci A Öğrenci B''nin paylaşılan dokümanını göremez',
  (SELECT count(*) FROM public.shared_documents WHERE student_id = '60000000-0000-4000-8000-00000000000b'), 0);

SELECT pg_temp.expect_count('Öğrenci A yalnız kendi yorumunu görür',
  (SELECT count(*) FROM public.comments WHERE user_id = auth.uid()), 1);
SELECT pg_temp.expect_count('Öğrenci A Öğrenci B''nin yorumunu göremez',
  (SELECT count(*) FROM public.comments WHERE user_id = '60000000-0000-4000-8000-00000000000b'), 0);

-- Yüzey 7: profiles sütun koruması (tam zincir üzerinde)
-- Öğrenci A izinli alanları güncelleyebilir:
UPDATE public.profiles
SET avatar_id = 'owl', welcome_tour_seen_at = '2026-11-10T14:00:00Z'
WHERE id = auth.uid();

SELECT pg_temp.expect_count('Öğrenci A avatar_id ve welcome_tour_seen_at güncelleyebilir',
  (SELECT count(*) FROM public.profiles
   WHERE id = auth.uid() AND avatar_id = 'owl' AND welcome_tour_seen_at = '2026-11-10T14:00:00Z'), 1);

-- Korumalı alanlar 42501 ile reddedilir:
SELECT pg_temp.expect_denied('Öğrenci A grade alanını güncelleyemez',
  'UPDATE public.profiles SET grade = 8 WHERE id = auth.uid()');
SELECT pg_temp.expect_denied('Öğrenci A email alanını güncelleyemez',
  'UPDATE public.profiles SET email = ''changed@example.com'' WHERE id = auth.uid()');
SELECT pg_temp.expect_denied('Öğrenci A name alanını güncelleyemez',
  'UPDATE public.profiles SET name = ''Yeni Ad'' WHERE id = auth.uid()');
SELECT pg_temp.expect_denied('Öğrenci A name_normalized alanını güncelleyemez',
  'UPDATE public.profiles SET name_normalized = ''yeniad'' WHERE id = auth.uid()');
SELECT pg_temp.expect_denied('Öğrenci A is_private_student alanını güncelleyemez',
  'UPDATE public.profiles SET is_private_student = true WHERE id = auth.uid()');
SELECT pg_temp.expect_denied('Öğrenci A current_streak alanını güncelleyemez',
  'UPDATE public.profiles SET current_streak = 55 WHERE id = auth.uid()');
SELECT pg_temp.expect_denied('Öğrenci A last_active_date alanını güncelleyemez',
  'UPDATE public.profiles SET last_active_date = ''2026-01-01'' WHERE id = auth.uid()');
SELECT pg_temp.expect_denied('Öğrenci A is_favorite alanını güncelleyemez',
  'UPDATE public.profiles SET is_favorite = true WHERE id = auth.uid()');

-- Yüzey 8: storage.objects (submissions ve documents bucket'ları)
-- Submissions bucket'ı:
SELECT pg_temp.expect_count('Öğrenci A submissions bucketında kendi dosyasını görür',
  (SELECT count(*) FROM storage.objects
   WHERE bucket_id = 'submissions' AND name LIKE '60000000-0000-4000-8000-00000000000a/%'), 1);
SELECT pg_temp.expect_count('Öğrenci A submissions bucketında Öğrenci B''nin dosyasını göremez',
  (SELECT count(*) FROM storage.objects
   WHERE bucket_id = 'submissions' AND name LIKE '60000000-0000-4000-8000-00000000000b/%'), 0);

INSERT INTO storage.objects (bucket_id, name, owner_id)
VALUES ('submissions', '60000000-0000-4000-8000-00000000000a/yeni_odev.jpg', '60000000-0000-4000-8000-00000000000a');
SELECT pg_temp.expect_count('Öğrenci A kendi klasörüne dosya ekleyebilir',
  (SELECT count(*) FROM storage.objects
   WHERE bucket_id = 'submissions' AND name = '60000000-0000-4000-8000-00000000000a/yeni_odev.jpg'), 1);

SELECT pg_temp.expect_denied('Öğrenci A Öğrenci B klasörüne dosya ekleyemez',
  'INSERT INTO storage.objects (bucket_id, name, owner_id)
   VALUES (''submissions'', ''60000000-0000-4000-8000-00000000000b/zararli.jpg'', ''60000000-0000-4000-8000-00000000000b'')');

DO $$
DECLARE changed int;
BEGIN
  UPDATE storage.objects SET name = '60000000-0000-4000-8000-00000000000b/hack.jpg'
  WHERE bucket_id = 'submissions' AND name = '60000000-0000-4000-8000-00000000000b/odev2.jpg';
  GET DIAGNOSTICS changed = ROW_COUNT;
  IF changed <> 0 THEN RAISE EXCEPTION 'Öğrenci A B teslim dosyasını güncelleyememeli'; END IF;

  DELETE FROM storage.objects
  WHERE bucket_id = 'submissions' AND name = '60000000-0000-4000-8000-00000000000b/odev2.jpg';
  GET DIAGNOSTICS changed = ROW_COUNT;
  IF changed <> 0 THEN RAISE EXCEPTION 'Öğrenci A B teslim dosyasını silememeli'; END IF;

  RAISE NOTICE 'ok Öğrenci A B teslim dosyasını güncelleyemez ve silemez (0 satır etkilendi)';
END $$;

-- Documents bucket'ı:
SELECT pg_temp.expect_denied('Öğrenci A documents bucketına dosya ekleyemez',
  'INSERT INTO storage.objects (bucket_id, name) VALUES (''documents'', ''izinsiz_dokuman.pdf'')');

DO $$
DECLARE changed int;
BEGIN
  UPDATE storage.objects SET name = 'hack.pdf'
  WHERE bucket_id = 'documents' AND name = 'resmi_ders_plani.pdf';
  GET DIAGNOSTICS changed = ROW_COUNT;
  IF changed <> 0 THEN RAISE EXCEPTION 'Öğrenci A documents bucketındaki dosyayı güncelleyememeli'; END IF;

  DELETE FROM storage.objects
  WHERE bucket_id = 'documents' AND name = 'resmi_ders_plani.pdf';
  GET DIAGNOSTICS changed = ROW_COUNT;
  IF changed <> 0 THEN RAISE EXCEPTION 'Öğrenci A documents bucketındaki dosyayı silememeli'; END IF;

  RAISE NOTICE 'ok Öğrenci A documents bucketındaki dosyayı güncelleyemez ve silemez (0 satır etkilendi)';
END $$;

-- ------------------------------------------------------------------------------
-- 5. Pozitif İzolasyon Testleri: Öğrenci B Simetrik Yetki ve İzolasyon Sınırları
-- ------------------------------------------------------------------------------
RESET ROLE;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims',
  '{"sub":"60000000-0000-4000-8000-00000000000b","email":"rls-ogrenci-b@example.com","role":"authenticated"}', true);

-- Yüzey 1: game_scores
SELECT pg_temp.expect_count('Öğrenci B kendi skorunu görebilir',
  (SELECT count(*) FROM public.game_scores WHERE user_id = auth.uid()), 1);
SELECT pg_temp.expect_count('Öğrenci B Öğrenci A''nın oyun skorunu göremez',
  (SELECT count(*) FROM public.game_scores WHERE user_id = '60000000-0000-4000-8000-00000000000a'), 0);
SELECT pg_temp.expect_denied('Öğrenci B A adına game_scores ekleyemez',
  'INSERT INTO public.game_scores (user_id, game_id, score) VALUES (''60000000-0000-4000-8000-00000000000a'', 1, 99)');

-- Yüzey 2: assignment_submissions
SELECT pg_temp.expect_count('Öğrenci B kendi ödev teslimini görebilir',
  (SELECT count(*) FROM public.assignment_submissions WHERE student_id = auth.uid()), 1);
SELECT pg_temp.expect_count('Öğrenci B Öğrenci A''nın ödev teslimini göremez',
  (SELECT count(*) FROM public.assignment_submissions WHERE student_id = '60000000-0000-4000-8000-00000000000a'), 0);

INSERT INTO public.assignment_submissions (assignment_id, student_id, student_name, file_url)
VALUES ('60000000-0000-4000-8000-000000000044', auth.uid(), 'Öğrenci B', '/submissions/60000000-0000-4000-8000-00000000000b/yeni_odev_b.jpg');
SELECT pg_temp.expect_count('Öğrenci B kendi ödev teslimini başarıyla ekler',
  (SELECT count(*) FROM public.assignment_submissions WHERE student_id = auth.uid()), 2);

SELECT pg_temp.expect_denied('Öğrenci B Öğrenci A adına ödev teslimi ekleyemez',
  'INSERT INTO public.assignment_submissions (assignment_id, student_id, student_name, file_url)
   VALUES (''60000000-0000-4000-8000-000000000041'', ''60000000-0000-4000-8000-00000000000a'', ''Öğrenci A'', ''/url'')');

DO $$
DECLARE changed int;
BEGIN
  UPDATE public.assignment_submissions SET comment = 'hacked by b'
  WHERE student_id = '60000000-0000-4000-8000-00000000000a';
  GET DIAGNOSTICS changed = ROW_COUNT;
  IF changed <> 0 THEN RAISE EXCEPTION 'Öğrenci B Öğrenci A''nın teslimini güncelleyememeli'; END IF;
  RAISE NOTICE 'ok Öğrenci B Öğrenci A''nın teslimini güncelleyemez (0 satır etkilendi)';
END $$;

-- Yüzey 3: quiz_results
SELECT pg_temp.expect_count('Öğrenci B kendi quiz sonucunu görebilir',
  (SELECT count(*) FROM public.quiz_results WHERE user_id = auth.uid()), 1);
SELECT pg_temp.expect_count('Öğrenci B Öğrenci A''nın quiz sonucunu göremez',
  (SELECT count(*) FROM public.quiz_results WHERE user_id = '60000000-0000-4000-8000-00000000000a'), 0);

INSERT INTO public.quiz_results (user_id, quiz_id, score, total_questions, answers, time_spent)
VALUES (auth.uid(), '60000000-0000-4000-8000-000000000032', 90, 10, '{}'::jsonb, 110);
SELECT pg_temp.expect_count('Öğrenci B kendi quiz sonucunu başarıyla ekler',
  (SELECT count(*) FROM public.quiz_results WHERE user_id = auth.uid()), 2);

SELECT pg_temp.expect_denied('Öğrenci B Öğrenci A adına quiz sonucu ekleyemez',
  'INSERT INTO public.quiz_results (user_id, quiz_id, score, total_questions, answers, time_spent)
   VALUES (''60000000-0000-4000-8000-00000000000a'', ''60000000-0000-4000-8000-000000000032'', 70, 10, ''{}''::jsonb, 100)');

-- Yüzey 4: notes ve note_categories
SELECT pg_temp.expect_count('Öğrenci B kendi not kategorisini görür',
  (SELECT count(*) FROM public.note_categories WHERE user_id = auth.uid()), 1);
SELECT pg_temp.expect_count('Öğrenci B Öğrenci A''nın not kategorisini göremez',
  (SELECT count(*) FROM public.note_categories WHERE user_id = '60000000-0000-4000-8000-00000000000a'), 0);
SELECT pg_temp.expect_count('Öğrenci B kendi notunu görür',
  (SELECT count(*) FROM public.notes WHERE user_id = auth.uid()), 1);
SELECT pg_temp.expect_count('Öğrenci B Öğrenci A''nın notunu göremez',
  (SELECT count(*) FROM public.notes WHERE user_id = '60000000-0000-4000-8000-00000000000a'), 0);

SELECT pg_temp.expect_denied('Öğrenci B A adına kategori ekleyemez',
  'INSERT INTO public.note_categories (user_id, name) VALUES (''60000000-0000-4000-8000-00000000000a'', ''Hack'')');
SELECT pg_temp.expect_denied('Öğrenci B A adına not ekleyemez',
  'INSERT INTO public.notes (user_id, title, content) VALUES (''60000000-0000-4000-8000-00000000000a'', ''Hack'', ''Hack'')');

DO $$
DECLARE changed int;
BEGIN
  UPDATE public.notes SET title = 'Hacked by B' WHERE user_id = '60000000-0000-4000-8000-00000000000a';
  GET DIAGNOSTICS changed = ROW_COUNT;
  IF changed <> 0 THEN RAISE EXCEPTION 'Öğrenci B A notunu güncelleyememeli'; END IF;

  DELETE FROM public.notes WHERE user_id = '60000000-0000-4000-8000-00000000000a';
  GET DIAGNOSTICS changed = ROW_COUNT;
  IF changed <> 0 THEN RAISE EXCEPTION 'Öğrenci B A notunu silememeli'; END IF;
END $$;

-- Yüzey 5: student_weekly_plans
SELECT pg_temp.expect_count('Öğrenci B kendi haftalık çalışma planını görür',
  (SELECT count(*) FROM public.student_weekly_plans WHERE student_id = auth.uid()), 1);
SELECT pg_temp.expect_count('Öğrenci B Öğrenci A''nın haftalık planını göremez',
  (SELECT count(*) FROM public.student_weekly_plans WHERE student_id = '60000000-0000-4000-8000-00000000000a'), 0);

DO $$
DECLARE changed int;
BEGIN
  UPDATE public.student_weekly_plans SET title = 'Hack by B'
  WHERE student_id = '60000000-0000-4000-8000-00000000000a';
  GET DIAGNOSTICS changed = ROW_COUNT;
  IF changed <> 0 THEN RAISE EXCEPTION 'Öğrenci B A haftalık planını değiştirememeli'; END IF;
END $$;

-- Öğrenci B Öğrenci A'nın haftalık plan maddesini tamamlayamaz:
SELECT pg_temp.expect_denied(
  'Öğrenci B Öğrenci A haftalık plan maddesini tamamlayamaz',
  'SELECT public.complete_weekly_plan_item(''60000000-0000-4000-8000-0000000000ac''::uuid, true)',
  'Plan maddesi bulunamadı'
);

SELECT pg_temp.expect_count('Öğrenci B A plan maddesini RLS nedeniyle göremez',
  (SELECT count(*) FROM public.student_weekly_plan_items
   WHERE id = '60000000-0000-4000-8000-0000000000ac'), 0);

RESET ROLE;
SELECT pg_temp.expect_count('A plan maddesi completed_at NULL kalmalı (service_role kontrolü)',
  (SELECT count(*) FROM public.student_weekly_plan_items
   WHERE id = '60000000-0000-4000-8000-0000000000ac' AND completed_at IS NULL), 1);
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims',
  '{"sub":"60000000-0000-4000-8000-00000000000b","email":"rls-ogrenci-b@example.com","role":"authenticated"}', true);

-- Öğrenci B kendi haftalık plan maddesini tamamlar:
DO $$
BEGIN
  PERFORM public.complete_weekly_plan_item('60000000-0000-4000-8000-0000000000bb', true);
END $$;

SELECT pg_temp.expect_count('Öğrenci B kendi haftalık plan maddesini tamamlayabilir',
  (SELECT count(*) FROM public.student_weekly_plan_items
   WHERE id = '60000000-0000-4000-8000-0000000000bb' AND completed_at IS NOT NULL), 1);

-- Yüzey 6: notifications, shared_documents, comments
SELECT pg_temp.expect_count('Öğrenci B yalnız kendi bildirimini görür',
  (SELECT count(*) FROM public.notifications WHERE user_id = auth.uid()), 1);
SELECT pg_temp.expect_count('Öğrenci B Öğrenci A''nın bildirimini göremez',
  (SELECT count(*) FROM public.notifications WHERE user_id = '60000000-0000-4000-8000-00000000000a'), 0);

SELECT pg_temp.expect_count('Öğrenci B yalnız kendi paylaşılan dokümanını görür',
  (SELECT count(*) FROM public.shared_documents WHERE student_id = auth.uid()), 1);
SELECT pg_temp.expect_count('Öğrenci B Öğrenci A''nın paylaşılan dokümanını göremez',
  (SELECT count(*) FROM public.shared_documents WHERE student_id = '60000000-0000-4000-8000-00000000000a'), 0);

SELECT pg_temp.expect_count('Öğrenci B yalnız kendi yorumunu görür',
  (SELECT count(*) FROM public.comments WHERE user_id = auth.uid()), 1);
SELECT pg_temp.expect_count('Öğrenci B Öğrenci A''nın yorumunu göremez',
  (SELECT count(*) FROM public.comments WHERE user_id = '60000000-0000-4000-8000-00000000000a'), 0);

-- Yüzey 7: profiles sütun koruması
UPDATE public.profiles
SET avatar_id = 'lion', welcome_tour_seen_at = '2026-11-10T15:00:00Z'
WHERE id = auth.uid();

SELECT pg_temp.expect_count('Öğrenci B avatar_id ve welcome_tour_seen_at güncelleyebilir',
  (SELECT count(*) FROM public.profiles
   WHERE id = auth.uid() AND avatar_id = 'lion' AND welcome_tour_seen_at = '2026-11-10T15:00:00Z'), 1);

SELECT pg_temp.expect_denied('Öğrenci B grade alanını güncelleyemez',
  'UPDATE public.profiles SET grade = 10 WHERE id = auth.uid()');
SELECT pg_temp.expect_denied('Öğrenci B is_private_student alanını güncelleyemez',
  'UPDATE public.profiles SET is_private_student = true WHERE id = auth.uid()');

-- Yüzey 8: storage.objects
SELECT pg_temp.expect_count('Öğrenci B submissions bucketında kendi dosyasını görür',
  (SELECT count(*) FROM storage.objects
   WHERE bucket_id = 'submissions' AND name LIKE '60000000-0000-4000-8000-00000000000b/%'), 1);
SELECT pg_temp.expect_count('Öğrenci B submissions bucketında Öğrenci A''nın dosyasını göremez',
  (SELECT count(*) FROM storage.objects
   WHERE bucket_id = 'submissions' AND name LIKE '60000000-0000-4000-8000-00000000000a/%'), 0);

INSERT INTO storage.objects (bucket_id, name, owner_id)
VALUES ('submissions', '60000000-0000-4000-8000-00000000000b/yeni_odev_b.jpg', '60000000-0000-4000-8000-00000000000b');
SELECT pg_temp.expect_count('Öğrenci B kendi klasörüne dosya ekleyebilir',
  (SELECT count(*) FROM storage.objects
   WHERE bucket_id = 'submissions' AND name = '60000000-0000-4000-8000-00000000000b/yeni_odev_b.jpg'), 1);

SELECT pg_temp.expect_denied('Öğrenci B Öğrenci A klasörüne dosya ekleyemez',
  'INSERT INTO storage.objects (bucket_id, name, owner_id)
   VALUES (''submissions'', ''60000000-0000-4000-8000-00000000000a/hack_by_b.jpg'', ''60000000-0000-4000-8000-00000000000a'')');

DO $$
DECLARE changed int;
BEGIN
  UPDATE storage.objects SET name = '60000000-0000-4000-8000-00000000000a/hack.jpg'
  WHERE bucket_id = 'submissions' AND name = '60000000-0000-4000-8000-00000000000a/odev1.jpg';
  GET DIAGNOSTICS changed = ROW_COUNT;
  IF changed <> 0 THEN RAISE EXCEPTION 'Öğrenci B A teslim dosyasını güncelleyememeli'; END IF;

  DELETE FROM storage.objects
  WHERE bucket_id = 'submissions' AND name = '60000000-0000-4000-8000-00000000000a/odev1.jpg';
  GET DIAGNOSTICS changed = ROW_COUNT;
  IF changed <> 0 THEN RAISE EXCEPTION 'Öğrenci B A teslim dosyasını silememeli'; END IF;
END $$;

SELECT pg_temp.expect_denied('Öğrenci B documents bucketına dosya ekleyemez',
  'INSERT INTO storage.objects (bucket_id, name) VALUES (''documents'', ''b_izinsiz.pdf'')');

-- ------------------------------------------------------------------------------
-- 6. Pozitif İzolasyon Testleri: Öğretmen / Admin Rolü (8 Yüzeyin Tamamı)
-- ------------------------------------------------------------------------------
RESET ROLE;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims',
  '{"sub":"60000000-0000-4000-8000-0000000000ad","email":"admin@ugurhoca.com","role":"authenticated"}', true);

-- Yüzey 1: game_scores
SELECT pg_temp.expect_count('Admin her iki öğrencinin oyun skorlarını görür',
  (SELECT count(*) FROM public.game_scores), 2);

-- Yüzey 2: assignment_submissions
SELECT pg_temp.expect_count('Admin tüm ödev teslimlerini görür (A ve B)',
  (SELECT count(*) FROM public.assignment_submissions), 4);

UPDATE public.assignment_submissions
SET grade = 95, feedback = 'Tebrikler'
WHERE id = '60000000-0000-4000-8000-00000000006a';
SELECT pg_temp.expect_count('Admin ödev teslimine not ve geri bildirim verebilir',
  (SELECT count(*) FROM public.assignment_submissions
   WHERE id = '60000000-0000-4000-8000-00000000006a' AND grade = 95 AND feedback = 'Tebrikler'), 1);

-- Yüzey 3: quiz_results
SELECT pg_temp.expect_count('Admin tüm quiz sonuçlarını görür',
  (SELECT count(*) FROM public.quiz_results), 4);

-- Yüzey 4: notes ve note_categories
SELECT pg_temp.expect_count('Admin note_categories kayıtlarını görür',
  (SELECT count(*) FROM public.note_categories), 2);
SELECT pg_temp.expect_count('Admin notes kayıtlarını görür',
  (SELECT count(*) FROM public.notes), 2);

-- Yüzey 5: student_weekly_plans
SELECT pg_temp.expect_count('Admin tüm öğrenci haftalık planlarını görür',
  (SELECT count(*) FROM public.student_weekly_plans), 2);

INSERT INTO public.student_weekly_plans (id, student_id, week_start, title)
VALUES ('60000000-0000-4000-8000-0000000000ca', '60000000-0000-4000-8000-00000000000a', '2026-11-16', 'Admin Yeni Plan A');
SELECT pg_temp.expect_count('Admin öğrenci için yeni haftalık plan oluşturabilir',
  (SELECT count(*) FROM public.student_weekly_plans WHERE id = '60000000-0000-4000-8000-0000000000ca'), 1);

-- Yüzey 6: notifications, shared_documents, comments
SELECT pg_temp.expect_count('Admin tüm bildirimleri görür',
  (SELECT count(*) FROM public.notifications), 2);
SELECT pg_temp.expect_count('Admin tüm paylaşılan dokümanları görür',
  (SELECT count(*) FROM public.shared_documents), 2);
SELECT pg_temp.expect_count('Admin tüm yorumları görür',
  (SELECT count(*) FROM public.comments), 2);

-- Yüzey 7: profiles sütun koruması
UPDATE public.profiles
SET grade = 6, is_favorite = true, is_private_student = true
WHERE id = '60000000-0000-4000-8000-00000000000a';

SELECT pg_temp.expect_count('Admin Öğrenci A grade, is_favorite, is_private_student alanlarını güncelleyebilir',
  (SELECT count(*) FROM public.profiles
   WHERE id = '60000000-0000-4000-8000-00000000000a' AND grade = 6 AND is_favorite = true AND is_private_student = true), 1);

-- Yüzey 8: storage.objects
SELECT pg_temp.expect_count('Admin her iki öğrencinin teslim nesnelerini görür',
  (SELECT count(*) FROM storage.objects WHERE bucket_id = 'submissions'), 4);

INSERT INTO storage.objects (bucket_id, name) VALUES ('documents', 'admin_resmi_belge.pdf');
SELECT pg_temp.expect_count('Admin documents bucketına dosya ekleyebilir',
  (SELECT count(*) FROM storage.objects WHERE bucket_id = 'documents' AND name = 'admin_resmi_belge.pdf'), 1);

UPDATE storage.objects SET name = 'admin_resmi_belge_v2.pdf'
WHERE bucket_id = 'documents' AND name = 'admin_resmi_belge.pdf';
SELECT pg_temp.expect_count('Admin documents bucketındaki dosyayı güncelleyebilir',
  (SELECT count(*) FROM storage.objects WHERE bucket_id = 'documents' AND name = 'admin_resmi_belge_v2.pdf'), 1);

DELETE FROM storage.objects
WHERE bucket_id = 'documents' AND name = 'admin_resmi_belge_v2.pdf';
SELECT pg_temp.expect_count('Admin documents bucketındaki dosyayı silebilir',
  (SELECT count(*) FROM storage.objects WHERE bucket_id = 'documents' AND name = 'admin_resmi_belge_v2.pdf'), 0);

-- ------------------------------------------------------------------------------
-- 7. Pozitif İzolasyon Testleri: Anonim Rol (anon) - 8 Yüzeyin Tamamı
-- ------------------------------------------------------------------------------
RESET ROLE;
SET LOCAL ROLE anon;
-- Önemli (P2 bulgusu): Önceki admin JWT claims'ini tamamen temizle!
SELECT set_config('request.jwt.claims', '{}', true);

-- 1. game_scores: SQL seviyesinde engellidir (REVOKE)
SELECT pg_temp.expect_denied('anon game_scores okuyamaz (REVOKE)', 'SELECT count(*) FROM public.game_scores');

-- 2. assignment_submissions: RLS korumalıdır (0 satır döner) ve yazma reddedilir
SELECT pg_temp.expect_count('anon assignment_submissions göremez (RLS: 0 satır)', (SELECT count(*) FROM public.assignment_submissions), 0);
SELECT pg_temp.expect_denied('anon assignment_submissions ekleyemez',
  'INSERT INTO public.assignment_submissions (assignment_id, student_id, student_name, file_url)
   VALUES (''60000000-0000-4000-8000-000000000041'', ''60000000-0000-4000-8000-00000000000a'', ''anon'', ''url'')');

-- 3. quiz_results: SQL seviyesinde engellidir (REVOKE)
SELECT pg_temp.expect_denied('anon quiz_results okuyamaz (REVOKE)', 'SELECT count(*) FROM public.quiz_results');

-- 4. note_categories ve notes: RLS korumalıdır (0 satır döner) ve yazma reddedilir
SELECT pg_temp.expect_count('anon note_categories göremez (RLS: 0 satır)', (SELECT count(*) FROM public.note_categories), 0);
SELECT pg_temp.expect_denied('anon note_categories ekleyemez',
  'INSERT INTO public.note_categories (user_id, name) VALUES (''60000000-0000-4000-8000-00000000000a'', ''anon'')');

SELECT pg_temp.expect_count('anon notes göremez (RLS: 0 satır)', (SELECT count(*) FROM public.notes), 0);
SELECT pg_temp.expect_denied('anon notes ekleyemez',
  'INSERT INTO public.notes (user_id, title, content) VALUES (''60000000-0000-4000-8000-00000000000a'', ''anon'', ''anon'')');

-- 5. student_weekly_plans: SQL seviyesinde engellidir (REVOKE)
SELECT pg_temp.expect_denied('anon student_weekly_plans okuyamaz (REVOKE)', 'SELECT count(*) FROM public.student_weekly_plans');

-- 6. notifications (RLS: 0 satır), shared_documents (REVOKE), comments (REVOKE):
SELECT pg_temp.expect_count('anon notifications göremez (RLS: 0 satır)', (SELECT count(*) FROM public.notifications), 0);
SELECT pg_temp.expect_denied('anon shared_documents okuyamaz (REVOKE)', 'SELECT count(*) FROM public.shared_documents');
SELECT pg_temp.expect_denied('anon comments okuyamaz (REVOKE)', 'SELECT count(*) FROM public.comments');

-- anon profilleri güncelleyemez:
SELECT pg_temp.expect_denied('anon profilleri güncelleyemez',
  'UPDATE public.profiles SET grade = 5 WHERE id = ''60000000-0000-4000-8000-00000000000a''');

-- anon storage submissions bucketındaki nesneleri göremez:
SELECT pg_temp.expect_count('anon submissions bucketındaki dosyaları göremez',
  (SELECT count(*) FROM storage.objects WHERE bucket_id = 'submissions'), 0);

-- anon documents bucketına yazamaz:
SELECT pg_temp.expect_denied('anon documents bucketına dosya ekleyemez',
  'INSERT INTO storage.objects (bucket_id, name) VALUES (''documents'', ''anon_zararli.pdf'')');

SELECT pg_temp.expect_denied('anon documents bucketındaki dosyayı güncelleyemez',
  'UPDATE storage.objects SET name = ''anon_hack.pdf'' WHERE bucket_id = ''documents'' AND name = ''resmi_ders_plani.pdf''');

SELECT pg_temp.expect_denied('anon documents bucketındaki dosyayı silemez',
  'DELETE FROM storage.objects WHERE bucket_id = ''documents'' AND name = ''resmi_ders_plani.pdf''');

-- anon yeni yüzeyleri (exit_ticket_sessions, exit_ticket_responses, live_lesson_questions) okuyamaz (REVOKE):
SELECT pg_temp.expect_denied('anon exit_ticket_sessions okuyamaz (REVOKE)',
  'SELECT count(*) FROM public.exit_ticket_sessions');
SELECT pg_temp.expect_denied('anon exit_ticket_responses okuyamaz (REVOKE)',
  'SELECT count(*) FROM public.exit_ticket_responses');
SELECT pg_temp.expect_denied('anon live_lesson_questions okuyamaz (REVOKE)',
  'SELECT count(*) FROM public.live_lesson_questions');

-- ------------------------------------------------------------------------------
-- 8. Yüzey 9 & 10: exit_ticket_* ve live_lesson_questions (Öğrenci İzolasyonu)
-- ------------------------------------------------------------------------------
RESET ROLE;
INSERT INTO public.exit_ticket_sessions (id, code, title, grade, status, created_by)
VALUES (
  '60000000-0000-4000-8000-0000000000e1',
  '842915',
  '8. Sınıf Üslü İfadeler Çıkış Bileti',
  8,
  'active',
  '60000000-0000-4000-8000-0000000000ad'
);
INSERT INTO public.exit_ticket_responses (session_id, student_key, student_id, student_name, question_index, selected_index)
VALUES
  ('60000000-0000-4000-8000-0000000000e1', 'key-a', '60000000-0000-4000-8000-00000000000a', 'Öğrenci A', 0, 1),
  ('60000000-0000-4000-8000-0000000000e1', 'key-b', '60000000-0000-4000-8000-00000000000b', 'Öğrenci B', 0, 2);

INSERT INTO public.live_lesson_questions (id, student_id, student_name, topic, difficulty, question_text)
VALUES
  ('60000000-0000-4000-8000-0000000000f1', '60000000-0000-4000-8000-00000000000a', 'Öğrenci A', 'Kesirler', 'Orta', 'Payda eşitleme sorusu A'),
  ('60000000-0000-4000-8000-0000000000f2', '60000000-0000-4000-8000-00000000000b', 'Öğrenci B', 'Üslü Sayılar', 'Zor', 'Negatif üs sorusu B');

-- Öğrenci A: exit_ticket_responses tablosunu doğrudan okuyamaz (diğer öğrencilerin adlarını göremez)
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims',
  '{"sub":"60000000-0000-4000-8000-00000000000a","email":"rls-ogrenci-a@example.com","role":"authenticated"}', true);

SELECT pg_temp.expect_count('Öğrenci A exit_ticket_sessions doğrudan göremez (RLS: 0 satır)',
  (SELECT count(*) FROM public.exit_ticket_sessions), 0);
SELECT pg_temp.expect_count('Öğrenci A exit_ticket_responses doğrudan göremez (RLS: 0 satır)',
  (SELECT count(*) FROM public.exit_ticket_responses), 0);
SELECT pg_temp.expect_count('Öğrenci A live_lesson_questions tablosunda yalnız kendi sorusunu görür',
  (SELECT count(*) FROM public.live_lesson_questions), 1);
SELECT pg_temp.expect_denied('Öğrenci A Öğrenci B adına live_lesson_questions ekleyemez',
  'INSERT INTO public.live_lesson_questions (student_id, student_name, topic, question_text)
   VALUES (''60000000-0000-4000-8000-00000000000b'', ''Sahte B'', ''Cebir'', ''Yetkisiz soru'')');
INSERT INTO public.live_lesson_questions (id, student_id, student_name, topic, question_text)
VALUES ('60000000-0000-4000-8000-0000000000f3', '60000000-0000-4000-8000-00000000000a', 'Öğrenci A', 'Oran Orantı', 'Kendi yeni sorum');
SELECT pg_temp.expect_count('Öğrenci A kendi sorusunu ekledikten sonra 2 sorusunu görür (B yine gizli)',
  (SELECT count(*) FROM public.live_lesson_questions), 2);

-- Admin: tüm exit_ticket ve live_lesson_questions kayıtlarını görür ve yönetir
RESET ROLE;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims',
  '{"sub":"60000000-0000-4000-8000-0000000000ad","email":"admin@ugurhoca.com","role":"authenticated"}', true);

SELECT pg_temp.expect_count('Admin exit_ticket_sessions kayıtlarını görür',
  (SELECT count(*) FROM public.exit_ticket_sessions), 1);
SELECT pg_temp.expect_count('Admin exit_ticket_responses kayıtlarını görür',
  (SELECT count(*) FROM public.exit_ticket_responses), 2);
SELECT pg_temp.expect_count('Admin tüm öğrencilerin live_lesson_questions sorularını görür',
  (SELECT count(*) FROM public.live_lesson_questions), 3);
UPDATE public.live_lesson_questions
SET status = 'projected'
WHERE id = '60000000-0000-4000-8000-0000000000f1';
SELECT pg_temp.expect_count('Admin live_lesson_questions durumunu projected yapabilir',
  (SELECT count(*) FROM public.live_lesson_questions WHERE id = '60000000-0000-4000-8000-0000000000f1' AND status = 'projected'), 1);

-- ------------------------------------------------------------------------------
-- 9. Temizlik ve Geri Alma
-- ------------------------------------------------------------------------------
RESET ROLE;
ROLLBACK;
