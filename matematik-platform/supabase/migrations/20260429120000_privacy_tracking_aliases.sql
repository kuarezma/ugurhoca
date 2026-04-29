-- ========================================================
-- Gizlilik odaklı profesyonelleştirme:
-- - Rumuzlu oyun liderliği
-- - Admin takip notları/durumları
-- - Öğrenci haftalık planları
-- - Öğrenci izolasyonu için RLS sıkılaştırmaları
-- ========================================================

CREATE OR REPLACE FUNCTION public.is_admin_email()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (auth.jwt() ->> 'email') = ANY (ARRAY['admin@ugurhoca.com','admin@matematiklab.com']),
    false
  );
$$;

REVOKE ALL ON FUNCTION public.is_admin_email() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin_email() TO authenticated;

-- ========================================================
-- Oyun rumuzları
-- ========================================================
CREATE TABLE IF NOT EXISTS public.game_aliases (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  alias TEXT NOT NULL,
  alias_normalized TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.game_aliases ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "game_aliases_select_own" ON public.game_aliases;
CREATE POLICY "game_aliases_select_own" ON public.game_aliases
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.is_admin_email());

DROP POLICY IF EXISTS "game_aliases_insert_own" ON public.game_aliases;
CREATE POLICY "game_aliases_insert_own" ON public.game_aliases
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "game_aliases_update_own" ON public.game_aliases;
CREATE POLICY "game_aliases_update_own" ON public.game_aliases
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id OR public.is_admin_email())
  WITH CHECK (auth.uid() = user_id OR public.is_admin_email());

CREATE INDEX IF NOT EXISTS game_aliases_alias_normalized_idx
  ON public.game_aliases (alias_normalized);

CREATE OR REPLACE FUNCTION public.normalize_game_alias(input TEXT)
RETURNS TEXT
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT lower(regexp_replace(trim(COALESCE(input, '')), '[^[:alnum:]]', '', 'g'));
$$;

CREATE OR REPLACE FUNCTION public.set_game_alias(p_alias TEXT)
RETURNS public.game_aliases
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  cleaned_alias TEXT := trim(COALESCE(p_alias, ''));
  normalized_alias TEXT := public.normalize_game_alias(p_alias);
  profile_name TEXT;
  normalized_name TEXT;
  existing_owner UUID;
  result public.game_aliases;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Oturum açmanız gerekiyor.';
  END IF;

  IF char_length(cleaned_alias) < 3 OR char_length(cleaned_alias) > 16 THEN
    RAISE EXCEPTION 'Rumuz 3-16 karakter olmalıdır.';
  END IF;

  IF cleaned_alias ~* '(@|https?://|www\.|[0-9]{7,})' THEN
    RAISE EXCEPTION 'Rumuz e-posta, link veya telefon içermemelidir.';
  END IF;

  IF cleaned_alias !~ '^[A-Za-zÇĞİÖŞÜçğıöşü0-9 _.-]+$' THEN
    RAISE EXCEPTION 'Rumuz yalnızca harf, rakam, boşluk, nokta, tire ve alt çizgi içerebilir.';
  END IF;

  SELECT name INTO profile_name FROM public.profiles WHERE id = auth.uid();
  normalized_name := public.normalize_game_alias(profile_name);

  IF normalized_alias = normalized_name OR (
    char_length(normalized_alias) >= 3 AND
    char_length(normalized_name) >= 3 AND
    (position(normalized_alias in normalized_name) > 0 OR position(normalized_name in normalized_alias) > 0)
  ) THEN
    RAISE EXCEPTION 'Rumuz gerçek adınızla aynı veya çok benzer olamaz.';
  END IF;

  SELECT user_id INTO existing_owner
  FROM public.game_aliases
  WHERE alias_normalized = normalized_alias
  LIMIT 1;

  IF existing_owner IS NOT NULL AND existing_owner <> auth.uid() THEN
    RAISE EXCEPTION 'Bu rumuz kullanılıyor.';
  END IF;

  INSERT INTO public.game_aliases (user_id, alias, alias_normalized, updated_at)
  VALUES (auth.uid(), cleaned_alias, normalized_alias, now())
  ON CONFLICT (user_id) DO UPDATE SET
    alias = EXCLUDED.alias,
    alias_normalized = EXCLUDED.alias_normalized,
    updated_at = now()
  RETURNING * INTO result;

  RETURN result;
