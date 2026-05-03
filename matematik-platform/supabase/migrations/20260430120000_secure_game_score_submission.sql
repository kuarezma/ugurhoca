-- Güvenli oyun skoru yazımı ve liderlik tablosu sıfırlama.

CREATE OR REPLACE FUNCTION public.is_admin_email()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (auth.jwt() ->> 'email') = 'admin@ugurhoca.com',
    false
  );
$$;

REVOKE ALL ON FUNCTION public.is_admin_email() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin_email() TO authenticated;

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

REVOKE ALL ON public.game_aliases FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.game_aliases TO authenticated;

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

REVOKE ALL ON FUNCTION public.normalize_game_alias(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.normalize_game_alias(TEXT) TO authenticated;

REVOKE ALL ON FUNCTION public.set_game_alias(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.set_game_alias(TEXT) TO authenticated;

CREATE TABLE IF NOT EXISTS public.archived_game_scores (
  id UUID PRIMARY KEY,
  user_id UUID,
  user_name TEXT,
  game_id INT,
  score INT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE,
  archived_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.archived_game_scores ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.archived_game_scores FROM anon, authenticated;

INSERT INTO public.archived_game_scores (
  id,
  user_id,
  user_name,
  game_id,
  score,
  created_at
)
SELECT
  id,
  user_id,
  user_name,
  game_id,
  score,
  created_at
FROM public.game_scores
ON CONFLICT (id) DO NOTHING;

TRUNCATE TABLE public.game_scores;

ALTER TABLE public.game_scores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Kullanıcılar tüm skorları görebilir" ON public.game_scores;
DROP POLICY IF EXISTS "game_scores_select_own" ON public.game_scores;
DROP POLICY IF EXISTS "Kullanıcılar kendi skorlarını ekleyebilir" ON public.game_scores;
DROP POLICY IF EXISTS "game_scores_insert_own_with_alias" ON public.game_scores;

CREATE POLICY "game_scores_select_own" ON public.game_scores
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.is_admin_email());

REVOKE ALL ON public.game_scores FROM anon, authenticated;
GRANT SELECT ON public.game_scores TO authenticated;

CREATE INDEX IF NOT EXISTS game_scores_user_created_at_idx
  ON public.game_scores (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS game_scores_game_id_idx
  ON public.game_scores (game_id);

CREATE OR REPLACE FUNCTION public.game_score_limit(p_game_id INT)
RETURNS INT
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT CASE p_game_id
    WHEN 1 THEN 900
    WHEN 2 THEN 900
    WHEN 3 THEN 800
    WHEN 4 THEN 700
    WHEN 5 THEN 900
    WHEN 6 THEN 800
    WHEN 7 THEN 850
    WHEN 8 THEN 900
    WHEN 9 THEN 900
    WHEN 10 THEN 250
    WHEN 11 THEN 900
    WHEN 12 THEN 950
    ELSE NULL
  END;
$$;

CREATE OR REPLACE FUNCTION public.submit_game_score(
  p_game_id INT,
  p_score INT
)
RETURNS public.game_scores
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  max_score INT;
  todays_score BIGINT;
  last_score_at TIMESTAMP WITH TIME ZONE;
  inserted_score public.game_scores;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Oturum açmanız gerekiyor.';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.game_aliases alias
    WHERE alias.user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Skor kaydetmek için önce oyun rumuzu seçmeniz gerekiyor.';
  END IF;

  max_score := public.game_score_limit(p_game_id);

  IF max_score IS NULL THEN
    RAISE EXCEPTION 'Geçersiz oyun.';
  END IF;

  IF p_score IS NULL OR p_score <= 0 THEN
    RAISE EXCEPTION 'Skor pozitif olmalıdır.';
  END IF;

  IF p_score > max_score THEN
    RAISE EXCEPTION 'Bu oyun için skor limiti aşıldı.';
  END IF;

  SELECT MAX(created_at)
  INTO last_score_at
  FROM public.game_scores
  WHERE user_id = auth.uid();

  IF last_score_at IS NOT NULL AND last_score_at > now() - interval '15 seconds' THEN
    RAISE EXCEPTION 'Skorlar çok sık gönderiliyor.';
  END IF;

  SELECT COALESCE(SUM(score), 0)
  INTO todays_score
  FROM public.game_scores
  WHERE user_id = auth.uid()
    AND created_at >= date_trunc('day', now());

  IF todays_score + p_score > 5000 THEN
    RAISE EXCEPTION 'Günlük oyun puanı limitine ulaştınız.';
  END IF;

  INSERT INTO public.game_scores (user_id, user_name, game_id, score)
  VALUES (auth.uid(), NULL, p_game_id, p_score)
  RETURNING * INTO inserted_score;

  RETURN inserted_score;
END;
$$;

REVOKE ALL ON FUNCTION public.game_score_limit(INT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.game_score_limit(INT) TO authenticated;

REVOKE ALL ON FUNCTION public.submit_game_score(INT, INT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_game_score(INT, INT) TO authenticated;

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
