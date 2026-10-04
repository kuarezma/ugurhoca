-- catchup: BİREBİR KOPYA — kaynak supabase/migrations/20261004120000_live_lesson_rls_scope.sql (bu dal)
-- catchup: "-- catchup" ile işaretli satırlar dışında kaynakla aynıdır (verify-copies.sh).
-- ==========================================================
-- F1-RLS: canlı ders tablolarının okuma kapsamı.
--
-- DAĞITIM SIRASI (zorunlu): önce live_lessons'ı kullanıcı istemcisinden açık
-- kolon listesiyle (LIVE_LESSON_CLIENT_COLUMNS) okuyan uygulama sürümü deploy
-- edilir, SONRA bu migration uygulanır. Ters sırada eski sürümün
-- select('*') sorguları (admin paneli) 42501 ile düşer.
--
-- 20260514120000 beş canlı ders tablosuna da "auth.role() = 'authenticated'"
-- SELECT politikası vermişti: giriş yapmış her öğrenci başka derslerin
-- sohbetini, katılımcılarını, olaylarını ve live_lessons.teacher_proof
-- (öğretmen HMAC kanıtı) alanını okuyabiliyordu. Bu migration:
--
-- 1. live_lessons: admin hepsini; öğrenci yalnızca kendisini hedefleyen
--    dersleri okur. Hedefleme kuralı canUserAccessLiveLesson() ile birebir
--    aynıdır (src/features/live-lessons/lib/lesson-access.ts):
--      target_grade = 'selected' → auth.uid() target_student_ids içinde
--      target_grade = 'all'      → herkes
--      diğer                     → target_grade = live_lesson_viewer_grade()
--    target_student_ids yalnızca 'selected' iken anlamlıdır; eski kayıtlarda
--    başka hedefe çevrilmiş derste bayat dizi kalmış olabilir, diziye bakılmaz.
--    Sınıf çözümü src/lib/access-grade.ts'nin aynasıdır: profiles.grade, o
--    NULL ise auth.users.raw_user_meta_data->'grade'; varsayılan sınıf YOK
--    (çözülemeyen kullanıcı sınıf derslerini görmez); profil 7 / metin '07' → '7'.
--    Sayısal metadata negatif olmayan güvenli tam sayıysa kabul edilir.
-- 2. Alt tablolar, live_lessons RLS'inden geçen ders kimlikleriyle sınırlanır
--    ("lesson_id IN (SELECT id FROM live_lessons)" — kural tek yerde kalır,
--    alt sorgu sorgu başına bir kez çalışan hashed SubPlan olur):
--      live_lesson_chat_messages, live_lesson_events → erişilebilen derslerin
--        tüm satırları
--      live_lesson_participants → yalnızca kendi satırı (+ ders erişimi)
--      live_lesson_reminders → yalnızca admin (tabloda kullanıcı kolonu yok;
--        satırlar service_role cron'unun iç durumu)
-- 3. teacher_proof istemci rollerine hiç açılmaz: tablo düzeyi SELECT
--    anon/authenticated'dan alınır, authenticated'a teacher_proof DIŞINDAKİ
--    kolonlar kolon düzeyinde verilir. service_role etkilenmez (sunucu kodu
--    select('*') ile okumaya ve toClientLiveLesson ile ayıklamaya devam eder).
--    Kullanıcı istemcisinden live_lessons'a select('*') artık 42501 verir;
--    açık kolon listesi gerekir.
--    NOT: live_lessons'a eklenecek yeni kolonlar authenticated'a ayrıca
--    GRANT edilmelidir (bu dosyadaki DO bloğu tekrar çalıştırılabilir).
-- 4. Realtime: beş tablo supabase_realtime yayınından çıkarılır ve replica
--    identity varsayılana döner. Kodda bu tablolara postgres_changes aboneliği
--    yoktur; DELETE olayları RLS süzgecinden geçmediği için yayında kalmaları
--    yalnızca sızıntı yüzeyidir.
--
-- Politikalar (select auth.uid()) / (select public.is_admin_email()) initplan
-- kalıbını kullanır (bkz. 20260930140000). Migration tekrar çalıştırılabilir.
-- Yazma politikası yoktur: tüm yazmalar service_role ile sunucudan yapılır.
-- ==========================================================

-- Kilit beklerken canlı trafiği kuyruğa almasın; alınamazsa migration düşer
-- ve tekrar denenebilir.
SET lock_timeout = '5s';

-- --- Yardımcı: sınıf normalizasyonu (src/lib/access-grade.ts aynası) ---------
-- Profil int/text değeri metne çevrilir; metadata string → tam 'Mezun' ya da
-- yalnız rakam (baştaki sıfırlar atılır), number → yalnız rakam ve <= 2^53-1.
-- SQL ile JS farkı yalnız JS’in üretemediği ham JSON sayı temsillerinde (7.0 vb.) kalır.
CREATE OR REPLACE FUNCTION public.live_lesson_normalize_grade(value jsonb)
RETURNS text
LANGUAGE sql
IMMUTABLE
SET search_path = ''
AS $$
  SELECT CASE jsonb_typeof(value)
    WHEN 'number' THEN
      CASE WHEN value #>> '{}' ~ '^[0-9]+$' THEN
        CASE WHEN (value #>> '{}')::numeric <= 9007199254740991
          THEN value #>> '{}'
        END
      END
    WHEN 'string' THEN
      CASE
        WHEN value #>> '{}' = 'Mezun' THEN 'Mezun'
        WHEN value #>> '{}' ~ '^[0-9]+$'
          THEN coalesce(nullif(ltrim(value #>> '{}', '0'), ''), '0')
      END
  END;
$$;

REVOKE ALL ON FUNCTION public.live_lesson_normalize_grade(jsonb) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.live_lesson_normalize_grade(jsonb) TO service_role;

-- --- Yardımcı: çağıranın kendi sınıfı ---------------------------------------
-- DEFINER: politika profiles RLS'ine bağımlı kalmasın ve auth.users okunabilsin.
-- Yalnızca çağıranın kendi satırlarını okur; başka kullanıcı hakkında bilgi
-- döndürmez. Profil sınıfı NULL değilse (geçersiz olsa bile) metadata'ya
-- düşülmez — uygulamadaki `profile?.grade ?? metadata.grade` ile aynı.
CREATE OR REPLACE FUNCTION public.live_lesson_viewer_grade()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT public.live_lesson_normalize_grade(
    coalesce(
      (SELECT to_jsonb(p.grade::text)
         FROM public.profiles p
        WHERE p.id = (SELECT auth.uid()) AND p.grade IS NOT NULL),
      (SELECT u.raw_user_meta_data -> 'grade'
         FROM auth.users u
        WHERE u.id = (SELECT auth.uid()))
    )
  );
$$;

REVOKE ALL ON FUNCTION public.live_lesson_viewer_grade() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.live_lesson_viewer_grade() TO authenticated, service_role;

-- --- live_lessons ------------------------------------------------------------
DROP POLICY IF EXISTS "live_lessons_authenticated_select" ON public.live_lessons;
DROP POLICY IF EXISTS "live_lessons_select_scoped" ON public.live_lessons;
CREATE POLICY "live_lessons_select_scoped" ON public.live_lessons
  FOR SELECT TO authenticated
  USING (
    (SELECT public.is_admin_email())
    OR target_grade = 'all'
    OR (
      target_grade = 'selected'
      AND (SELECT auth.uid()) = ANY (target_student_ids)
    )
    OR (
      target_grade NOT IN ('all', 'selected')
      AND target_grade = (SELECT public.live_lesson_viewer_grade())
    )
  );

-- --- live_lesson_participants -----------------------------------------------
DROP POLICY IF EXISTS "live_lesson_participants_authenticated_select" ON public.live_lesson_participants;
DROP POLICY IF EXISTS "live_lesson_participants_select_scoped" ON public.live_lesson_participants;
CREATE POLICY "live_lesson_participants_select_scoped" ON public.live_lesson_participants
  FOR SELECT TO authenticated
  USING (
    (SELECT public.is_admin_email())
    OR (
      user_id = (SELECT auth.uid())
      AND lesson_id IN (SELECT l.id FROM public.live_lessons l)
    )
  );

-- --- live_lesson_events ------------------------------------------------------
DROP POLICY IF EXISTS "live_lesson_events_authenticated_select" ON public.live_lesson_events;
DROP POLICY IF EXISTS "live_lesson_events_select_scoped" ON public.live_lesson_events;
CREATE POLICY "live_lesson_events_select_scoped" ON public.live_lesson_events
  FOR SELECT TO authenticated
  USING (
    (SELECT public.is_admin_email())
    OR lesson_id IN (SELECT l.id FROM public.live_lessons l)
  );

-- --- live_lesson_chat_messages -----------------------------------------------
DROP POLICY IF EXISTS "live_lesson_chat_authenticated_select" ON public.live_lesson_chat_messages;
DROP POLICY IF EXISTS "live_lesson_chat_select_scoped" ON public.live_lesson_chat_messages;
CREATE POLICY "live_lesson_chat_select_scoped" ON public.live_lesson_chat_messages
  FOR SELECT TO authenticated
  USING (
    (SELECT public.is_admin_email())
    OR lesson_id IN (SELECT l.id FROM public.live_lessons l)
  );

-- --- live_lesson_reminders ---------------------------------------------------
DROP POLICY IF EXISTS "live_lesson_reminders_authenticated_select" ON public.live_lesson_reminders;
DROP POLICY IF EXISTS "live_lesson_reminders_admin_select" ON public.live_lesson_reminders;
CREATE POLICY "live_lesson_reminders_admin_select" ON public.live_lesson_reminders
  FOR SELECT TO authenticated
  USING ((SELECT public.is_admin_email()));

-- --- teacher_proof: kolon düzeyi SELECT --------------------------------------
-- Tablo düzeyi SELECT kalkınca kolon düzeyi grant'lar geçerli olur. Kolon
-- listesi katalogdan okunur (teacher_proof hariç); böylece şemadaki tüm
-- güncel kolonlar (target_student_ids, recording_url, materials_url ...)
-- elle kopyalama kayması olmadan kapsanır.
REVOKE SELECT ON TABLE public.live_lessons FROM PUBLIC, anon, authenticated;
REVOKE SELECT (teacher_proof) ON TABLE public.live_lessons FROM PUBLIC, anon, authenticated;

DO $$
DECLARE
  cols text;
BEGIN
  SELECT string_agg(quote_ident(a.attname), ', ' ORDER BY a.attnum)
  INTO cols
  FROM pg_attribute a
  WHERE a.attrelid = 'public.live_lessons'::regclass
    AND a.attnum > 0
    AND NOT a.attisdropped
    AND a.attname <> 'teacher_proof';

  EXECUTE format('GRANT SELECT (%s) ON TABLE public.live_lessons TO authenticated', cols);
END;
$$;

-- --- Realtime: yayından çıkar, replica identity'yi varsayılana döndür -------
-- postgres_changes DELETE olayları RLS'ten geçmeden (replica identity full ile
-- tüm eski satırla) her aboneye gider. Uygulama bu tablolara abone olmuyor
-- (yalnız notifications ve assignment_submissions); yayın gereksiz sızıntı
-- yüzeyidir. Tablo yayında değilse veya yayın yoksa sessizce geçilir.
DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'live_lessons',
    'live_lesson_participants',
    'live_lesson_events',
    'live_lesson_chat_messages',
    'live_lesson_reminders'
  ] LOOP
    IF EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = t
    ) THEN
      EXECUTE format('ALTER PUBLICATION supabase_realtime DROP TABLE public.%I', t);
    END IF;

    -- 'd' = DEFAULT (birincil anahtar). Gereksiz ACCESS EXCLUSIVE kilidinden
    -- kaçınmak için yalnız farklıysa değiştirilir.
    IF (SELECT c.relreplident FROM pg_class c WHERE c.oid = format('public.%I', t)::regclass) <> 'd' THEN
      EXECUTE format('ALTER TABLE public.%I REPLICA IDENTITY DEFAULT', t);
    END IF;
  END LOOP;
END;
$$;

RESET lock_timeout;
