-- notifications tablosunu supabase_realtime yayınına ekler.
-- Amaç: öğrenci ile Uğur Hoca arasındaki mesajların canlı olarak
-- chat paneline düşmesi. REPLICA IDENTITY FULL, UPDATE olaylarında
-- (okundu işaretleme gibi) tüm satırın yayılmasını sağlar.

ALTER TABLE public.notifications REPLICA IDENTITY FULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'notifications'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications';
  END IF;
END;
$$;
