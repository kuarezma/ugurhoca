-- Canli policy'leri tek admin hesabina indir.

DROP POLICY IF EXISTS "quizzes_insert" ON public.quizzes;
CREATE POLICY "quizzes_insert" ON public.quizzes FOR INSERT WITH CHECK (
  (SELECT email FROM auth.users WHERE id = auth.uid()) IN ('admin@ugurhoca.com')
);

DROP POLICY IF EXISTS "quizzes_update" ON public.quizzes;
CREATE POLICY "quizzes_update" ON public.quizzes FOR UPDATE USING (
  (SELECT email FROM auth.users WHERE id = auth.uid()) IN ('admin@ugurhoca.com')
);

DROP POLICY IF EXISTS "quizzes_delete" ON public.quizzes;
CREATE POLICY "quizzes_delete" ON public.quizzes FOR DELETE USING (
  (SELECT email FROM auth.users WHERE id = auth.uid()) IN ('admin@ugurhoca.com')
);

DROP POLICY IF EXISTS "quiz_questions_insert" ON public.quiz_questions;
CREATE POLICY "quiz_questions_insert" ON public.quiz_questions FOR INSERT WITH CHECK (
  (SELECT email FROM auth.users WHERE id = auth.uid()) IN ('admin@ugurhoca.com')
);

DROP POLICY IF EXISTS "quiz_questions_update" ON public.quiz_questions;
CREATE POLICY "quiz_questions_update" ON public.quiz_questions FOR UPDATE USING (
  (SELECT email FROM auth.users WHERE id = auth.uid()) IN ('admin@ugurhoca.com')
);

DROP POLICY IF EXISTS "quiz_questions_delete" ON public.quiz_questions;
CREATE POLICY "quiz_questions_delete" ON public.quiz_questions FOR DELETE USING (
  (SELECT email FROM auth.users WHERE id = auth.uid()) IN ('admin@ugurhoca.com')
);

DROP POLICY IF EXISTS "admin_rooms_all" ON public.chat_rooms;
CREATE POLICY "admin_rooms_all" ON public.chat_rooms FOR ALL USING (
  (SELECT email FROM auth.users WHERE id = auth.uid()) IN ('admin@ugurhoca.com')
);

DROP POLICY IF EXISTS "admin_members_all" ON public.chat_room_members;
CREATE POLICY "admin_members_all" ON public.chat_room_members FOR ALL USING (
  (SELECT email FROM auth.users WHERE id = auth.uid()) IN ('admin@ugurhoca.com')
);

DROP POLICY IF EXISTS "admin_messages_all" ON public.chat_messages;
CREATE POLICY "admin_messages_all" ON public.chat_messages FOR ALL USING (
  (SELECT email FROM auth.users WHERE id = auth.uid()) IN ('admin@ugurhoca.com')
);

DROP POLICY IF EXISTS "submissions_admin_all" ON public.assignment_submissions;
CREATE POLICY "submissions_admin_all" ON public.assignment_submissions FOR ALL USING (
  auth.jwt() ->> 'email' IN ('admin@ugurhoca.com')
);

DROP POLICY IF EXISTS "submissions_admin_select" ON storage.objects;
CREATE POLICY "submissions_admin_select" ON storage.objects FOR SELECT USING (
  bucket_id = 'submissions' AND
  (auth.jwt() ->> 'email' IN ('admin@ugurhoca.com'))
);

DROP POLICY IF EXISTS "study_sessions_admin_all" ON public.study_sessions;
CREATE POLICY "study_sessions_admin_all" ON public.study_sessions FOR ALL USING (
  auth.jwt() ->> 'email' IN ('admin@ugurhoca.com')
);

DROP POLICY IF EXISTS "user_progress_admin_all" ON public.user_progress;
CREATE POLICY "user_progress_admin_all" ON public.user_progress FOR ALL USING (
  auth.jwt() ->> 'email' IN ('admin@ugurhoca.com')
);

DROP POLICY IF EXISTS "study_goals_admin_all" ON public.study_goals;
CREATE POLICY "study_goals_admin_all" ON public.study_goals FOR ALL USING (
  auth.jwt() ->> 'email' IN ('admin@ugurhoca.com')
);

DROP POLICY IF EXISTS "user_badges_admin_all" ON public.user_badges;
CREATE POLICY "user_badges_admin_all" ON public.user_badges FOR ALL USING (
  auth.jwt() ->> 'email' IN ('admin@ugurhoca.com')
);

DROP POLICY IF EXISTS "announcements_insert" ON public.announcements;
CREATE POLICY "announcements_insert" ON public.announcements FOR INSERT WITH CHECK (
  (SELECT email FROM auth.users WHERE id = auth.uid()) IN ('admin@ugurhoca.com')
);

DROP POLICY IF EXISTS "announcements_delete" ON public.announcements;
CREATE POLICY "announcements_delete" ON public.announcements FOR DELETE USING (
  (SELECT email FROM auth.users WHERE id = auth.uid()) IN ('admin@ugurhoca.com')
);

DROP POLICY IF EXISTS "announcements_update" ON public.announcements;
CREATE POLICY "announcements_update" ON public.announcements FOR UPDATE USING (
  (SELECT email FROM auth.users WHERE id = auth.uid()) IN ('admin@ugurhoca.com')
);

DROP POLICY IF EXISTS "documents_insert" ON public.documents;
CREATE POLICY "documents_insert" ON public.documents FOR INSERT WITH CHECK (
  (SELECT email FROM auth.users WHERE id = auth.uid()) IN ('admin@ugurhoca.com')
);

DROP POLICY IF EXISTS "documents_delete" ON public.documents;
CREATE POLICY "documents_delete" ON public.documents FOR DELETE USING (
  (SELECT email FROM auth.users WHERE id = auth.uid()) IN ('admin@ugurhoca.com')
);