END;
$$;

REVOKE ALL ON FUNCTION public.set_game_alias(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.set_game_alias(TEXT) TO authenticated;

-- Eski skor kayıtlarında gerçek isim gösterilmesin.
UPDATE public.game_scores SET user_name = NULL WHERE user_name IS NOT NULL;

ALTER TABLE public.game_scores ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Kullanıcılar tüm skorları görebilir" ON public.game_scores;
DROP POLICY IF EXISTS "game_scores_select_own" ON public.game_scores;
CREATE POLICY "game_scores_select_own" ON public.game_scores
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.is_admin_email());

DROP POLICY IF EXISTS "Kullanıcılar kendi skorlarını ekleyebilir" ON public.game_scores;
DROP POLICY IF EXISTS "game_scores_insert_own_with_alias" ON public.game_scores;
CREATE POLICY "game_scores_insert_own_with_alias" ON public.game_scores
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.game_aliases alias
      WHERE alias.user_id = auth.uid()
    )
  );

CREATE OR REPLACE FUNCTION public.get_game_leaderboard(p_period TEXT DEFAULT 'all')
RETURNS TABLE(rank INTEGER, alias TEXT, total_score BIGINT)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH scores AS (
    SELECT
      a.alias,
      SUM(g.score)::BIGINT AS total_score
    FROM public.game_scores g
    JOIN public.game_aliases a ON a.user_id = g.user_id
    WHERE
      CASE
        WHEN p_period = 'week' THEN g.created_at >= date_trunc('day', now() - interval '7 days')
        WHEN p_period = 'month' THEN g.created_at >= date_trunc('day', now() - interval '30 days')
        ELSE true
      END
    GROUP BY a.alias
  )
  SELECT row_number() OVER (ORDER BY scores.total_score DESC)::INTEGER AS rank,
         scores.alias,
         scores.total_score
  FROM scores
  ORDER BY scores.total_score DESC
  LIMIT 10;
$$;

