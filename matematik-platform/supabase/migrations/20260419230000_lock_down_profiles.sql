-- ========================================================
-- profiles erişimini sıkılaştır:
--   * Öğrenci sadece kendi profilini görür
--   * Admin tüm profilleri görür (zaten profiles_admin_all ile)
--   * Giriş/kayıt/destek akışları için güvenli RPC fonksiyonları
-- ========================================================

-- Eski geniş okuma politikasını kaldır
DROP POLICY IF EXISTS "profiles_select_all" ON public.profiles;

-- Kendi profilini gören kullanıcılar (authenticated)
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own" ON public.profiles
    FOR SELECT TO authenticated
    USING (auth.uid() = id);

-- ========================================================
-- Giriş sayfası için RPC
-- Kullanıcı adı + normalize edilmiş ad ile e-postayı döndürür.
-- Anonim olarak çağrılabilir (giriş öncesi).
-- Yalnızca email alanı döner, diğer profil verisi sızdırmaz.
-- ========================================================
CREATE OR REPLACE FUNCTION public.find_login_email(
    p_name_normalized TEXT,
    p_display_name TEXT
) RETURNS TABLE(email TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT p.email
    FROM public.profiles p
    WHERE p.name_normalized = p_name_normalized;

    IF NOT FOUND THEN
        RETURN QUERY
        SELECT p.email
        FROM public.profiles p
        WHERE p.name ILIKE p_display_name;
    END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.find_login_email(TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.find_login_email(TEXT, TEXT) TO anon, authenticated;

-- ========================================================
-- Kayıt sayfası için RPC
-- Verilen e-posta veya normalize edilmiş ad zaten kayıtlı mı?
-- Dönüş değeri: 'email_exists' | 'name_exists' | null
-- ========================================================
CREATE OR REPLACE FUNCTION public.profile_exists_for_register(
    p_email TEXT,
    p_name_normalized TEXT
) RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF EXISTS (SELECT 1 FROM public.profiles WHERE email = p_email) THEN
        RETURN 'email_exists';
    END IF;

    IF EXISTS (SELECT 1 FROM public.profiles WHERE name_normalized = p_name_normalized) THEN
        RETURN 'name_exists';
    END IF;

    RETURN NULL;
END;
$$;

REVOKE ALL ON FUNCTION public.profile_exists_for_register(TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.profile_exists_for_register(TEXT, TEXT) TO anon, authenticated;

-- ========================================================
-- Destek mesajı için admin id RPC
-- ========================================================
CREATE OR REPLACE FUNCTION public.get_admin_profile_id()
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    admin_id UUID;
BEGIN
    SELECT id INTO admin_id
    FROM public.profiles
    WHERE email IN ('admin@ugurhoca.com', 'admin@matematiklab.com')
    LIMIT 1;

    RETURN admin_id;
END;
$$;

REVOKE ALL ON FUNCTION public.get_admin_profile_id() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_admin_profile_id() TO authenticated;

-- ========================================================
-- chat_users tablosu TC kimlik bilgisi içerdiği için
-- herkese açık SELECT izni kaldırılır.
-- ========================================================
DROP POLICY IF EXISTS "chat_users_select" ON public.chat_users;
CREATE POLICY "chat_users_select_own" ON public.chat_users
    FOR SELECT TO authenticated
    USING (auth.uid() = id);

DROP POLICY IF EXISTS "chat_users_admin_all" ON public.chat_users;
CREATE POLICY "chat_users_admin_all" ON public.chat_users
    FOR ALL TO authenticated
    USING ((auth.jwt() ->> 'email') = ANY (ARRAY['admin@ugurhoca.com','admin@matematiklab.com']))
    WITH CHECK ((auth.jwt() ->> 'email') = ANY (ARRAY['admin@ugurhoca.com','admin@matematiklab.com']));
