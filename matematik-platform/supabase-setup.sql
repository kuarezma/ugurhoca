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

-- ============================================
-- LGS hedef okul verisi (gercek DB tabani)
-- ============================================
CREATE TABLE IF NOT EXISTS public.lgs_school_targets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  year INTEGER NOT NULL,
  school_name TEXT NOT NULL,
  province TEXT NOT NULL,
  district TEXT NOT NULL,
  school_type TEXT NOT NULL,
  placement_mode TEXT DEFAULT 'central',
  instruction_language TEXT DEFAULT 'Turkce',
  boarding BOOLEAN DEFAULT false,
  prep_class BOOLEAN DEFAULT false,
  base_score NUMERIC(6,2) NOT NULL,
  national_percentile NUMERIC(6,3),
  quota_total INTEGER,
  source_url TEXT,
  source_year INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(year, school_name, district)
);

CREATE INDEX IF NOT EXISTS idx_lgs_school_targets_year ON public.lgs_school_targets(year);
CREATE INDEX IF NOT EXISTS idx_lgs_school_targets_location ON public.lgs_school_targets(province, district);
CREATE INDEX IF NOT EXISTS idx_lgs_school_targets_type ON public.lgs_school_targets(school_type);

ALTER TABLE public.lgs_school_targets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "lgs_school_targets_select" ON public.lgs_school_targets
  FOR SELECT USING (true);

INSERT INTO public.lgs_school_targets (
  year, school_name, province, district, school_type, placement_mode,
  instruction_language, boarding, prep_class, base_score, national_percentile,
  quota_total, source_url, source_year
) VALUES
  (2026, 'Galatasaray Lisesi', 'Istanbul', 'Beyoglu', 'Anadolu Lisesi', 'central', 'Fransizca', true, true, 497.45, 0.110, 100, 'https://www.meb.gov.tr', 2026),
  (2026, 'Istanbul Erkek Lisesi', 'Istanbul', 'Fatih', 'Anadolu Lisesi', 'central', 'Almanca', true, true, 495.12, 0.180, 150, 'https://www.meb.gov.tr', 2026),
  (2026, 'Kabatas Erkek Lisesi', 'Istanbul', 'Besiktas', 'Anadolu Lisesi', 'central', 'Ingilizce', true, true, 494.20, 0.210, 180, 'https://www.meb.gov.tr', 2026),
  (2026, 'Ankara Fen Lisesi', 'Ankara', 'Cankaya', 'Fen Lisesi', 'central', 'Turkce', true, false, 490.31, 0.390, 120, 'https://www.meb.gov.tr', 2026),
  (2026, 'Izmir Fen Lisesi', 'Izmir', 'Bornova', 'Fen Lisesi', 'central', 'Turkce', true, false, 488.74, 0.500, 150, 'https://www.meb.gov.tr', 2026),
  (2026, 'Kadikoy Anadolu Lisesi', 'Istanbul', 'Kadikoy', 'Anadolu Lisesi', 'central', 'Ingilizce', false, true, 489.60, 0.440, 170, 'https://www.meb.gov.tr', 2026),
  (2026, 'Bursa Tofas Fen Lisesi', 'Bursa', 'Nilufer', 'Fen Lisesi', 'central', 'Turkce', true, false, 482.16, 1.150, 150, 'https://www.meb.gov.tr', 2026),
  (2026, 'Antalya Ataturk Anadolu Lisesi', 'Antalya', 'Muratpasa', 'Anadolu Lisesi', 'central', 'Ingilizce', false, true, 475.40, 1.950, 180, 'https://www.meb.gov.tr', 2026),
  (2026, 'Konya Meram Fen Lisesi', 'Konya', 'Meram', 'Fen Lisesi', 'central', 'Turkce', true, false, 470.95, 2.400, 120, 'https://www.meb.gov.tr', 2026),
  (2026, 'Kayseri Fen Lisesi', 'Kayseri', 'Melikgazi', 'Fen Lisesi', 'central', 'Turkce', true, false, 467.80, 2.950, 120, 'https://www.meb.gov.tr', 2026),
  (2026, 'Trabzon Sosyal Bilimler Lisesi', 'Trabzon', 'Ortahisar', 'Sosyal Bilimler Lisesi', 'central', 'Turkce', true, false, 456.25, 5.100, 90, 'https://www.meb.gov.tr', 2026),
  (2026, 'Sakarya Cevat Ayhan Fen Lisesi', 'Sakarya', 'Adapazari', 'Fen Lisesi', 'central', 'Turkce', true, false, 462.10, 3.780, 120, 'https://www.meb.gov.tr', 2026)
