-- F1-ADMIN: yalnız admin@ugurhoca.com admin olarak tanınır.
-- Değişen fonksiyonlar: public.is_admin_email(), public.get_admin_profile_id().
-- Değişen politikalar: profiles_admin_all, documents_update,
-- assignments_admin_write, shared_documents_admin_write,
-- notifications_admin_all, quizzes_admin_write, quiz_questions_admin_write.
-- Politika kaynakları: 20260419220000 + 20260930140000 initplan dönüşümü.
-- is_admin_email gövdesi: 20260907100000; get_admin_profile_id: 20260419230000.
-- Fonksiyon güvenlik modu ve ACL: 20260930120000 korunur (ilk fonksiyon INVOKER).
-- chat_users_admin_all etkin değildir: 20260906120000 tabloyu CASCADE ile sildi.
-- Veri değiştirilmez; etkin tanımlardan yalnız eski admin adresi çıkarılır.

SET lock_timeout = '5s';

CREATE OR REPLACE FUNCTION public.is_admin_email()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT COALESCE(
    (auth.jwt() ->> 'email') = ANY (ARRAY['admin@ugurhoca.com']),
    false
  );
$$;

REVOKE ALL ON FUNCTION public.is_admin_email() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_admin_email() TO authenticated, service_role;

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
    WHERE email IN ('admin@ugurhoca.com')
    LIMIT 1;

    RETURN admin_id;
END;
$$;

REVOKE ALL ON FUNCTION public.get_admin_profile_id() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_admin_profile_id() TO authenticated, service_role;

DROP POLICY IF EXISTS "profiles_admin_all" ON public.profiles;
CREATE POLICY "profiles_admin_all" ON public.profiles
    FOR ALL TO authenticated
    USING (((select auth.jwt()) ->> 'email') = ANY (ARRAY['admin@ugurhoca.com']))
    WITH CHECK (((select auth.jwt()) ->> 'email') = ANY (ARRAY['admin@ugurhoca.com']));

DROP POLICY IF EXISTS "documents_update" ON public.documents;
CREATE POLICY "documents_update" ON public.documents
    FOR UPDATE TO authenticated
    USING (((select auth.jwt()) ->> 'email') = ANY (ARRAY['admin@ugurhoca.com']))
    WITH CHECK (((select auth.jwt()) ->> 'email') = ANY (ARRAY['admin@ugurhoca.com']));

DROP POLICY IF EXISTS "assignments_admin_write" ON public.assignments;
CREATE POLICY "assignments_admin_write" ON public.assignments
    FOR ALL TO authenticated
    USING (((select auth.jwt()) ->> 'email') = ANY (ARRAY['admin@ugurhoca.com']))
    WITH CHECK (((select auth.jwt()) ->> 'email') = ANY (ARRAY['admin@ugurhoca.com']));

DROP POLICY IF EXISTS "shared_documents_admin_write" ON public.shared_documents;
CREATE POLICY "shared_documents_admin_write" ON public.shared_documents
    FOR ALL TO authenticated
    USING (((select auth.jwt()) ->> 'email') = ANY (ARRAY['admin@ugurhoca.com']))
    WITH CHECK (((select auth.jwt()) ->> 'email') = ANY (ARRAY['admin@ugurhoca.com']));

DROP POLICY IF EXISTS "notifications_admin_all" ON public.notifications;
CREATE POLICY "notifications_admin_all" ON public.notifications
    FOR ALL TO authenticated
    USING (((select auth.jwt()) ->> 'email') = ANY (ARRAY['admin@ugurhoca.com']))
    WITH CHECK (((select auth.jwt()) ->> 'email') = ANY (ARRAY['admin@ugurhoca.com']));

DROP POLICY IF EXISTS "quizzes_admin_write" ON public.quizzes;
CREATE POLICY "quizzes_admin_write" ON public.quizzes
    FOR ALL TO authenticated
    USING (((select auth.jwt()) ->> 'email') = ANY (ARRAY['admin@ugurhoca.com']))
    WITH CHECK (((select auth.jwt()) ->> 'email') = ANY (ARRAY['admin@ugurhoca.com']));

DROP POLICY IF EXISTS "quiz_questions_admin_write" ON public.quiz_questions;
CREATE POLICY "quiz_questions_admin_write" ON public.quiz_questions
    FOR ALL TO authenticated
    USING (((select auth.jwt()) ->> 'email') = ANY (ARRAY['admin@ugurhoca.com']))
    WITH CHECK (((select auth.jwt()) ->> 'email') = ANY (ARRAY['admin@ugurhoca.com']));
