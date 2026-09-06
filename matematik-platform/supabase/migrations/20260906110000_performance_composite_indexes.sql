-- Performance Composite Indexes for Scalability
-- Ensures fast queries for student progress, quiz histories, and study sessions

-- 1. quiz_results: Index for user's past quizzes sorted by creation date
CREATE INDEX IF NOT EXISTS idx_quiz_results_user_created 
  ON public.quiz_results(user_id, created_at DESC);

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
