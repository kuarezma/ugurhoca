-- Update game_score_limit function to support newly added kids games:
-- 13: Pizza Ustası
-- 14: Matematik Ninja
-- 15: Köstebek Avı
-- 16: Hızlı Şoför
-- 17: Koordinat Korsanı
-- 18: Sayı Kulesi

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
    WHEN 13 THEN 950
    WHEN 14 THEN 950
    WHEN 15 THEN 950
    WHEN 16 THEN 950
    WHEN 17 THEN 950
    WHEN 18 THEN 950
    ELSE NULL
  END;
$$;

REVOKE ALL ON FUNCTION public.game_score_limit(INT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.game_score_limit(INT) TO authenticated;
