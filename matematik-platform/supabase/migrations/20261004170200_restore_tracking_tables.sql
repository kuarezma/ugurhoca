-- ==========================================================
-- 20260429120000_privacy_tracking_aliases production'a yalnız kısmen
-- uygulanmış: oyun rumuzu/liderlik kısmı var, aşağıdaki nesneler yok
-- (2026-10-04 salt okunur denetim; PostgREST 404 logları):
--   student_admin_statuses, student_admin_notes, student_weekly_plans,
--   student_weekly_plan_items, complete_weekly_plan_item(), student_activity_events
-- Kullanan kod: admin/queries.ts (takip merkezi, planlar), profile/queries.ts
-- ve profile/server.ts (haftalık plan), analytics/trackActivity.ts,
-- api/user/delete-account (student_activity_events silme).
--
-- 20260429120000'den farkları (bilerek):
-- * is_admin_email(), oyun tabloları/fonksiyonları, global_leaderboard ve
--   game_scores UPDATE'i ALINMADI: production'da sonraki migration'lar
--   (20260430120000, 20260907100000, 20260930120000) bunların üzerine yazdı;
--   dosyanın tamamını yeniden çalıştırmak bu tanımları geri alır.
-- * shared_documents/assignments/quiz_results/comments/notes RLS
--   sıkılaştırmaları ALINMADI: davranış değişikliği, ayrı karar
--   (shared_documents 20261004170000'de).
-- * Politikalar initplan kalıbıyla ((SELECT auth.uid()),
--   (SELECT public.is_admin_email())) yazıldı; anlam aynı (bkz. 20260930140000).
-- * Yeni tablolardan anon yetkisi alınır (Supabase varsayılan ACL'i anon'a
--   tam yetki verir); fonksiyon ACL'i 20260930120000 kuralına uyar.
--
-- Taze ortamda (20260429120000 zaten çalışmış) tablolar/index'ler IF NOT
-- EXISTS ile atlanır, politikalar aynı anlamla yeniden kurulur.
-- Veri değiştirmez. Tekrar çalıştırılabilir.
-- ==========================================================

SET lock_timeout = '5s';

-- --- Admin takip merkezi ---------------------------------------------------
CREATE TABLE IF NOT EXISTS public.student_admin_statuses (
  student_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'normal',
  labels TEXT[] NOT NULL DEFAULT '{}',
  follow_up_at TIMESTAMP WITH TIME ZONE,
  last_contacted_at TIMESTAMP WITH TIME ZONE,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.student_admin_statuses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "student_admin_statuses_admin_all" ON public.student_admin_statuses;
CREATE POLICY "student_admin_statuses_admin_all" ON public.student_admin_statuses
  FOR ALL TO authenticated
  USING ((SELECT public.is_admin_email()))
  WITH CHECK ((SELECT public.is_admin_email()));

CREATE TABLE IF NOT EXISTS public.student_admin_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.student_admin_notes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "student_admin_notes_admin_all" ON public.student_admin_notes;
CREATE POLICY "student_admin_notes_admin_all" ON public.student_admin_notes
  FOR ALL TO authenticated
  USING ((SELECT public.is_admin_email()))
  WITH CHECK ((SELECT public.is_admin_email()));

CREATE INDEX IF NOT EXISTS student_admin_notes_student_created_idx
  ON public.student_admin_notes (student_id, created_at DESC);

-- --- Haftalık planlar ------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.student_weekly_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  week_start DATE NOT NULL,
  title TEXT NOT NULL DEFAULT 'Bu Haftaki Plan',
  target_minutes INTEGER NOT NULL DEFAULT 600,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(student_id, week_start)
);

ALTER TABLE public.student_weekly_plans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "student_weekly_plans_select_own" ON public.student_weekly_plans;
CREATE POLICY "student_weekly_plans_select_own" ON public.student_weekly_plans
  FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = student_id OR (SELECT public.is_admin_email()));

