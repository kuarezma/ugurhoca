-- ==========================================================
-- Oyun 19 (Matematik Düellosu, src/features/games/components/games/
-- MathDuel.tsx) için skor limiti. 20260904000000 limitleri 18'de bitiriyor;
-- 19 için game_score_limit NULL döner ve submit_game_score her skoru
-- "Geçersiz oyun." ile reddeder.
--
-- Limitin kaynağı: MathDuel skoru ölçeklemez. 60 saniyelik turda her doğru
-- cevap 100 + min(seri*20, 100) puan verir (cevap başına en fazla 200);
-- arayüz 2000'i dolu çubuk, tek kişilik hedefi 1200 olarak gösterir. Tur
-- başına teorik üst sınır cevap hızına bağlıdır (~1 cevap/sn ile ~11.900).
-- submit_game_score günlük toplamı zaten 5000 ile sınırlar; tek turun bu
-- sınırı aşması günlük limit hatasına düşer. Limit 5000 seçildi: dürüst bir
-- tur günlük sınırdan önce reddedilmez. Diğer oyunlar (<= 950) ile aynı
-- ölçek istenirse oyun skoru ölçeklenmeli; bu bir ürün kararıdır.
--
-- Gövde 20260904000000 ile aynıdır, yalnız WHEN 19 eklenir. Tekrar
-- çalıştırılabilir; veri değiştirmez.
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
    ELSE NULL
  END;
$$;

REVOKE ALL ON FUNCTION public.game_score_limit(INT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.game_score_limit(INT) TO authenticated;

RESET lock_timeout;
