-- Admin panelinde öğrencileri hızlı erişim için favorileme alanı.
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS is_favorite boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS profiles_is_favorite_idx
ON public.profiles (is_favorite)
WHERE is_favorite = true;
