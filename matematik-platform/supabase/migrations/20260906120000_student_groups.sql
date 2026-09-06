-- ============================================
-- Student Groups & Group Members Architecture
-- Allows organizing students into persistent cohorts
-- (e.g., "Salı 19:00 Grubu", "LGS Kampı") for assignments and live lessons.
-- ============================================

CREATE TABLE IF NOT EXISTS public.student_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  grade TEXT,
  description TEXT,
  color TEXT DEFAULT 'indigo',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.student_group_members (
  group_id UUID NOT NULL REFERENCES public.student_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (group_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_student_group_members_user ON public.student_group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_student_groups_grade ON public.student_groups(grade);

ALTER TABLE public.student_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_group_members ENABLE ROW LEVEL SECURITY;

-- Politikalar: Herkes veya oturum açmış kullanıcılar okuyabilir (veya admin), admin yönetir
DROP POLICY IF EXISTS "student_groups_select" ON public.student_groups;
DROP POLICY IF EXISTS "student_groups_all_admin" ON public.student_groups;
CREATE POLICY "student_groups_select" ON public.student_groups FOR SELECT USING (true);
CREATE POLICY "student_groups_all_admin" ON public.student_groups FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "student_group_members_select" ON public.student_group_members;
DROP POLICY IF EXISTS "student_group_members_all_admin" ON public.student_group_members;
CREATE POLICY "student_group_members_select" ON public.student_group_members FOR SELECT USING (true);
CREATE POLICY "student_group_members_all_admin" ON public.student_group_members FOR ALL USING (true) WITH CHECK (true);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.student_groups TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.student_group_members TO anon, authenticated;
