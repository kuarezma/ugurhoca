-- Create game_scores table
CREATE TABLE IF NOT EXISTS public.game_scores (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    user_name TEXT,
    game_id INT,
    score INT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.game_scores ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Kullanıcılar tüm skorları görebilir" ON public.game_scores;
DROP POLICY IF EXISTS "Kullanıcılar kendi skorlarını ekleyebilir" ON public.game_scores;

-- Policies
CREATE POLICY "Kullanıcılar tüm skorları görebilir" 
ON public.game_scores FOR SELECT 
USING (true);

CREATE POLICY "Kullanıcılar kendi skorlarını ekleyebilir" 
ON public.game_scores FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create Global Leaderboard View for performance and simplicity
CREATE OR REPLACE VIEW public.global_leaderboard AS
SELECT 
    user_id,
    user_name,
    SUM(score) as total_score
FROM public.game_scores
GROUP BY user_id, user_name
ORDER BY total_score DESC
LIMIT 50;

-- Grant permissions
GRANT SELECT ON public.game_scores TO anon, authenticated;
GRANT SELECT ON public.global_leaderboard TO anon, authenticated;
