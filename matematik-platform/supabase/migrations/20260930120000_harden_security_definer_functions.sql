-- ==========================================================
-- Supabase advisor sertleştirmesi (T-3/T-4).
--
-- 1. SECURITY DEFINER fonksiyonlar anon'a açıktı. Supabase'in public şeması
--    için varsayılan ACL'i (pg_default_acl) her yeni fonksiyona anon'a
--    AÇIKÇA EXECUTE verir; bu yüzden yalnızca "FROM PUBLIC" yetmez, anon da
--    ayrıca geri alınır (20260907100000 bu nedenle anon'u kapatamamıştı).
-- 2. find_login_email'in ILIKE düşüşü p_display_name'i desen olarak
--    kullanıyordu: anon, p_display_name = '%' göndererek profiles tablosundaki
--    TÜM e-postaları alabiliyordu. Joker karakterler kaçırılır, sonuç 2 satırla
--    sınırlanır (istemci yalnızca 0 / 1 / >1 ayrımını kullanıyor). Düşüş
--    kaldırılmaz: name_normalized'ı NULL olan eski profiller bununla giriş
--    yapıyor.
-- 3. notifications INSERT politikası WITH CHECK (true) idi. Admin eklemeleri
--    notifications_admin_all ile, sunucu işleri service_role ile yapılıyor;
--    öğrenciye kalan meşru akış /api/support-message: kendi kopyası
--    (user_id = kendisi) ve admin gelen kutusuna 'message' (JSON gövdede
--    sender_id = kendisi).
-- 4. archived_game_scores yalnızca service_role arşivi; niyet açık bir
--    politikayla belgelenir.
--
-- Trigger fonksiyonları tetiklenirken EXECUTE yetkisi kontrol edilmez; bu
-- yüzden handle_quiz_result_insert'ten tüm API rollerinin yetkisi alınabilir.
-- ==========================================================

-- --- Trigger fonksiyonu: hiçbir API rolü doğrudan çağıramaz ---------------
REVOKE ALL ON FUNCTION public.handle_quiz_result_insert()
  FROM PUBLIC, anon, authenticated, service_role;

-- --- Yalnızca oturum açmış kullanıcılar ---------------------------------
REVOKE ALL ON FUNCTION public.get_admin_profile_id() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_admin_profile_id() TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.get_game_leaderboard(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_game_leaderboard(text) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.set_game_alias(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.set_game_alias(text) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.submit_game_score(integer, integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.submit_game_score(integer, integer) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.touch_daily_streak() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.touch_daily_streak() TO authenticated, service_role;

-- is_admin_email yalnızca auth.jwt() okur; DEFINER gerektirmez. RLS
-- politikaları (authenticated) çağırdığı için authenticated yetkisi kalır.
ALTER FUNCTION public.is_admin_email() SECURITY INVOKER;
REVOKE ALL ON FUNCTION public.is_admin_email() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_admin_email() TO authenticated, service_role;

-- --- Giriş/kayıt öncesi anon çağrılar -----------------------------------
-- LoginPage ve RegisterPage oturum yokken (anon) çağırır; eski bir oturum
-- kalmışsa istek authenticated rolüyle gelir, o yüzden ikisi de kalır.
CREATE OR REPLACE FUNCTION public.find_login_email(
  p_name_normalized text,
  p_display_name text
)
RETURNS TABLE(email text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF char_length(btrim(coalesce(p_name_normalized, ''))) >= 2 THEN
    RETURN QUERY
    SELECT p.email
    FROM public.profiles p
    WHERE p.name_normalized = p_name_normalized
    LIMIT 2;

    IF FOUND THEN
      RETURN;
    END IF;
  END IF;

  IF char_length(btrim(coalesce(p_display_name, ''))) < 2 THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT p.email
  FROM public.profiles p
  WHERE p.name ILIKE replace(replace(replace(p_display_name, '\', '\\'), '%', '\%'), '_', '\_')
  LIMIT 2;
END;
$$;

REVOKE ALL ON FUNCTION public.find_login_email(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.find_login_email(text, text) TO anon, authenticated, service_role;

REVOKE ALL ON FUNCTION public.profile_exists_for_register(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.profile_exists_for_register(text, text) TO anon, authenticated, service_role;

-- --- notifications: herkese açık INSERT yerine daraltılmış politika ------
DROP POLICY IF EXISTS "notifications_insert_authenticated" ON public.notifications;
DROP POLICY IF EXISTS "notifications_insert_own_or_support" ON public.notifications;

-- CASE, JSON dönüşümünün yalnızca geçerli JSON'da çalışmasını garanti eder;
-- 'sent-message' kopyası düz metin taşıdığı için OR ile dönüşüm hata verebilirdi.
CREATE POLICY "notifications_insert_own_or_support" ON public.notifications
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    OR (
      type = 'message'
      AND user_id = public.get_admin_profile_id()
      AND CASE
        WHEN pg_input_is_valid(message, 'jsonb')
          THEN (message::jsonb ->> 'sender_id') = auth.uid()::text
        ELSE false
      END
    )
  );

-- --- archived_game_scores: yalnızca service_role (RLS'i atlar) ----------
DROP POLICY IF EXISTS "archived_game_scores_no_client_access" ON public.archived_game_scores;
CREATE POLICY "archived_game_scores_no_client_access" ON public.archived_game_scores
  AS RESTRICTIVE
  FOR ALL TO anon, authenticated
  USING (false)
  WITH CHECK (false);
