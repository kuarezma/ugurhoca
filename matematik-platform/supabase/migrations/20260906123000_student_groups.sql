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

-- Politikalar: Giriş yapmış kullanıcılar okuyabilir (üyeler kendi üyeliklerini), admin yönetir
DROP POLICY IF EXISTS "student_groups_select" ON public.student_groups;
DROP POLICY IF EXISTS "student_groups_all_admin" ON public.student_groups;
DROP POLICY IF EXISTS "student_groups_admin_all" ON public.student_groups;
CREATE POLICY "student_groups_select" ON public.student_groups
  FOR SELECT TO authenticated
  USING (true);
CREATE POLICY "student_groups_admin_all" ON public.student_groups
  FOR ALL TO authenticated
  USING (public.is_admin_email())
  WITH CHECK (public.is_admin_email());

DROP POLICY IF EXISTS "student_group_members_select" ON public.student_group_members;
DROP POLICY IF EXISTS "student_group_members_all_admin" ON public.student_group_members;
DROP POLICY IF EXISTS "student_group_members_admin_all" ON public.student_group_members;
CREATE POLICY "student_group_members_select" ON public.student_group_members
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.is_admin_email());
CREATE POLICY "student_group_members_admin_all" ON public.student_group_members
  FOR ALL TO authenticated
  USING (public.is_admin_email())
  WITH CHECK (public.is_admin_email());

-- Anonim erişimi tamamen kaldır, yalnızca doğrulanmış oturumlara yetki ver (RLS kontrolünde)
REVOKE ALL ON public.student_groups FROM anon;
REVOKE ALL ON public.student_group_members FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.student_groups TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.student_group_members TO authenticated;
