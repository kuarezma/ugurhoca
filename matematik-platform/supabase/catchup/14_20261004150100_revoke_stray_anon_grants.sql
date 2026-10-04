-- catchup: BİREBİR KOPYA — kaynak supabase/migrations/20261004150100_revoke_stray_anon_grants.sql (PR #10, commit 5d4caa3; bu dalda yok)
-- catchup: "-- catchup" ile işaretli satırlar dışında kaynakla aynıdır (verify-copies.sh).
-- ==========================================================
-- F1B-B: Gereksiz geniş okuma/yazma yetkilerini kapat.
--
-- Etkin durum (önceki migration'lardan çıkarıldı):
-- 1. student_groups: 20260906123000 ve 20260906140000 "student_groups_select"
--    politikasını FOR SELECT TO authenticated USING (true) olarak bıraktı;
--    her oturumlu öğrenci tüm grupları (ad, açıklama, sınıf) okuyabiliyordu.
--    anon'un tablo yetkisi zaten alınmıştı. Koddaki tek okuyucu
--    src/features/admin/lib/studentGroups.ts (admin; şu an hiçbir yerden
--    import edilmiyor). Gereken erişim: admin + gruba üye öğrenci.
--    student_group_members SELECT politikası yalnızca kendi satırını
--    gösterdiği için EXISTS alt sorgusu üyenin yalnız kendi grubunu eşler
--    ve politika döngüsü oluşmaz.
-- 2. chat_rooms / chat_room_members / chat_messages (20260408160000):
--    anon + authenticated'a tam CRUD; "member_members_select" USING (true)
--    tüm üyelerin user_tc (TC kimlik no) alanını anonim herkese açıyordu,
--    "member_messages_*" da odada herhangi bir üye varsa okuma/yazmaya izin
--    veriyordu. Öğrenci sohbeti emekliye ayrıldı; src/ altında bu tablolara
--    hiç referans yok. Tablolar ve veriler silinmez (geri alınamaz işlem
--    değil); yalnızca API rollerinin yetkisi ve açık politikalar kaldırılır.
--    service_role erişimi korunur.
--    chat_users 20260906120000 ile silindi; varsa (eski ortam) aynı şekilde
--    kapatılır.
-- 3. quiz_results (20260408130000): anon'a SELECT/INSERT/UPDATE/DELETE
--    verilmiş. Politikalar auth.uid() = user_id gerektirdiği için anon hiçbir
--    satıra erişemez; yetki gereksiz. Okuyucular/yazıcılar: TestsPage
--    (yalnız oturumlu kullanıcı yazar; bekleyen sonuçlar oturumdan sonra
--    gönderilir), profile/queries + profile/server (oturumlu), admin/queries
--    (admin), delete-account (service_role). authenticated yetkisi kalır.
--
-- Tüm bloklar to_regclass ile tablonun varlığını denetler; migration tekrar
-- çalıştırılabilir.
-- ==========================================================

SET lock_timeout = '5s';

-- 1. student_groups -------------------------------------------------------
DO $$
BEGIN
  IF to_regclass('public.student_groups') IS NOT NULL THEN
    DROP POLICY IF EXISTS "student_groups_select" ON public.student_groups;
    CREATE POLICY "student_groups_select" ON public.student_groups
      FOR SELECT TO authenticated
      USING (
        public.is_admin_email()
        OR EXISTS (
          SELECT 1
          FROM public.student_group_members m
          WHERE m.group_id = student_groups.id
            AND m.user_id = (SELECT auth.uid())
        )
      );

    REVOKE ALL ON public.student_groups FROM anon;
  END IF;
END $$;

-- 2. Emekliye ayrılan sohbet tabloları -----------------------------------
DO $$
BEGIN
  IF to_regclass('public.chat_rooms') IS NOT NULL THEN
    DROP POLICY IF EXISTS "member_rooms_select" ON public.chat_rooms;
    REVOKE ALL ON public.chat_rooms FROM anon, authenticated;
  END IF;

  IF to_regclass('public.chat_room_members') IS NOT NULL THEN
    DROP POLICY IF EXISTS "member_members_select" ON public.chat_room_members;
    REVOKE ALL ON public.chat_room_members FROM anon, authenticated;
  END IF;

  IF to_regclass('public.chat_messages') IS NOT NULL THEN
    DROP POLICY IF EXISTS "member_messages_select" ON public.chat_messages;
    DROP POLICY IF EXISTS "member_messages_insert" ON public.chat_messages;
    REVOKE ALL ON public.chat_messages FROM anon, authenticated;
  END IF;

  IF to_regclass('public.chat_users') IS NOT NULL THEN
    REVOKE ALL ON public.chat_users FROM anon, authenticated;
  END IF;
END $$;

-- 3. quiz_results ----------------------------------------------------------
DO $$
BEGIN
  IF to_regclass('public.quiz_results') IS NOT NULL THEN
    REVOKE ALL ON public.quiz_results FROM anon;
  END IF;
END $$;
