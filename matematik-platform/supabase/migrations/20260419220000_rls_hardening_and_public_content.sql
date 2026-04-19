-- ========================================================
-- RLS sıkılaştırma + içeriklerin anon okunabilir olması
-- Kural:
--   - Yüklenen içerikler (documents/assignments/shared_documents/
--     announcements/quizzes/quiz_questions/comments) anon için SELECT açık
--   - Yazma işlemleri yalnızca admin
--   - game_scores (oyun) ve notifications (mesaj) yazma yalnızca authenticated
--   - Kişisel tablolar (notes/study_sessions/...) kendi sahibine
-- ========================================================

-- ========================================================
-- profiles
-- ========================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_all" ON public.profiles;
CREATE POLICY "profiles_select_all" ON public.profiles
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "profiles_insert_self" ON public.profiles;
CREATE POLICY "profiles_insert_self" ON public.profiles
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_self" ON public.profiles;
CREATE POLICY "profiles_update_self" ON public.profiles
    FOR UPDATE TO authenticated
    USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_admin_all" ON public.profiles;
CREATE POLICY "profiles_admin_all" ON public.profiles
    FOR ALL TO authenticated
    USING ((auth.jwt() ->> 'email') = ANY (ARRAY['admin@ugurhoca.com','admin@matematiklab.com']))
    WITH CHECK ((auth.jwt() ->> 'email') = ANY (ARRAY['admin@ugurhoca.com','admin@matematiklab.com']));

-- ========================================================
-- documents: RLS aç, UPDATE policy'si ekle
-- ========================================================
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "documents_update" ON public.documents;
CREATE POLICY "documents_update" ON public.documents
    FOR UPDATE TO authenticated
    USING ((auth.jwt() ->> 'email') = ANY (ARRAY['admin@ugurhoca.com','admin@matematiklab.com']))
    WITH CHECK ((auth.jwt() ->> 'email') = ANY (ARRAY['admin@ugurhoca.com','admin@matematiklab.com']));

-- ========================================================
-- assignments: herkes okur, sadece admin yazar
-- ========================================================
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "assignments_select" ON public.assignments;
DROP POLICY IF EXISTS "assignments_insert" ON public.assignments;
DROP POLICY IF EXISTS "assignments_delete" ON public.assignments;
DROP POLICY IF EXISTS "assignments_update" ON public.assignments;
DROP POLICY IF EXISTS "assignments_admin_write" ON public.assignments;

CREATE POLICY "assignments_select" ON public.assignments
    FOR SELECT USING (true);

CREATE POLICY "assignments_admin_write" ON public.assignments
    FOR ALL TO authenticated
    USING ((auth.jwt() ->> 'email') = ANY (ARRAY['admin@ugurhoca.com','admin@matematiklab.com']))
    WITH CHECK ((auth.jwt() ->> 'email') = ANY (ARRAY['admin@ugurhoca.com','admin@matematiklab.com']));

-- ========================================================
-- shared_documents: herkes okur, sadece admin yazar
-- ========================================================
ALTER TABLE public.shared_documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "shared_documents_select" ON public.shared_documents;
DROP POLICY IF EXISTS "shared_documents_insert" ON public.shared_documents;
DROP POLICY IF EXISTS "shared_documents_admin_write" ON public.shared_documents;

CREATE POLICY "shared_documents_select" ON public.shared_documents
    FOR SELECT USING (true);

CREATE POLICY "shared_documents_admin_write" ON public.shared_documents
    FOR ALL TO authenticated
    USING ((auth.jwt() ->> 'email') = ANY (ARRAY['admin@ugurhoca.com','admin@matematiklab.com']))
    WITH CHECK ((auth.jwt() ->> 'email') = ANY (ARRAY['admin@ugurhoca.com','admin@matematiklab.com']));

-- ========================================================
-- comments: kendi kullanıcı id'sine bağla
-- ========================================================
DROP POLICY IF EXISTS "comments_insert" ON public.comments;
CREATE POLICY "comments_insert" ON public.comments
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "comments_update_own" ON public.comments;
CREATE POLICY "comments_update_own" ON public.comments
    FOR UPDATE TO authenticated
    USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "comments_delete_own" ON public.comments;
CREATE POLICY "comments_delete_own" ON public.comments
    FOR DELETE TO authenticated
    USING (auth.uid() = user_id);