DROP POLICY IF EXISTS "student_weekly_plans_admin_write" ON public.student_weekly_plans;
CREATE POLICY "student_weekly_plans_admin_write" ON public.student_weekly_plans
  FOR ALL TO authenticated
  USING ((SELECT public.is_admin_email()))
  WITH CHECK ((SELECT public.is_admin_email()));

CREATE TABLE IF NOT EXISTS public.student_weekly_plan_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_id UUID NOT NULL REFERENCES public.student_weekly_plans(id) ON DELETE CASCADE,
  kind TEXT NOT NULL DEFAULT 'custom',
  title TEXT NOT NULL,
  linked_id UUID,
  href TEXT,
  due_at TIMESTAMP WITH TIME ZONE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE,
  completed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.student_weekly_plan_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "student_weekly_plan_items_select_own" ON public.student_weekly_plan_items;
CREATE POLICY "student_weekly_plan_items_select_own" ON public.student_weekly_plan_items
  FOR SELECT TO authenticated
  USING (
    (SELECT public.is_admin_email())
    OR EXISTS (
      SELECT 1 FROM public.student_weekly_plans plan
      WHERE plan.id = student_weekly_plan_items.plan_id
        AND plan.student_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "student_weekly_plan_items_admin_write" ON public.student_weekly_plan_items;
CREATE POLICY "student_weekly_plan_items_admin_write" ON public.student_weekly_plan_items
  FOR ALL TO authenticated
  USING ((SELECT public.is_admin_email()))
  WITH CHECK ((SELECT public.is_admin_email()));

CREATE INDEX IF NOT EXISTS student_weekly_plans_student_week_idx
  ON public.student_weekly_plans (student_id, week_start DESC);
CREATE INDEX IF NOT EXISTS student_weekly_plan_items_plan_order_idx
  ON public.student_weekly_plan_items (plan_id, sort_order, created_at);

CREATE OR REPLACE FUNCTION public.complete_weekly_plan_item(
  p_item_id UUID,
  p_completed BOOLEAN DEFAULT true
)
RETURNS public.student_weekly_plan_items
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result public.student_weekly_plan_items;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Oturum açmanız gerekiyor.';
  END IF;

  UPDATE public.student_weekly_plan_items item
  SET
    completed_at = CASE WHEN p_completed THEN now() ELSE NULL END,
    completed_by = CASE WHEN p_completed THEN auth.uid() ELSE NULL END,
    updated_at = now()
  FROM public.student_weekly_plans plan
  WHERE item.id = p_item_id
    AND item.plan_id = plan.id
    AND plan.student_id = auth.uid()
  RETURNING item.* INTO result;

  IF result.id IS NULL THEN
    RAISE EXCEPTION 'Plan maddesi bulunamadı.';
  END IF;

  RETURN result;
END;
$$;

REVOKE ALL ON FUNCTION public.complete_weekly_plan_item(UUID, BOOLEAN) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.complete_weekly_plan_item(UUID, BOOLEAN) TO authenticated, service_role;

-- --- Ölçüm/analitik olayları -----------------------------------------------
CREATE TABLE IF NOT EXISTS public.student_activity_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.student_activity_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "student_activity_events_insert_own" ON public.student_activity_events;
CREATE POLICY "student_activity_events_insert_own" ON public.student_activity_events
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "student_activity_events_admin_select" ON public.student_activity_events;
CREATE POLICY "student_activity_events_admin_select" ON public.student_activity_events
  FOR SELECT TO authenticated
  USING ((SELECT public.is_admin_email()));

CREATE INDEX IF NOT EXISTS student_activity_events_user_created_idx
  ON public.student_activity_events (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS student_activity_events_type_created_idx
  ON public.student_activity_events (event_type, created_at DESC);

-- --- Anonim erişim yok -------------------------------------------------------
REVOKE ALL ON public.student_admin_statuses FROM anon;
REVOKE ALL ON public.student_admin_notes FROM anon;
REVOKE ALL ON public.student_weekly_plans FROM anon;
REVOKE ALL ON public.student_weekly_plan_items FROM anon;
REVOKE ALL ON public.student_activity_events FROM anon;

RESET lock_timeout;
