-- catchup: BİREBİR KOPYA — kaynak supabase/migrations/20261004170000_lock_down_public_reads.sql (bu dal)
-- catchup: "-- catchup" ile işaretli satırlar dışında kaynakla aynıdır (verify-copies.sh).
-- ==========================================================
-- Production'da anonim okuma/yazmaya açık kalan yüzeyler (2026-10-04
-- salt okunur denetim). Veri silinmez, satır değiştirilmez.
--
-- 1. shared_documents: "shared_documents_select" FOR SELECT TO public
--    USING (true) + anon tablo yetkisi → öğrenci adı ve e-postası dahil tüm
--    satırlar anonim okunabiliyordu. Koddaki okuyucular:
--      home/queries.ts fetchUserAssignments, profile/queries.ts,
--      profile/server.ts → .eq('student_id', <oturumdaki kullanıcı>)
--      admin/queries.ts → admin (tüm satırlar)
--      admin-worksheet-candidates/approve → service_role (RLS dışı)
--    Anonim okuyucu yok. Politika 20260429120000'deki
--    shared_documents_select_own ile aynıdır (initplan kalıbıyla).
--    Not: öğrenci "kaldır" akışı (home/queries.ts dismissHomeAssignment)
--    shared_documents'tan DELETE yapar; production'da öğrenci DELETE
--    politikası yok, bu akış bugün de 0 satır siler. Burada genişletilmez.
-- 2. chat_users: emekli sohbet tablosu, TC kimlik numarası tutar; src/ içinde
--    referansı yok. Tablo ve satırlar korunur; anon/authenticated yetkisi ve
--    kullanıcıya açık politikalar kaldırılır. service_role (RLS'i atlar)
--    erişimi sürer. chat_users_admin_all tanım olarak kalır ama authenticated
--    yetkisi olmadığından istemciden etkisizdir (20261004150100 ile aynı).
-- 3. storage "documents" bucket'ı (public): dashboard'dan eklenmiş
--    "Allow anonymous uploads" (public INSERT) ve "documents flreew_0..3"
--    (anon SELECT/INSERT/UPDATE/DELETE) herkesin dosya yükleyip silmesine
--    izin veriyordu. Koddaki kullanım:
--      - Okuma: yalnız getPublicUrl (public bucket; RLS gerektirmez).
--      - Yükleme: uploadSupportFiles (home/queries.ts) oturumlu kullanıcı,
--        ad 'support_<ts>_...' (kök dizin); admin içerik yüklemeleri
--        (AdminMainModal, content/queries.ts uploadContentFile) admin oturumu.
--      - Silme/güncelleme/listeleme: kodda yok.
--    Yeni politikalar: oturumlu kullanıcı yalnız kök dizine 'support_' ön
--    ekli dosya ekler; kendi yüklediği nesneyi okuyabilir (yükleme yanıtı
--    için); admin bucket'ta tam yetkili. service_role etkilenmez.
--    storage.objects'in sahibi supabase_storage_admin'dir; postgres rolü
--    üye değilse politika DDL'i yetki hatası verir. Hata uyarıya çevrilir
--    (alt transaction geri alınır), dosyanın kalanı uygulanır; sonrası
--    doğrulama SELECT'i politikaların gerçekten değiştiğini kontrol eder.
--
-- Tekrar çalıştırılabilir.
-- ==========================================================

SET lock_timeout = '5s';

-- 1. shared_documents ---------------------------------------------------
DO $$
BEGIN
  IF to_regclass('public.shared_documents') IS NOT NULL THEN
    DROP POLICY IF EXISTS "shared_documents_select" ON public.shared_documents;
    DROP POLICY IF EXISTS "shared_documents_select_own" ON public.shared_documents;
    CREATE POLICY "shared_documents_select_own" ON public.shared_documents
      FOR SELECT TO authenticated
      USING (
        student_id = (SELECT auth.uid())
        OR (SELECT public.is_admin_email())
      );

    REVOKE ALL ON public.shared_documents FROM anon;
  END IF;
END $$;

-- 2. chat_users -----------------------------------------------------------
DO $$
BEGIN
  IF to_regclass('public.chat_users') IS NOT NULL THEN
    DROP POLICY IF EXISTS "chat_users_select" ON public.chat_users;
    DROP POLICY IF EXISTS "chat_users_select_own" ON public.chat_users;
    DROP POLICY IF EXISTS "chat_users_insert" ON public.chat_users;
    DROP POLICY IF EXISTS "chat_users_update" ON public.chat_users;
    REVOKE ALL ON public.chat_users FROM anon, authenticated;
  END IF;
END $$;

-- 3. storage: documents bucket -------------------------------------------
DO $$
BEGIN
  DROP POLICY IF EXISTS "Allow anonymous uploads" ON storage.objects;
  DROP POLICY IF EXISTS "documents flreew_0" ON storage.objects;
  DROP POLICY IF EXISTS "documents flreew_1" ON storage.objects;
  DROP POLICY IF EXISTS "documents flreew_2" ON storage.objects;
  DROP POLICY IF EXISTS "documents flreew_3" ON storage.objects;

  DROP POLICY IF EXISTS "documents_support_upload" ON storage.objects;
  CREATE POLICY "documents_support_upload" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (
      bucket_id = 'documents'
      AND name LIKE 'support\_%'
      AND position('/' IN name) = 0
    );

  DROP POLICY IF EXISTS "documents_owner_select" ON storage.objects;
  CREATE POLICY "documents_owner_select" ON storage.objects
    FOR SELECT TO authenticated
    USING (
      bucket_id = 'documents'
      AND owner_id = (SELECT auth.uid())::text
    );

  DROP POLICY IF EXISTS "documents_admin_all" ON storage.objects;
  CREATE POLICY "documents_admin_all" ON storage.objects
    FOR ALL TO authenticated
    USING (bucket_id = 'documents' AND (SELECT public.is_admin_email()))
    WITH CHECK (bucket_id = 'documents' AND (SELECT public.is_admin_email()));
EXCEPTION WHEN insufficient_privilege THEN
  RAISE WARNING 'storage.objects politikaları değiştirilemedi (sahiplik): documents bucket. Dashboard Storage > Policies üzerinden uygulayın.';
END $$;

RESET lock_timeout;
