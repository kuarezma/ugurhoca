-- ==========================================================
-- Denetim bulgusu H-04: admin e-postası üç ayrı yerde, üç farklı listeyle
-- tanımlanmıştı:
--   1. src/lib/admin.ts (uygulama)     → admin@ugurhoca.com + ADMIN_EXTRA_EMAILS
--   2. get_admin_profile_id() (SQL)    → admin@ugurhoca.com, admin@matematiklab.com
--   3. is_admin_email() (SQL)          → yalnızca admin@ugurhoca.com
--
-- is_admin_email(), game_aliases ve student_groups gibi daha yeni RLS
-- politikalarının dayandığı ortak fonksiyon; ama admin@matematiklab.com'u
-- admin olarak tanımıyordu — get_admin_profile_id() ile ÇELİŞİYORDU. Bu
-- migration yalnızca is_admin_email()'i diğer ikisiyle tutarlı hale getirir.
--
-- KAPSAM DIŞI (bilinçli): profiles/chat_users/announcements gibi tablolardaki
-- 20+ RLS politikası admin e-postasını is_admin_email() ÇAĞIRMADAN, doğrudan
-- kendi içine gömülü olarak kontrol ediyor (bkz. 20260411110000,
-- 20260419220000, 20260419230000). Bunların tümünü tek bir fonksiyona
-- yönlendirmek daha büyük, canlı veritabanına karşı test edilmeden
-- uygulanması riskli bir değişiklik — bilerek bu migration'ın dışında
-- bırakıldı. Uygulama tarafında ADMIN_EXTRA_EMAILS ile eklenen bir admin,
-- API rotalarında yetkili sayılsa da bu politikaların hiçbirinde tanınmaz;
-- bu, ayrı bir onay turu gerektiren bir sonraki adımdır.
-- ==========================================================

CREATE OR REPLACE FUNCTION public.is_admin_email()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (auth.jwt() ->> 'email') = ANY (ARRAY['admin@ugurhoca.com', 'admin@matematiklab.com']),
    false
  );
$$;

REVOKE ALL ON FUNCTION public.is_admin_email() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin_email() TO authenticated;
