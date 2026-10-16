-- ==========================================================
-- Yeni çocuk oyunları (20..25) için skor limitleri:
-- 20: Penaltı Şampiyonu (PenaltyShootout.tsx)
-- 21: İksir Laboratuvarı (PotionLab.tsx)
-- 22: Dinozor Macerası (DinoRunner.tsx)
-- 23: Meteor Savunması (MeteorDefense.tsx)
-- 24: Gizli Ajan: Kasa Şifresi (SecretAgent.tsx)
-- 25: Okçu Şampiyonu (GeometryArcher.tsx)
-- ==========================================================

SET lock_timeout = '5s';

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
    WHEN 19 THEN 5000
    WHEN 20 THEN 5000
    WHEN 21 THEN 5000
    WHEN 22 THEN 5000
    WHEN 23 THEN 5000
    WHEN 24 THEN 5000
    WHEN 25 THEN 5000
    ELSE NULL
  END;
$$;

REVOKE ALL ON FUNCTION public.game_score_limit(INT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.game_score_limit(INT) TO authenticated;

RESET lock_timeout;
