-- profiles tablosuna avatar_id ekle
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_id text;
