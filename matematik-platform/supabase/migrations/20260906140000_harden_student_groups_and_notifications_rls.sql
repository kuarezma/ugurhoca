-- ==========================================================
-- Security Hardening: student_groups, student_group_members & notifications RLS
-- Closes anonymous write holes and limits notification insertion.
-- ==========================================================

-- 1. student_groups RLS
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'student_groups') THEN
    ALTER TABLE public.student_groups ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "student_groups_all_admin" ON public.student_groups;
    DROP POLICY IF EXISTS "student_groups_select" ON public.student_groups;
    DROP POLICY IF EXISTS "student_groups_admin_all" ON public.student_groups;

    CREATE POLICY "student_groups_select" ON public.student_groups
      FOR SELECT TO authenticated
      USING (true);

    CREATE POLICY "student_groups_admin_all" ON public.student_groups
      FOR ALL TO authenticated
      USING (public.is_admin_email())
      WITH CHECK (public.is_admin_email());

    REVOKE ALL ON public.student_groups FROM anon;
    GRANT SELECT, INSERT, UPDATE, DELETE ON public.student_groups TO authenticated;
  END IF;
END $$;

-- 2. student_group_members RLS
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'student_group_members') THEN
    ALTER TABLE public.student_group_members ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "student_group_members_all_admin" ON public.student_group_members;
    DROP POLICY IF EXISTS "student_group_members_select" ON public.student_group_members;
    DROP POLICY IF EXISTS "student_group_members_admin_all" ON public.student_group_members;

    CREATE POLICY "student_group_members_select" ON public.student_group_members
      FOR SELECT TO authenticated
      USING (auth.uid() = user_id OR public.is_admin_email());

    CREATE POLICY "student_group_members_admin_all" ON public.student_group_members
      FOR ALL TO authenticated
      USING (public.is_admin_email())
      WITH CHECK (public.is_admin_email());

    REVOKE ALL ON public.student_group_members FROM anon;
    GRANT SELECT, INSERT, UPDATE, DELETE ON public.student_group_members TO authenticated;
  END IF;
END $$;

-- 3. notifications INSERT RLS hardening (Prevent cross-user notification spam)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'notifications') THEN
    ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "notifications_insert_authenticated" ON public.notifications;

    CREATE POLICY "notifications_insert_authenticated" ON public.notifications
      FOR INSERT TO authenticated
      WITH CHECK (user_id = auth.uid() OR public.is_admin_email());
  END IF;
END $$;