-- ========================================================
-- notifications: duplicate policy temizlik + authenticated yazma
-- ========================================================
DROP POLICY IF EXISTS "notifications_admin_insert" ON public.notifications;
DROP POLICY IF EXISTS "notifications_insert" ON public.notifications;
DROP POLICY IF EXISTS "notifications_insert_all" ON public.notifications;
DROP POLICY IF EXISTS "notifications_select" ON public.notifications;
DROP POLICY IF EXISTS "notifications_update" ON public.notifications;
DROP POLICY IF EXISTS "notifications_select_own" ON public.notifications;
DROP POLICY IF EXISTS "notifications_update_own" ON public.notifications;
DROP POLICY IF EXISTS "notifications_own_select" ON public.notifications;
DROP POLICY IF EXISTS "notifications_own_update" ON public.notifications;
DROP POLICY IF EXISTS "notifications_delete_own" ON public.notifications;
DROP POLICY IF EXISTS "notifications_own_delete" ON public.notifications;
DROP POLICY IF EXISTS "notifications_admin_all" ON public.notifications;
DROP POLICY IF EXISTS "notifications_insert_authenticated" ON public.notifications;

CREATE POLICY "notifications_insert_authenticated" ON public.notifications
    FOR INSERT TO authenticated
    WITH CHECK (true);

CREATE POLICY "notifications_own_select" ON public.notifications
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "notifications_own_update" ON public.notifications
    FOR UPDATE TO authenticated
    USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "notifications_own_delete" ON public.notifications
    FOR DELETE TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "notifications_admin_all" ON public.notifications
    FOR ALL TO authenticated
    USING ((auth.jwt() ->> 'email') = ANY (ARRAY['admin@ugurhoca.com','admin@matematiklab.com']))
    WITH CHECK ((auth.jwt() ->> 'email') = ANY (ARRAY['admin@ugurhoca.com','admin@matematiklab.com']));

-- ========================================================
-- quizzes & quiz_questions: herkes okur, sadece admin yazar
-- ========================================================
DROP POLICY IF EXISTS "quizzes_insert" ON public.quizzes;
DROP POLICY IF EXISTS "quizzes_update" ON public.quizzes;
DROP POLICY IF EXISTS "quizzes_delete" ON public.quizzes;
DROP POLICY IF EXISTS "quizzes_admin_write" ON public.quizzes;

CREATE POLICY "quizzes_admin_write" ON public.quizzes
    FOR ALL TO authenticated
    USING ((auth.jwt() ->> 'email') = ANY (ARRAY['admin@ugurhoca.com','admin@matematiklab.com']))
    WITH CHECK ((auth.jwt() ->> 'email') = ANY (ARRAY['admin@ugurhoca.com','admin@matematiklab.com']));

DROP POLICY IF EXISTS "quiz_questions_insert" ON public.quiz_questions;
DROP POLICY IF EXISTS "quiz_questions_update" ON public.quiz_questions;
DROP POLICY IF EXISTS "quiz_questions_delete" ON public.quiz_questions;
DROP POLICY IF EXISTS "quiz_questions_admin_write" ON public.quiz_questions;

CREATE POLICY "quiz_questions_admin_write" ON public.quiz_questions
    FOR ALL TO authenticated
    USING ((auth.jwt() ->> 'email') = ANY (ARRAY['admin@ugurhoca.com','admin@matematiklab.com']))
    WITH CHECK ((auth.jwt() ->> 'email') = ANY (ARRAY['admin@ugurhoca.com','admin@matematiklab.com']));

-- ========================================================
-- chat_users: kendi kaydına bağla
-- ========================================================
DROP POLICY IF EXISTS "chat_users_insert" ON public.chat_users;
CREATE POLICY "chat_users_insert" ON public.chat_users
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "chat_users_update" ON public.chat_users;
CREATE POLICY "chat_users_update" ON public.chat_users
    FOR UPDATE TO authenticated
    USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- ========================================================
-- global_leaderboard view: SECURITY DEFINER kaldır
-- ========================================================
DROP VIEW IF EXISTS public.global_leaderboard;
CREATE VIEW public.global_leaderboard
WITH (security_invoker = true) AS
SELECT user_id,
       user_name,
       sum(score) AS total_score
FROM public.game_scores
GROUP BY user_id, user_name
ORDER BY sum(score) DESC
LIMIT 50;

-- ========================================================
-- Fonksiyon search_path fix
-- ========================================================
ALTER FUNCTION public.handle_quiz_result_insert() SET search_path = public;
