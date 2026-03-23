-- ============================================
-- shared_documents Tablosu
-- ============================================
CREATE TABLE IF NOT EXISTS public.shared_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id TEXT,
  student_id UUID NOT NULL,
  student_name TEXT,
  student_email TEXT,
  document_title TEXT,
  document_type TEXT,
  file_url TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- RLS (Satır Seviyesi Güvenlik)
ALTER TABLE public.shared_documents ENABLE ROW LEVEL SECURITY;

-- Herkes okuyabilir
CREATE POLICY "shared_documents_select" ON public.shared_documents
  FOR SELECT USING (true);

-- Admin ekleme yapabilir
CREATE POLICY "shared_documents_insert" ON public.shared_documents
  FOR INSERT WITH CHECK (true);

-- ============================================
-- notifications Tablosu
-- ============================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT,
  message TEXT,
  type TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- RLS (Satır Seviyesi Güvenlik)
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Kullanıcı kendi bildirimlerini okuyabilir
CREATE POLICY "notifications_own_select" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

-- Admin bildirim ekleyebilir
CREATE POLICY "notifications_admin_insert" ON public.notifications
  FOR INSERT WITH CHECK (true);

-- Kullanıcı kendi bildirimlerini güncelleyebilir
CREATE POLICY "notifications_own_update" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);
