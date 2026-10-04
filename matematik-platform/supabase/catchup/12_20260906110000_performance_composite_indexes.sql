-- catchup: BİREBİR KOPYA — kaynak supabase/migrations/20260906110000_performance_composite_indexes.sql (bu dal)
-- catchup: "-- catchup" ile işaretli satırlar dışında kaynakla aynıdır (verify-copies.sh).
SET lock_timeout = '5s'; -- catchup
-- Performance Composite Indexes for Scalability
-- Ensures fast queries for student progress, quiz histories, and study sessions

-- 1. quiz_results: Index for user's past quizzes sorted by completion date.
-- quiz_results has no created_at column (20260408130000 defines completed_at);
-- the original created_at version failed on every database.
CREATE INDEX IF NOT EXISTS idx_quiz_results_user_created
  ON public.quiz_results(user_id, completed_at DESC);

-- 2. study_sessions: Missing user and created_at indexes
CREATE INDEX IF NOT EXISTS idx_study_sessions_user_id 
  ON public.study_sessions(user_id);

CREATE INDEX IF NOT EXISTS idx_study_sessions_user_created 
  ON public.study_sessions(user_id, created_at DESC);

-- 3. user_mistakes: User's mistakes sorted by saved/updated date
CREATE INDEX IF NOT EXISTS idx_user_mistakes_user_saved 
  ON public.user_mistakes(user_id, saved_at DESC);

-- 4. student_activity_events: Fast querying of student analytics timeline
CREATE INDEX IF NOT EXISTS idx_student_activity_user_created 
  ON public.student_activity_events(user_id, created_at DESC);
