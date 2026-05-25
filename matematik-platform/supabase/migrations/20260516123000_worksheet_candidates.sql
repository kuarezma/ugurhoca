CREATE TABLE IF NOT EXISTS public.worksheet_candidates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  annual_plan_item_id UUID REFERENCES public.annual_plan_items(id) ON DELETE SET NULL,
  grade INTEGER NOT NULL CHECK (grade BETWEEN 5 AND 12),
  week_start DATE,
  week_end DATE,
  subject TEXT NOT NULL,
  learning_outcome TEXT NOT NULL,
  title TEXT NOT NULL,
  source_name TEXT,
  source_url TEXT NOT NULL,
  file_url TEXT NOT NULL,
  match_score INTEGER NOT NULL DEFAULT 0 CHECK (match_score BETWEEN 0 AND 100),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  rejection_reason TEXT,
  drive_file_id TEXT,
  drive_file_url TEXT,
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT worksheet_candidates_unique_file UNIQUE (grade, learning_outcome, file_url)
);

ALTER TABLE public.worksheet_candidates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "worksheet_candidates_admin_all" ON public.worksheet_candidates;
CREATE POLICY "worksheet_candidates_admin_all" ON public.worksheet_candidates
  FOR ALL TO authenticated
  USING (public.is_admin_email())
  WITH CHECK (public.is_admin_email());

CREATE INDEX IF NOT EXISTS worksheet_candidates_status_created_idx
  ON public.worksheet_candidates (status, created_at DESC);

CREATE INDEX IF NOT EXISTS worksheet_candidates_grade_week_idx
  ON public.worksheet_candidates (grade, week_start, week_end);
