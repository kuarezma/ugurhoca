-- ============================================
-- 1. Profiles Güncellemeleri (Streak Sistemi)
-- ============================================
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS current_streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_active_date DATE DEFAULT CURRENT_DATE;

-- ============================================
-- 2. user_badges Tablosu (Rozetler)
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_badges (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    badge_type TEXT NOT NULL, -- 'first_blood', 'streak_3', 'mastery_100', vb.
    badge_name TEXT NOT NULL,
    icon_name TEXT NOT NULL,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(user_id, badge_type)
);

ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_badges_select_own" ON public.user_badges;
CREATE POLICY "user_badges_select_own" ON public.user_badges
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_badges_admin_all" ON public.user_badges;
CREATE POLICY "user_badges_admin_all" ON public.user_badges
    FOR ALL USING (auth.jwt() ->> 'email' IN ('admin@ugurhoca.com', 'admin@matematiklab.com'));

-- ============================================
-- 3. Otomasyon: Test Bitirince Çalışan Tetikleyici
-- Öğrenci test bitirdiğinde (quiz_results INSERT), otomatik olarak
-- study_sessions tablosuna kayıt atılır ve mastery_level güncellenebilir.
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_quiz_result_insert()
RETURNS trigger AS $$
DECLARE
    q_title TEXT;
    q_topic TEXT;
    old_mastery INTEGER;
    new_mastery INTEGER;
BEGIN
    -- 1. Quiz başlığını bul
    SELECT title INTO q_title FROM public.quizzes WHERE id = NEW.quiz_id;
    
    -- 2. Çok basit bir konu tahmini yap, yoksa "Genel Test" de
    IF q_title ILIKE '%üslü%' THEN q_topic := 'Üslü İfadeler';
    ELSIF q_title ILIKE '%karekök%' OR q_title ILIKE '%köklü%' THEN q_topic := 'Kareköklü İfadeler';
    ELSIF q_title ILIKE '%çarpan%' THEN q_topic := 'Çarpanlar ve Katlar';
    ELSIF q_title ILIKE '%olasılık%' THEN q_topic := 'Olasılık';
    ELSIF q_title ILIKE '%veri%' THEN q_topic := 'Veri Analizi';
    ELSIF q_title ILIKE '%üçgen%' THEN q_topic := 'Üçgenler';
    ELSE q_topic := 'Doğrusal Denklemler'; -- Varsayılanlardan biri
    END IF;

    -- 3. Study Session (Çalışma Oturumu) at (1 Soru = Ortalama 2 Dakika diyelim)
    INSERT INTO public.study_sessions (user_id, activity_type, duration, topics)
    VALUES (NEW.user_id, 'test', NEW.total_questions * 2, ARRAY[q_topic]);

    -- 4. User Progress (Mastery Level) güncelle
    SELECT mastery_level INTO old_mastery FROM public.user_progress 
    WHERE user_id = NEW.user_id AND topic = q_topic LIMIT 1;
    
    IF old_mastery IS NULL THEN
        old_mastery := 0;
    END IF;
    
    -- Her doğru cevap +2 ustalık puanı, max 100
    new_mastery := LEAST(100, old_mastery + (NEW.score / 10 * 2));
    
    INSERT INTO public.user_progress (user_id, topic, mastery_level, practice_count, last_practiced)
    VALUES (NEW.user_id, q_topic, new_mastery, 1, now())
    ON CONFLICT (user_id, topic) DO UPDATE 
    SET mastery_level = EXCLUDED.mastery_level,
        practice_count = user_progress.practice_count + 1,
        last_practiced = now();

    -- 5. Streak Güncelleme
    UPDATE public.profiles
    SET current_streak = CASE 
            WHEN last_active_date = CURRENT_DATE THEN current_streak -- Bugün zaten çalışmış
            WHEN last_active_date = CURRENT_DATE - INTERVAL '1 day' THEN current_streak + 1 -- Dün çalışmış, streak artar
            ELSE 1 -- Çok ara vermiş, baştan başlar
        END,
        last_active_date = CURRENT_DATE
    WHERE id = NEW.user_id;

    -- 6. İlk test rozeti ataması (Daha önce almadıysa)
    INSERT INTO public.user_badges (user_id, badge_type, badge_name, icon_name)
    VALUES (NEW.user_id, 'first_blood', 'İlk Adım', 'Target')
    ON CONFLICT (user_id, badge_type) DO NOTHING;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger'ı bağla
DROP TRIGGER IF EXISTS on_quiz_result_insert ON public.quiz_results;
CREATE TRIGGER on_quiz_result_insert
    AFTER INSERT ON public.quiz_results
    FOR EACH ROW EXECUTE FUNCTION public.handle_quiz_result_insert();
