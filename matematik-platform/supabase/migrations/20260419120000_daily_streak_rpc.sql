-- Günlük ziyaret streak'ini güvenli şekilde artıran RPC.
-- Öğrenci istemcisi her oturumda bir kez çağırır; mevcut test-bitince
-- trigger'ıyla uyumludur (last_active_date paylaşılır).

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

  UPDATE public.profiles
  SET
    current_streak = CASE
      WHEN last_active_date = CURRENT_DATE THEN COALESCE(current_streak, 0)
      WHEN last_active_date = CURRENT_DATE - INTERVAL '1 day' THEN COALESCE(current_streak, 0) + 1
      ELSE 1
    END,
    last_active_date = CURRENT_DATE
  WHERE id = uid;

  RETURN QUERY
  SELECT p.current_streak, p.last_active_date
  FROM public.profiles p
  WHERE p.id = uid;
END;
$$;

REVOKE ALL ON FUNCTION public.touch_daily_streak() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.touch_daily_streak() TO authenticated;
