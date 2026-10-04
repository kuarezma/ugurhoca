-- catchup: BİREBİR KOPYA — kaynak supabase/migrations/20261004130500_single_admin_email_remaining.sql (bu dal)
-- catchup: "-- catchup" ile işaretli satırlar dışında kaynakla aynıdır (verify-copies.sh).
-- ==========================================================
-- F1-ADMIN (devam): 20261004130000'in kapsamadığı, production'da
-- admin@matematiklab.com içeren politikalar.
--
-- Kaynak: production pg_policies (2026-10-04 salt okunur denetim). Bu
-- politikaların production tanımı repo zincirindeki hiçbir dosyayla aynı
-- değil (dashboard'dan iki e-postalı sürüm uygulanmış). Her politika
-- production'daki etkin tanımıyla birebir yeniden kurulur; tek fark dizide
-- admin@matematiklab.com öğesinin olmamasıdır. Rol, komut, permissive/
-- restrictive ve ifade biçimi (auth.users alt sorgusu ya da auth.jwt())
-- korunur.
--
-- Bilinen, bilerek korunan davranış: announcements_* ve documents_insert/
-- delete auth.users'ı alt sorguyla okur; authenticated rolünün auth.users
-- üzerinde SELECT yetkisi yoktur. Bu politikalar istemci (authenticated)
-- yazmalarında "permission denied for table users" verir; bu tablolara
-- yazma yalnız service_role rotalarıyla çalışır. Biçim değiştirmek ayrı karar.
--
-- chat_users_admin_all: 20261004170000 ve 20261004150100 chat_users'ın
-- authenticated yetkisini alır; politika yalnızca tanım tutarlılığı için
-- güncellenir.
-- storage.objects politikası, postgres rolü storage.objects sahibi
-- olmadığında (Supabase barındırma) yetki hatası verebilir; hata uyarıya
-- çevrilir, diğer adımlar etkilenmez. Sonrası doğrulama SELECT'i kontrol eder.
--
-- Veri değiştirilmez. Tekrar çalıştırılabilir.
-- ==========================================================

SET lock_timeout = '5s';

DO $$
BEGIN
  IF to_regclass('public.announcements') IS NOT NULL THEN
    DROP POLICY IF EXISTS "announcements_insert" ON public.announcements;
    CREATE POLICY "announcements_insert" ON public.announcements
      AS PERMISSIVE FOR INSERT TO public
      WITH CHECK (
        ((SELECT users.email FROM auth.users WHERE users.id = (SELECT auth.uid() AS uid)))::text
          = ANY (ARRAY[('admin@ugurhoca.com'::character varying)::text])
      );

    DROP POLICY IF EXISTS "announcements_update" ON public.announcements;
    CREATE POLICY "announcements_update" ON public.announcements
      AS PERMISSIVE FOR UPDATE TO public
      USING (
        ((SELECT users.email FROM auth.users WHERE users.id = (SELECT auth.uid() AS uid)))::text
          = ANY (ARRAY[('admin@ugurhoca.com'::character varying)::text])
      );

    DROP POLICY IF EXISTS "announcements_delete" ON public.announcements;
    CREATE POLICY "announcements_delete" ON public.announcements
      AS PERMISSIVE FOR DELETE TO public
      USING (
        ((SELECT users.email FROM auth.users WHERE users.id = (SELECT auth.uid() AS uid)))::text
          = ANY (ARRAY[('admin@ugurhoca.com'::character varying)::text])
      );
  END IF;

  IF to_regclass('public.documents') IS NOT NULL THEN
    DROP POLICY IF EXISTS "documents_insert" ON public.documents;
    CREATE POLICY "documents_insert" ON public.documents
      AS PERMISSIVE FOR INSERT TO public
      WITH CHECK (
        ((SELECT users.email FROM auth.users WHERE users.id = (SELECT auth.uid() AS uid)))::text
          = ANY (ARRAY[('admin@ugurhoca.com'::character varying)::text])
      );

    DROP POLICY IF EXISTS "documents_delete" ON public.documents;
    CREATE POLICY "documents_delete" ON public.documents
      AS PERMISSIVE FOR DELETE TO public
      USING (
        ((SELECT users.email FROM auth.users WHERE users.id = (SELECT auth.uid() AS uid)))::text
          = ANY (ARRAY[('admin@ugurhoca.com'::character varying)::text])
      );
  END IF;

  IF to_regclass('public.assignment_submissions') IS NOT NULL THEN
    DROP POLICY IF EXISTS "submissions_admin_all" ON public.assignment_submissions;
    CREATE POLICY "submissions_admin_all" ON public.assignment_submissions
      AS PERMISSIVE FOR ALL TO public
      USING (((SELECT auth.jwt() AS jwt) ->> 'email'::text) = ANY (ARRAY['admin@ugurhoca.com'::text]));
  END IF;

  IF to_regclass('public.user_badges') IS NOT NULL THEN
    DROP POLICY IF EXISTS "user_badges_admin_all" ON public.user_badges;
    CREATE POLICY "user_badges_admin_all" ON public.user_badges
      AS PERMISSIVE FOR ALL TO public
      USING (((SELECT auth.jwt() AS jwt) ->> 'email'::text) = ANY (ARRAY['admin@ugurhoca.com'::text]));
  END IF;

  IF to_regclass('public.chat_users') IS NOT NULL THEN
    DROP POLICY IF EXISTS "chat_users_admin_all" ON public.chat_users;
    CREATE POLICY "chat_users_admin_all" ON public.chat_users
      AS PERMISSIVE FOR ALL TO authenticated
      USING (((SELECT auth.jwt() AS jwt) ->> 'email'::text) = ANY (ARRAY['admin@ugurhoca.com'::text]))
      WITH CHECK (((SELECT auth.jwt() AS jwt) ->> 'email'::text) = ANY (ARRAY['admin@ugurhoca.com'::text]));
  END IF;
END $$;

DO $$
BEGIN
  DROP POLICY IF EXISTS "submissions_admin_select" ON storage.objects;
  CREATE POLICY "submissions_admin_select" ON storage.objects
    AS PERMISSIVE FOR SELECT TO public
    USING ((bucket_id = 'submissions'::text) AND ((auth.jwt() ->> 'email'::text) = ANY (ARRAY['admin@ugurhoca.com'::text])));
EXCEPTION WHEN insufficient_privilege THEN
  RAISE WARNING 'storage.objects politikası değiştirilemedi (sahiplik): submissions_admin_select. Dashboard Storage > Policies üzerinden uygulayın.';
END $$;

RESET lock_timeout;
