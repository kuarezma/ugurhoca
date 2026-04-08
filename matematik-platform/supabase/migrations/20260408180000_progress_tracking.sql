-- ============================================
-- 1. study_sessions (Çalışma Oturumları) Tablosu
-- Öğrencinin harcadığı zaman ve çalıştığı konular.
-- ============================================
CREATE TABLE IF NOT EXISTS public.study_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    activity_type TEXT NOT NULL, -- 'test', 'video', 'kitap', 'not', 'diger'
    duration INTEGER NOT NULL, -- Dakika cinsinden
    topics TEXT[] DEFAULT '{}', -- ['Üslü Sayılar', 'Karekök']
    date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "study_sessions_select_own" ON public.study_sessions;
CREATE POLICY "study_sessions_select_own" ON public.study_sessions
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "study_sessions_insert_own" ON public.study_sessions;
CREATE POLICY "study_sessions_insert_own" ON public.study_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "study_sessions_admin_all" ON public.study_sessions;
CREATE POLICY "study_sessions_admin_all" ON public.study_sessions
    FOR ALL USING (auth.jwt() ->> 'email' IN ('admin@ugurhoca.com', 'admin@matematiklab.com'));

-- ============================================
-- 2. user_progress (Kullanıcı Konu İlerlemesi)
-- Konu bazlı yeterlilik ve pratik yüzdesi.
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    topic TEXT NOT NULL,
    mastery_level INTEGER DEFAULT 0, -- 0-100 arası (Konu hakimiyeti)
    practice_count INTEGER DEFAULT 0, -- O konuda kaç kez test/çalışma yaptı
    last_practiced TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(user_id, topic)
);

ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_progress_select_own" ON public.user_progress;
CREATE POLICY "user_progress_select_own" ON public.user_progress
    FOR SELECT USING (auth.uid() = user_id);

-- Öğrencinin progress'ini update veya insert etmesi için
DROP POLICY IF EXISTS "user_progress_upsert_own" ON public.user_progress;
CREATE POLICY "user_progress_upsert_own" ON public.user_progress
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_progress_update_own" ON public.user_progress;
CREATE POLICY "user_progress_update_own" ON public.user_progress
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_progress_admin_all" ON public.user_progress;
CREATE POLICY "user_progress_admin_all" ON public.user_progress
    FOR ALL USING (auth.jwt() ->> 'email' IN ('admin@ugurhoca.com', 'admin@matematiklab.com'));

-- ============================================
-- 3. study_goals (Bağımsız Haftalık Hedefler)
-- Öğrenci "Bu hafta 300 dk çalışacağım" diyebilir.
-- ============================================
CREATE TABLE IF NOT EXISTS public.study_goals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    target_duration INTEGER DEFAULT 600, -- Haftalık hedef dakika (ör. 600 dk = 10 saat)
    week_start DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(user_id, week_start)
);

ALTER TABLE public.study_goals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "study_goals_select_own" ON public.study_goals;
CREATE POLICY "study_goals_select_own" ON public.study_goals
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "study_goals_upsert_own" ON public.study_goals;
CREATE POLICY "study_goals_upsert_own" ON public.study_goals
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "study_goals_update_own" ON public.study_goals;
CREATE POLICY "study_goals_update_own" ON public.study_goals
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "study_goals_admin_all" ON public.study_goals;
CREATE POLICY "study_goals_admin_all" ON public.study_goals
    FOR ALL USING (auth.jwt() ->> 'email' IN ('admin@ugurhoca.com', 'admin@matematiklab.com'));
