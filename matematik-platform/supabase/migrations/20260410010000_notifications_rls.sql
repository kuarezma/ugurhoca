-- notifications tablosu RLS politikaları
-- Öğrenciler sadece kendi bildirimlerini görebilir

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notifications_select_own" ON public.notifications;
DROP POLICY IF EXISTS "notifications_insert_all" ON public.notifications;
DROP POLICY IF EXISTS "notifications_update_own" ON public.notifications;
DROP POLICY IF EXISTS "notifications_delete_own" ON public.notifications;

-- Kullanıcı sadece kendi bildirimlerini görebilir
CREATE POLICY "notifications_select_own" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

-- Herkes insert yapabilir (admin mesaj, support mesajı vb. gönderilebilsin)
CREATE POLICY "notifications_insert_all" ON public.notifications
  FOR INSERT WITH CHECK (true);

-- Kullanıcı sadece kendi bildirimini güncelleyebilir (okundu işareti)
CREATE POLICY "notifications_update_own" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Kullanıcı sadece kendi bildirimini silebilir
CREATE POLICY "notifications_delete_own" ON public.notifications
  FOR DELETE USING (auth.uid() = user_id);
