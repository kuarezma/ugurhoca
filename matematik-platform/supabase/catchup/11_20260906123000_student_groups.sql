-- catchup: DÜZELTİLMİŞ KOPYA — kaynak supabase/migrations/20260906123000_student_groups.sql
-- catchup: Production durumu: student_groups ve student_group_members YOK.
-- catchup: Fark 1: politikalar initplan kalıbıyla ((SELECT auth.uid()), (SELECT public.is_admin_email())).
-- catchup: Fark 2: student_group_members.user_id → auth.users FK'si eklenir. Zincirde bunu
-- catchup:         20260907090000 (adım 6) ekler; o migration production'da tablo yokken
-- catchup:         çalıştığı için FK hiç kurulmadı. Tablo yeni ve boş olduğundan
-- catchup:         20260907090000'deki öksüz satır DELETE'i gerekmez ve ALINMADI.
-- catchup: Fark 3: 20260906140000'in grup bölümü kaynakla aynı politikaları kurar; o dosya
-- catchup:         çalıştırılmaz (bildirim bölümü 20260930120000 ile geçersiz).
-- catchup: student_groups_select USING (true) kaynakla aynı; adım 14 (20261004150100) daraltır.
-- catchup: Idempotent; veri yazmaz.
SET lock_timeout = '5s';

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

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.student_group_members'::regclass
      AND conname = 'student_group_members_user_id_fkey'
  ) THEN
    ALTER TABLE public.student_group_members
      ADD CONSTRAINT student_group_members_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_student_group_members_user ON public.student_group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_student_groups_grade ON public.student_groups(grade);

ALTER TABLE public.student_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_group_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "student_groups_select" ON public.student_groups;
DROP POLICY IF EXISTS "student_groups_all_admin" ON public.student_groups;
DROP POLICY IF EXISTS "student_groups_admin_all" ON public.student_groups;
CREATE POLICY "student_groups_select" ON public.student_groups
  FOR SELECT TO authenticated
  USING (true);
CREATE POLICY "student_groups_admin_all" ON public.student_groups
  FOR ALL TO authenticated
  USING ((SELECT public.is_admin_email()))
  WITH CHECK ((SELECT public.is_admin_email()));

DROP POLICY IF EXISTS "student_group_members_select" ON public.student_group_members;
DROP POLICY IF EXISTS "student_group_members_all_admin" ON public.student_group_members;
DROP POLICY IF EXISTS "student_group_members_admin_all" ON public.student_group_members;
CREATE POLICY "student_group_members_select" ON public.student_group_members
  FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = user_id OR (SELECT public.is_admin_email()));
CREATE POLICY "student_group_members_admin_all" ON public.student_group_members
  FOR ALL TO authenticated
  USING ((SELECT public.is_admin_email()))
  WITH CHECK ((SELECT public.is_admin_email()));

REVOKE ALL ON public.student_groups FROM anon;
REVOKE ALL ON public.student_group_members FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.student_groups TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.student_group_members TO authenticated;

RESET lock_timeout;