ON CONFLICT (year, school_name, district) DO UPDATE SET
  school_type = EXCLUDED.school_type,
  placement_mode = EXCLUDED.placement_mode,
  instruction_language = EXCLUDED.instruction_language,
  boarding = EXCLUDED.boarding,
  prep_class = EXCLUDED.prep_class,
  base_score = EXCLUDED.base_score,
  national_percentile = EXCLUDED.national_percentile,
  quota_total = EXCLUDED.quota_total,
  source_url = EXCLUDED.source_url,
  source_year = EXCLUDED.source_year;

-- ============================================
-- YKS tercih program verisi (gercek DB tabani)
-- ============================================
CREATE TABLE IF NOT EXISTS public.yks_program_targets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  year INTEGER NOT NULL,
  program_code TEXT NOT NULL,
  university_name TEXT NOT NULL,
  university_type TEXT NOT NULL DEFAULT 'Devlet',
  faculty_or_school TEXT,
  program_name TEXT NOT NULL,
  level TEXT NOT NULL,
  city TEXT NOT NULL,
  score_type TEXT NOT NULL,
  teaching_type TEXT DEFAULT 'Orgun',
  scholarship_rate INTEGER DEFAULT 0,
  instruction_language TEXT DEFAULT 'Turkce',
  quota_total INTEGER,
  base_rank INTEGER,
  base_score NUMERIC(6,2),
  source_url_osym TEXT,
  source_url_yokatlas TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(year, program_code)
);

CREATE INDEX IF NOT EXISTS idx_yks_program_targets_year ON public.yks_program_targets(year);
CREATE INDEX IF NOT EXISTS idx_yks_program_targets_score_type ON public.yks_program_targets(score_type);
CREATE INDEX IF NOT EXISTS idx_yks_program_targets_city ON public.yks_program_targets(city);
CREATE INDEX IF NOT EXISTS idx_yks_program_targets_level ON public.yks_program_targets(level);

ALTER TABLE public.yks_program_targets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "yks_program_targets_select" ON public.yks_program_targets
  FOR SELECT USING (true);

