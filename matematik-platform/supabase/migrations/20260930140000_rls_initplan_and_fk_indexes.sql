-- ==========================================================
-- Supabase performans advisor'ı (T-9).
--
-- 1. auth_rls_initplan: politikalardaki çıplak auth.uid() / auth.jwt() /
--    auth.role() çağrıları satır başına yeniden değerlendirilir. (select ...)
--    içine alınınca Postgres bunu sorgu başına bir kez çalışan InitPlan'e
--    çevirir; anlam değişmez. Politikalar tek tek yeniden yazılmak yerine
--    pg_policies üzerinden dönüştürülür, böylece metinleri elle kopyalanırken
--    kayma riski olmaz. Zaten sarılmış çağrılar ("SELECT auth.uid()")
--    eşleşmez, migration tekrar çalıştırılabilir.
-- 2. unindexed_foreign_keys: advisor'ın listelediği 12 foreign key'e indeks.
--
-- multiple_permissive_policies bilinçli olarak kapsam dışı: birleştirmek
-- politika anlamını değiştirebilir ve ayrı bir inceleme ister.
-- ==========================================================

DO $$
DECLARE
  pat constant text := '(?<!select )auth\.(uid|jwt|role)\(\)';
  r record;
  stmt text;
BEGIN
  FOR r IN
    SELECT tablename, policyname, qual, with_check
    FROM pg_policies
    WHERE schemaname = 'public'
      AND (qual ~* pat OR with_check ~* pat)
  LOOP
    stmt := format('ALTER POLICY %I ON public.%I', r.policyname, r.tablename);
    IF r.qual IS NOT NULL THEN
      stmt := stmt || format(' USING (%s)', regexp_replace(r.qual, pat, '(select auth.\1())', 'gi'));
    END IF;
    IF r.with_check IS NOT NULL THEN
      stmt := stmt || format(' WITH CHECK (%s)', regexp_replace(r.with_check, pat, '(select auth.\1())', 'gi'));
    END IF;
    EXECUTE stmt;
  END LOOP;
END;
$$;

CREATE INDEX IF NOT EXISTS archived_game_scores_user_id_idx ON public.archived_game_scores (user_id);
CREATE INDEX IF NOT EXISTS assignment_submissions_assignment_id_idx ON public.assignment_submissions (assignment_id);
CREATE INDEX IF NOT EXISTS assignment_submissions_student_id_idx ON public.assignment_submissions (student_id);
CREATE INDEX IF NOT EXISTS live_lesson_chat_messages_user_id_idx ON public.live_lesson_chat_messages (user_id);
CREATE INDEX IF NOT EXISTS live_lesson_events_user_id_idx ON public.live_lesson_events (user_id);
CREATE INDEX IF NOT EXISTS live_lesson_participants_user_id_idx ON public.live_lesson_participants (user_id);
CREATE INDEX IF NOT EXISTS live_lessons_created_by_idx ON public.live_lessons (created_by);
CREATE INDEX IF NOT EXISTS note_categories_user_id_idx ON public.note_categories (user_id);
CREATE INDEX IF NOT EXISTS notes_user_id_idx ON public.notes (user_id);
CREATE INDEX IF NOT EXISTS study_sessions_user_id_idx ON public.study_sessions (user_id);
CREATE INDEX IF NOT EXISTS worksheet_candidates_annual_plan_item_id_idx ON public.worksheet_candidates (annual_plan_item_id);
CREATE INDEX IF NOT EXISTS worksheet_candidates_reviewed_by_idx ON public.worksheet_candidates (reviewed_by);
