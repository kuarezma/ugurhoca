CREATE TABLE IF NOT EXISTS public.annual_plan_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  grade INTEGER NOT NULL CHECK (grade BETWEEN 5 AND 12),
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  subject TEXT NOT NULL,
  learning_outcome TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT annual_plan_items_week_range_check CHECK (week_start <= week_end),
  CONSTRAINT annual_plan_items_unique_week_outcome UNIQUE (grade, week_start, learning_outcome)
);

ALTER TABLE public.annual_plan_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "annual_plan_items_admin_all" ON public.annual_plan_items;
CREATE POLICY "annual_plan_items_admin_all" ON public.annual_plan_items
  FOR ALL TO authenticated
  USING (public.is_admin_email())
  WITH CHECK (public.is_admin_email());

CREATE INDEX IF NOT EXISTS annual_plan_items_grade_week_idx
  ON public.annual_plan_items (grade, week_start, week_end);
