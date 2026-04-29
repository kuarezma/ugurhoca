-- touch_daily_streak fonksiyonunda OUT parametre adları ile profiles kolonları
-- çakışmasın diye tüm kolon referansları tablo alias'ı ile yazılır.

CREATE OR REPLACE FUNCTION public.touch_daily_streak()
RETURNS TABLE (current_streak INTEGER, last_active_date DATE)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid UUID := auth.uid();
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Oturum bulunamadı';
  END IF;

  UPDATE public.profiles AS p
  SET
    current_streak = CASE
      WHEN p.last_active_date = CURRENT_DATE THEN COALESCE(p.current_streak, 0)
      WHEN p.last_active_date = CURRENT_DATE - INTERVAL '1 day' THEN COALESCE(p.current_streak, 0) + 1
      ELSE 1
    END,
    last_active_date = CURRENT_DATE
  WHERE p.id = uid;

  RETURN QUERY
  SELECT p.current_streak, p.last_active_date
  FROM public.profiles AS p
  WHERE p.id = uid;
END;
$$;

REVOKE ALL ON FUNCTION public.touch_daily_streak() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.touch_daily_streak() TO authenticated;
