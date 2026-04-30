-- Güvenli oyun skoru yazımı ve liderlik tablosu sıfırlama.

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

DROP POLICY IF EXISTS "Kullanıcılar kendi skorlarını ekleyebilir" ON public.game_scores;
DROP POLICY IF EXISTS "game_scores_insert_own_with_alias" ON public.game_scores;

REVOKE INSERT ON public.game_scores FROM anon, authenticated;
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
