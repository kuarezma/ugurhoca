-- admin-message, sent-message ve diğer bildirimler için ek alanlar (görsel URL, gönderen vb.)
-- PostgREST şema önbelleği 'metadata' sütununu bekliyor; yoksa insert/select hata verir.

ALTER TABLE public.notifications
  ADD COLUMN IF NOT EXISTS metadata jsonb;

COMMENT ON COLUMN public.notifications.metadata IS
  'Esnek ek veri: sender_id, image_url, attachments, ip vb.';
