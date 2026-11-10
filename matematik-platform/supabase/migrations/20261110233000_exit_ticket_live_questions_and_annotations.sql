-- Çıkış Bileti (Exit Ticket) gerçek zamanlı sınıf oturumları, Canlı Ders öğrenci soru havuzu,
-- Ödev üzeri kırmızı kalem çizim geri bildirimi ve MEB Ortak Yazılı (açık uçlu / kısa cevaplı) soru sütunları.
BEGIN;
SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '60s';

-- 1. Çıkış Bileti oturum ve yanıt tabloları
-- Öğrenci izolasyonu (site.md): İstemciler tabloyu doğrudan okumaz; sunucu API rotaları
-- diğer öğrencilerin isimlerini sızdırmadan yalnızca oturum sorularını ve anonim dağılımı döner.
CREATE TABLE IF NOT EXISTS public.exit_ticket_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  title text NOT NULL,
  grade integer NOT NULL DEFAULT 8,
  status text NOT NULL DEFAULT 'lobby',
  current_question_index integer NOT NULL DEFAULT 0,
  show_distribution boolean NOT NULL DEFAULT false,
  questions jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_exit_ticket_sessions_code
  ON public.exit_ticket_sessions (code);

CREATE TABLE IF NOT EXISTS public.exit_ticket_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.exit_ticket_sessions(id) ON DELETE CASCADE,
  student_key text NOT NULL,
  student_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  student_name text NOT NULL,
  question_index integer NOT NULL,
  selected_index integer NOT NULL,
  answered_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (session_id, student_key, question_index)
);

CREATE INDEX IF NOT EXISTS idx_exit_ticket_responses_session
  ON public.exit_ticket_responses (session_id);

ALTER TABLE public.exit_ticket_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exit_ticket_responses ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.exit_ticket_sessions FROM PUBLIC, anon;
REVOKE ALL ON public.exit_ticket_responses FROM PUBLIC, anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.exit_ticket_sessions TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.exit_ticket_responses TO authenticated, service_role;

DROP POLICY IF EXISTS exit_ticket_sessions_admin_all ON public.exit_ticket_sessions;
CREATE POLICY exit_ticket_sessions_admin_all ON public.exit_ticket_sessions
  FOR ALL TO authenticated
  USING ((SELECT public.is_admin_email()))
  WITH CHECK ((SELECT public.is_admin_email()));

DROP POLICY IF EXISTS exit_ticket_responses_admin_all ON public.exit_ticket_responses;
CREATE POLICY exit_ticket_responses_admin_all ON public.exit_ticket_responses
  FOR ALL TO authenticated
  USING ((SELECT public.is_admin_email()))
  WITH CHECK ((SELECT public.is_admin_email()));

-- 2. Canlı Ders Öğrenci Soru Havuzu (öğrenci yalnızca kendi sorusunu görür/ekler; öğretmen tümünü yönetir)
CREATE TABLE IF NOT EXISTS public.live_lesson_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id uuid REFERENCES public.live_lessons(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  student_name text NOT NULL,
  topic text NOT NULL,
  difficulty text NOT NULL DEFAULT 'Orta',
  question_text text NOT NULL,
  image_url text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_live_lesson_questions_lesson
  ON public.live_lesson_questions (lesson_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_live_lesson_questions_student
  ON public.live_lesson_questions (student_id, created_at DESC);

ALTER TABLE public.live_lesson_questions ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.live_lesson_questions FROM PUBLIC, anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.live_lesson_questions TO authenticated, service_role;

DROP POLICY IF EXISTS live_lesson_questions_admin_all ON public.live_lesson_questions;
CREATE POLICY live_lesson_questions_admin_all ON public.live_lesson_questions
  FOR ALL TO authenticated
  USING ((SELECT public.is_admin_email()))
  WITH CHECK ((SELECT public.is_admin_email()));

DROP POLICY IF EXISTS live_lesson_questions_student_select_own ON public.live_lesson_questions;
CREATE POLICY live_lesson_questions_student_select_own ON public.live_lesson_questions
  FOR SELECT TO authenticated
  USING (student_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS live_lesson_questions_student_insert_own ON public.live_lesson_questions;
CREATE POLICY live_lesson_questions_student_insert_own ON public.live_lesson_questions
  FOR INSERT TO authenticated
  WITH CHECK (student_id = (SELECT auth.uid()));

-- 3. Ödev teslimlerine öğretmen kırmızı kalem çizim görseli alanı
ALTER TABLE public.assignment_submissions
  ADD COLUMN IF NOT EXISTS annotated_feedback_url text;

-- 4. MEB Ortak Yazılı uyumu: quiz_questions için açık uçlu ve kısa cevaplı soru alanları
ALTER TABLE public.quiz_questions
  ADD COLUMN IF NOT EXISTS question_type text DEFAULT 'multiple_choice',
  ADD COLUMN IF NOT EXISTS expected_answer text,
  ADD COLUMN IF NOT EXISTS rubric text[];

COMMIT;