REVOKE ALL ON FUNCTION public.get_game_leaderboard(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_game_leaderboard(TEXT) TO authenticated;

DROP VIEW IF EXISTS public.global_leaderboard;
CREATE VIEW public.global_leaderboard
WITH (security_invoker = true) AS
SELECT
  NULL::UUID AS id,
  alias,
  total_score
FROM public.get_game_leaderboard('all');

REVOKE ALL ON public.global_leaderboard FROM PUBLIC;
GRANT SELECT ON public.global_leaderboard TO authenticated;

-- ========================================================
-- Admin takip merkezi
-- ========================================================
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
  USING (public.is_admin_email())
  WITH CHECK (public.is_admin_email());

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
  USING (public.is_admin_email())
  WITH CHECK (public.is_admin_email());

CREATE INDEX IF NOT EXISTS student_admin_notes_student_created_idx
  ON public.student_admin_notes (student_id, created_at DESC);

-- ========================================================
-- Haftalık planlar
-- ========================================================
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
  USING (auth.uid() = student_id OR public.is_admin_email());

DROP POLICY IF EXISTS "student_weekly_plans_admin_write" ON public.student_weekly_plans;
CREATE POLICY "student_weekly_plans_admin_write" ON public.student_weekly_plans
  FOR ALL TO authenticated
  USING (public.is_admin_email())
  WITH CHECK (public.is_admin_email());

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
    public.is_admin_email()
    OR EXISTS (
      SELECT 1 FROM public.student_weekly_plans plan
      WHERE plan.id = plan_id AND plan.student_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "student_weekly_plan_items_admin_write" ON public.student_weekly_plan_items;
CREATE POLICY "student_weekly_plan_items_admin_write" ON public.student_weekly_plan_items
  FOR ALL TO authenticated
  USING (public.is_admin_email())
  WITH CHECK (public.is_admin_email());

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

REVOKE ALL ON FUNCTION public.complete_weekly_plan_item(UUID, BOOLEAN) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.complete_weekly_plan_item(UUID, BOOLEAN) TO authenticated;

-- ========================================================
-- Ölçüm/analitik eventleri
-- ========================================================
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
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "student_activity_events_admin_select" ON public.student_activity_events;
CREATE POLICY "student_activity_events_admin_select" ON public.student_activity_events
  FOR SELECT TO authenticated
  USING (public.is_admin_email());

CREATE INDEX IF NOT EXISTS student_activity_events_user_created_idx
  ON public.student_activity_events (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS student_activity_events_type_created_idx
  ON public.student_activity_events (event_type, created_at DESC);

-- ========================================================
-- Öğrenci izolasyonu sıkılaştırmaları
-- ========================================================
ALTER TABLE public.shared_documents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "shared_documents_select" ON public.shared_documents;
DROP POLICY IF EXISTS "shared_documents_select_own" ON public.shared_documents;
CREATE POLICY "shared_documents_select_own" ON public.shared_documents
  FOR SELECT TO authenticated
  USING (student_id = auth.uid() OR public.is_admin_email());

ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "assignments_select" ON public.assignments;
DROP POLICY IF EXISTS "assignments_select_scoped" ON public.assignments;
CREATE POLICY "assignments_select_scoped" ON public.assignments
  FOR SELECT TO authenticated
  USING (
    public.is_admin_email()
    OR student_id = auth.uid()
    OR (
      student_id IS NULL
      AND EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid()
          AND (
            assignments.grade IS NULL
            OR p.grade::TEXT = assignments.grade::TEXT
          )
      )
    )
  );

ALTER TABLE public.quiz_results ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "quiz_results_admin_all" ON public.quiz_results;
CREATE POLICY "quiz_results_admin_all" ON public.quiz_results
  FOR ALL TO authenticated
  USING (public.is_admin_email())
  WITH CHECK (public.is_admin_email());

DO $$
BEGIN
  IF to_regclass('public.comments') IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY';
    EXECUTE 'DROP POLICY IF EXISTS "comments_select" ON public.comments';
    EXECUTE 'DROP POLICY IF EXISTS "comments_select_all" ON public.comments';
    EXECUTE 'DROP POLICY IF EXISTS "comments_select_own_or_admin" ON public.comments';
    EXECUTE 'CREATE POLICY "comments_select_own_or_admin" ON public.comments FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_admin_email())';
  END IF;

  IF to_regclass('public.notes') IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY';
    EXECUTE 'DROP POLICY IF EXISTS "notes_select" ON public.notes';
    EXECUTE 'DROP POLICY IF EXISTS "notes_select_own" ON public.notes';
    EXECUTE 'DROP POLICY IF EXISTS "notes_insert_own" ON public.notes';
    EXECUTE 'DROP POLICY IF EXISTS "notes_update_own" ON public.notes';
    EXECUTE 'DROP POLICY IF EXISTS "notes_delete_own" ON public.notes';
    EXECUTE 'DROP POLICY IF EXISTS "notes_admin_all" ON public.notes';
    EXECUTE 'CREATE POLICY "notes_select_own" ON public.notes FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_admin_email())';
    EXECUTE 'CREATE POLICY "notes_insert_own" ON public.notes FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid())';
    EXECUTE 'CREATE POLICY "notes_update_own" ON public.notes FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid())';
    EXECUTE 'CREATE POLICY "notes_delete_own" ON public.notes FOR DELETE TO authenticated USING (user_id = auth.uid())';
    EXECUTE 'CREATE POLICY "notes_admin_all" ON public.notes FOR ALL TO authenticated USING (public.is_admin_email()) WITH CHECK (public.is_admin_email())';
  END IF;
END $$;