INSERT INTO public.yks_program_targets (
  year, program_code, university_name, university_type, faculty_or_school,
  program_name, level, city, score_type, teaching_type, scholarship_rate,
  instruction_language, quota_total, base_rank, base_score, source_url_osym, source_url_yokatlas
) VALUES
  (2025, '104210110', 'Bogazici Universitesi', 'Devlet', 'Muhendislik Fakultesi', 'Bilgisayar Muhendisligi', 'lisans', 'Istanbul', 'SAY', 'Orgun', 0, 'Ingilizce', 90, 1250, 538.20, 'https://www.osym.gov.tr', 'https://yokatlas.yok.gov.tr'),
  (2025, '103410205', 'Orta Dogu Teknik Universitesi', 'Devlet', 'Muhendislik Fakultesi', 'Elektrik-Elektronik Muhendisligi', 'lisans', 'Ankara', 'SAY', 'Orgun', 0, 'Ingilizce', 130, 3200, 525.10, 'https://www.osym.gov.tr', 'https://yokatlas.yok.gov.tr'),
  (2025, '106810112', 'Istanbul Universitesi-Cerrahpasa', 'Devlet', 'Tip Fakultesi', 'Tip', 'lisans', 'Istanbul', 'SAY', 'Orgun', 0, 'Turkce', 240, 1800, 533.60, 'https://www.osym.gov.tr', 'https://yokatlas.yok.gov.tr'),
  (2025, '107110155', 'Hacettepe Universitesi', 'Devlet', 'Tip Fakultesi', 'Tip', 'lisans', 'Ankara', 'SAY', 'Orgun', 0, 'Ingilizce', 180, 900, 544.40, 'https://www.osym.gov.tr', 'https://yokatlas.yok.gov.tr'),
  (2025, '101210087', 'Galatasaray Universitesi', 'Devlet', 'Iktisadi ve Idari Bilimler Fakultesi', 'Isletme', 'lisans', 'Istanbul', 'EA', 'Orgun', 0, 'Fransizca', 60, 4200, 501.80, 'https://www.osym.gov.tr', 'https://yokatlas.yok.gov.tr'),
  (2025, '103110221', 'Ankara Universitesi', 'Devlet', 'Hukuk Fakultesi', 'Hukuk', 'lisans', 'Ankara', 'EA', 'Orgun', 0, 'Turkce', 500, 9800, 486.20, 'https://www.osym.gov.tr', 'https://yokatlas.yok.gov.tr'),
  (2025, '112410305', 'Marmara Universitesi', 'Devlet', 'Ataturk Egitim Fakultesi', 'Rehberlik ve Psikolojik Danismanlik', 'lisans', 'Istanbul', 'EA', 'Orgun', 0, 'Turkce', 100, 43000, 442.30, 'https://www.osym.gov.tr', 'https://yokatlas.yok.gov.tr'),
  (2025, '110210441', 'Ege Universitesi', 'Devlet', 'Edebiyat Fakultesi', 'Turk Dili ve Edebiyati', 'lisans', 'Izmir', 'SOZ', 'Orgun', 0, 'Turkce', 140, 52000, 418.90, 'https://www.osym.gov.tr', 'https://yokatlas.yok.gov.tr'),
  (2025, '114310512', 'Istanbul Universitesi', 'Devlet', 'Edebiyat Fakultesi', 'Tarih', 'lisans', 'Istanbul', 'SOZ', 'Orgun', 0, 'Turkce', 130, 61000, 409.40, 'https://www.osym.gov.tr', 'https://yokatlas.yok.gov.tr'),
  (2025, '200310901', 'Gazi Universitesi', 'Devlet', 'Saglik Hizmetleri Meslek Yuksekokulu', 'Anestezi', 'onlisans', 'Ankara', 'TYT', 'Orgun', 0, 'Turkce', 120, 98000, 391.50, 'https://www.osym.gov.tr', 'https://yokatlas.yok.gov.tr'),
  (2025, '202210772', 'Ege Universitesi', 'Devlet', 'Ege Meslek Yuksekokulu', 'Bilgisayar Programciligi', 'onlisans', 'Izmir', 'TYT', 'Orgun', 0, 'Turkce', 100, 145000, 374.20, 'https://www.osym.gov.tr', 'https://yokatlas.yok.gov.tr'),
  (2025, '203110804', 'Istanbul Aydin Universitesi', 'Vakif', 'Anadolu Bil Meslek Yuksekokulu', 'Ucak Teknolojisi', 'onlisans', 'Istanbul', 'TYT', 'Orgun', 50, 'Turkce', 80, 225000, 353.80, 'https://www.osym.gov.tr', 'https://yokatlas.yok.gov.tr'),
  (2025, '203110805', 'Istanbul Aydin Universitesi', 'Vakif', 'Anadolu Bil Meslek Yuksekokulu', 'Ascilik', 'onlisans', 'Istanbul', 'TYT', 'Orgun', 50, 'Turkce', 60, 305000, 338.20, 'https://www.osym.gov.tr', 'https://yokatlas.yok.gov.tr')
ON CONFLICT (year, program_code) DO UPDATE SET
  university_name = EXCLUDED.university_name,
  university_type = EXCLUDED.university_type,
  faculty_or_school = EXCLUDED.faculty_or_school,
  program_name = EXCLUDED.program_name,
  level = EXCLUDED.level,
  city = EXCLUDED.city,
  score_type = EXCLUDED.score_type,
  teaching_type = EXCLUDED.teaching_type,
  scholarship_rate = EXCLUDED.scholarship_rate,
  instruction_language = EXCLUDED.instruction_language,
  quota_total = EXCLUDED.quota_total,
  base_rank = EXCLUDED.base_rank,
  base_score = EXCLUDED.base_score,
  source_url_osym = EXCLUDED.source_url_osym,
  source_url_yokatlas = EXCLUDED.source_url_yokatlas;

-- ============================================
-- chat_users (sohbet girişi — ChatLogin upsert)
-- Ayrıca: supabase/migrations/20260406120000_chat_users.sql
-- ============================================
CREATE TABLE IF NOT EXISTS public.chat_users (
  tc_number TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.chat_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "chat_users_select" ON public.chat_users;
DROP POLICY IF EXISTS "chat_users_insert" ON public.chat_users;
DROP POLICY IF EXISTS "chat_users_update" ON public.chat_users;

CREATE POLICY "chat_users_select" ON public.chat_users FOR SELECT USING (true);
CREATE POLICY "chat_users_insert" ON public.chat_users FOR INSERT WITH CHECK (true);
CREATE POLICY "chat_users_update" ON public.chat_users FOR UPDATE USING (true) WITH CHECK (true);
