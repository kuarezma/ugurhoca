-- ============================================
-- announcements Tablosu
-- ============================================
CREATE TABLE IF NOT EXISTS public.announcements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT,
  image_url TEXT,
  image_urls TEXT[],
  link_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "announcements_select" ON public.announcements
  FOR SELECT USING (true);

CREATE POLICY "announcements_insert" ON public.announcements
  FOR INSERT WITH CHECK (true);

CREATE POLICY "announcements_delete" ON public.announcements
  FOR DELETE USING (true);

-- ============================================
-- documents Tablosu
-- ============================================
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT,
  file_url TEXT,
  file_name TEXT,
  grade INTEGER[],
  is_admin_only BOOLEAN DEFAULT false,
  video_url TEXT,
  downloads INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  rating DECIMAL(2,1) DEFAULT 0,
  is_new BOOLEAN DEFAULT false,
  answer_key_text TEXT,
  solution_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "documents_select" ON public.documents
  FOR SELECT USING (true);

CREATE POLICY "documents_insert" ON public.documents
  FOR INSERT WITH CHECK (true);

CREATE POLICY "documents_delete" ON public.documents
  FOR DELETE USING (true);

-- ============================================
-- profiles Tablosu (varsa ekleme)
-- ============================================
-- Bu tablo Auth tarafından otomatik oluşturulur
-- Eğer yoksa ekleyin:

-- CREATE TABLE IF NOT EXISTS public.profiles (
--   id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
--   name TEXT,
--   email TEXT,
--   grade INTEGER,
--   is_private_student BOOLEAN DEFAULT false,
--   created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
-- );

-- ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- CREATE POLICY "profiles_select" ON public.profiles
--   FOR SELECT USING (true);

-- CREATE POLICY "profiles_update" ON public.profiles
--   FOR UPDATE USING (true);

-- ============================================
-- assignments Tablosu
-- ============================================
CREATE TABLE IF NOT EXISTS public.assignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  student_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "assignments_select" ON public.assignments
  FOR SELECT USING (true);

CREATE POLICY "assignments_insert" ON public.assignments
  FOR INSERT WITH CHECK (true);

CREATE POLICY "assignments_delete" ON public.assignments
  FOR DELETE USING (true);

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

ALTER TABLE public.shared_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "shared_documents_select" ON public.shared_documents
  FOR SELECT USING (true);

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

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notifications_select" ON public.notifications
  FOR SELECT USING (true);

CREATE POLICY "notifications_insert" ON public.notifications
  FOR INSERT WITH CHECK (true);

CREATE POLICY "notifications_update" ON public.notifications
  FOR UPDATE USING (true);

-- ============================================
-- note_categories Tablosu
-- ============================================
CREATE TABLE IF NOT EXISTS public.note_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#8b5cf6',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.note_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "note_categories_select" ON public.note_categories
  FOR SELECT USING (true);

CREATE POLICY "note_categories_insert" ON public.note_categories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "note_categories_update" ON public.note_categories
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "note_categories_delete" ON public.note_categories
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- notes Tablosu
-- ============================================
CREATE TABLE IF NOT EXISTS public.notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT,
  content TEXT NOT NULL,
  category TEXT,
  tags TEXT[] DEFAULT '{}',
  is_pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notes_select" ON public.notes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "notes_insert" ON public.notes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "notes_update" ON public.notes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "notes_delete" ON public.notes
  FOR DELETE USING (auth.uid() = user_id);
