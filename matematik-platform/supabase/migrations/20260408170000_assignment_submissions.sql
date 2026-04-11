-- ============================================
-- assignments Tablosu Güncelleme
-- ============================================
ALTER TABLE public.assignments ADD COLUMN IF NOT EXISTS due_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.assignments ADD COLUMN IF NOT EXISTS grade INTEGER;

-- ============================================
-- assignment_submissions Tablosu
-- ============================================
CREATE TABLE IF NOT EXISTS public.assignment_submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    assignment_id UUID REFERENCES public.assignments(id) ON DELETE CASCADE NOT NULL,
    student_id UUID NOT NULL,
    student_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    comment TEXT,
    status TEXT DEFAULT 'pending', -- 'pending', 'reviewed'
    grade INTEGER,
    feedback TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- RLS Etkinleştirme
ALTER TABLE public.assignment_submissions ENABLE ROW LEVEL SECURITY;

-- Politikalar
DROP POLICY IF EXISTS "submissions_select_own" ON public.assignment_submissions;
CREATE POLICY "submissions_select_own" ON public.assignment_submissions
    FOR SELECT USING (auth.uid() = student_id);

DROP POLICY IF EXISTS "submissions_insert_own" ON public.assignment_submissions;
CREATE POLICY "submissions_insert_own" ON public.assignment_submissions
    FOR INSERT WITH CHECK (auth.uid() = student_id);

-- Admin tüm teslimatları görebilir ve güncelleyebilir (puan/feedback)
DROP POLICY IF EXISTS "submissions_admin_all" ON public.assignment_submissions;
CREATE POLICY "submissions_admin_all" ON public.assignment_submissions
    FOR ALL USING (
        auth.jwt() ->> 'email' IN ('admin@ugurhoca.com')
    );

-- ============================================
-- Storage: submissions Bucket
-- ============================================

-- Bucket oluşturma (Eğer yoksa)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('submissions', 'submissions', false)
ON CONFLICT (id) DO NOTHING;

-- Storage Politikaları
-- 1. Öğrenciler kendi dosyalarını yükleyebilir
CREATE POLICY "submissions_student_upload" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'submissions' AND 
        (auth.uid())::text = (storage.foldername(name))[1]
    );

-- 2. Öğrenciler kendi dosyalarını görebilir
CREATE POLICY "submissions_student_select" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'submissions' AND 
        (auth.uid())::text = (storage.foldername(name))[1]
    );

-- 3. Admin tüm dosyaları görebilir
CREATE POLICY "submissions_admin_select" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'submissions' AND 
        (auth.jwt() ->> 'email' IN ('admin@ugurhoca.com'))
    );
